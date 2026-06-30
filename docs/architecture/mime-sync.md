# Architecture: MIME Synchronization

This document explains the mechanism by which the extension ensures JupyterLab correctly identifies code cells as containing the VRE DSL, rather than defaulting to standard text or Python highlighting.

## The Problem

When a user creates a Jupyter notebook, each cell is assigned a specific language. This assignment dictates how the cell is executed, how the syntax is highlighted, and how language servers interact with the cell contents.

By default, if the kernel is not strictly defined out-of-the-box, JupyterLab may fall back to `'text/plain'` or maintain a cached MIME type (like `'text/x-python'`) from a previous session. For VRE features to work correctly, the cells must be assigned the exact `'text/x-vre'` MIME type.

## Deep Dive: `mime-sync.ts`

The extension handles this dynamically within `src/notebook/mime-sync.ts`. The process occurs whenever a notebook is opened, closed, altered, or its kernel changes.

### 1. Identifying the Target Kernel

Before coercing any MIME types, the extension must prove that the active notebook is connected to a VRE kernel. If a user opens a standard Python 3 kernel, the extension absolutely must leave the MIME types untouched.

The verification takes place inside `isVreKernel(panel: NotebookPanel)`:

```typescript
export function isVreKernel(panel: NotebookPanel): boolean {
  const pref = panel.sessionContext.kernelPreference || {};
  const kernelName = (panel.sessionContext.session?.kernel?.name || pref.name || '').toLowerCase();
  const displayName = (panel.sessionContext.kernelDisplayName || '').toLowerCase();
  const langName = (pref.language || '').toLowerCase();
  
  return (
    kernelName === 'vre-language' ||
    kernelName.includes('vre') ||
    displayName.includes('vre') ||
    langName.includes('vre') ||
    langName.includes('virtmat')
  );
}
```

This function aggressively checks all possible meta-information the kernel exposes to JupyterLab. If none of these properties match the signature of a Virtual Materials framework, it bails out, preventing false positives on standard Python kernels.

### 2. Forcing the MIME Type

If the notebook is verified as a VRE instance, the synchronization loop fires. It iterates over every `cell` present in the `Notebook` widget.

```typescript
const mimeType = 'text/x-vre';

notebook.widgets.forEach(cell => {
  if (cell.model.type === 'code') {
    const currentMime = cell.model.mimeType;
    if (currentMime !== mimeType) {
      cell.model.mimeType = mimeType;
    }
  }
});
```

Because `cell.model` is heavily bound to JupyterLab's reactive signaling system, manually overriding the `mimeType` property triggers an event that propagates to the CodeMirror editor component for that cell. The editor then looks up the registry, finds the `'text/x-vre'` language we registered in `index.ts`, and applies the VRE Lexer discussed in the Syntax Highlighting documentation.

### 3. Real-Time Triggers

To guarantee the notebook remains synchronized even during long-lived sessions, the extension binds to three critical signals:

1.  **`panel.sessionContext.kernelChanged`**: Triggered when a user switches the kernel via the top-right kernel selector menu. If they switch from Python to VRE, the cells are immediately converted to VRE MIME.
2.  **`panel.content.modelContentChanged`**: Triggered when the overall document model changes (e.g., when the notebook is first populated with cells upon loading).
3.  **`panel.content.activeCellChanged`**: Triggered when the user clicks between cells or adds a new cell. This catches dynamically generated cells that might otherwise spawn with a default MIME type.
