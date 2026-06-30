# Architecture: Execution Guard

This document details the most complex and critical subsystem of the VRE JupyterLab Extension: **The Execution Guard**.

In the Virtual Research Environment (VRE) paradigm, it is an absolute requirement that cells are executed sequentially, and that once a cell is executed, its contents are immutable (read-only) to preserve mathematical and experimental provenance.

## The Architecture of the Guard

The guard logic is localized in `src/execution/execution-guard.ts`. It utilizes a dual-layer approach to guarantee cell lockdown: 
1. **Action Interception** (stopping JupyterLab from running the cell)
2. **Visual Lockdown** (stopping the user from editing the cell).

### 1. Action Interception (The Hard Block)

JupyterLab executes cells via a global event bus governed by `NotebookActions`. The VRE extension intercepts this process via a Monkey-Patching pattern.

When the extension initializes, it locates `NotebookActions.run`, `NotebookActions.runAndAdvance`, and `NotebookActions.runAndInsert`. It overrides the original implementations with a custom wrapper function.

When a user presses `Shift+Enter` (which triggers `runAndAdvance`):

1.  **Notebook Context Verification**: The wrapper analyzes the arguments passed to the function to locate the underlying `Notebook` widget.
2.  **MIME-Type Fast Path**: The wrapper calls `shouldGuardCell(cell)`. This function immediately inspects the cell's MIME type. If the `mimeType` is explicitly `text/x-python` or any other standard language, the wrapper instantly yields execution to the original JupyterLab code, allowing the Python execution to occur completely unimpeded.
3.  **State Evaluation**: If the cell is a VRE cell, the guard checks the cell's metadata dictionary for the key `"vre.executed"`.
    *   If `"vre.executed"` is `false` (or missing), the wrapper allows the execution to proceed, yielding to the original JupyterLab action.
    *   If `"vre.executed"` is `true`, the wrapper explicitly **blocks** the request. It forces a return of `false`, meaning the execution payload is never sent to the Jupyter kernel.

### 2. Event Payload Cancellation

Even if the monkey-patch fails (e.g., an external extension triggers execution directly via the kernel API), the guard listens to the `NotebookActions.executionScheduled` signal. 

If it detects that a scheduled cell already has a `"vre.executed": true` state, it intervenes by setting `payload.cancel = true`, thereby canceling the signal propagation.

### 3. Metadata and Visual Lockdown (The Soft Block)

When a cell successfully finishes execution (verified by listening to the `NotebookActions.executed` signal), the extension updates the cell's JSON metadata dictionary.

It injects a `vre.executionState` block containing timestamps, attempts, and success statuses, and sets the root key `"vre.executed": true`.

Once marked as executed, the visual lockdown subsystem (`setReadonlyAppearance`) is activated:

```typescript
cell.model.setMetadata('editable', false);
cell.model.setMetadata('deletable', false);
cell.readOnly = true;
```

This prevents the JupyterLab UI from allowing the user to type inside the cell or delete it via the right-click menu.

Furthermore, a custom CSS class (`v-Vre-ReadonlyCell`) is injected into the DOM of the cell widget. The rules defined in `style/readonly.css` apply a grey background and a "disabled" appearance to visually indicate to the user that the cell's provenance is now permanently sealed.

### 4. Auto-Cleanup of Corrupted States

Because earlier prototypes of this logic mistakenly leaked `"editable": false` metadata into Python notebooks, the `syncCellState` loop includes self-healing capabilities. 

If the notebook tracker opens a standard Python kernel, the extension actively scans the cells. If it finds any cell containing rogue `"vre.executed"` metadata or locked `editable` flags, it invokes `deleteMetadata(EXECUTION.metadataKey)` and restores `editable` to `true`. This guarantees that Python notebooks remain completely native and uncorrupted, even if a user switches their kernel back and forth between VRE and Python 3.
