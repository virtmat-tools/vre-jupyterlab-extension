# Project Structure and Dependencies

This document provides an in-depth breakdown of the directory layout, core files, and technical dependencies that power the VRE JupyterLab Extension.

## Core Dependencies

The extension is fundamentally a hybrid system comprising a Python packaging layer and a TypeScript frontend execution layer.

### Frontend (Node.js/TypeScript) Dependencies

Located in `package.json`, the extension utilizes the following primary dependencies:

*   **`@jupyterlab/application` & `@jupyterlab/apputils`**: Provides the fundamental core abstractions to inject custom behaviors, commands, and logic into the JupyterLab frontend shell.
*   **`@jupyterlab/notebook`**: Grants access to the `NotebookTracker`, the `NotebookPanel`, and `NotebookActions`. This is critical for intercepting user cell executions and reading notebook cell states.
*   **`@jupyterlab/codemirror`**: The primary interface for registering custom CodeMirror 6 language grammars within JupyterLab's text editor instances.
*   **`@codemirror/language`, `@codemirror/state`, `@codemirror/view`**: The underlying CodeMirror 6 libraries used to construct the Lexer, parse tokens, define styles, and manage the internal editor state for the VRE DSL.

### Backend (Python) Dependencies

Located in `pyproject.toml` and `setup.cfg`, the Python distribution requires:

*   **`jupyterlab (>=4.2,<5)`**: The core requirement ensuring compatibility with JupyterLab 4.x APIs.
*   **`hatchling` & `hatch-jupyter-builder`**: The modern, isolated PEP 517 build backends responsible for executing the Node.js Webpack compilation during the Python wheel packaging phase.

## File System Breakdown

The repository is structured to seamlessly separate the build pipeline from the business logic.

```text
vre-jupyterlab-extension/
├── pyproject.toml               # Python build system metadata (hatchling config).
├── setup.cfg                    # Legacy setup configuration for compatibility.
├── package.json                 # Node.js dependencies, scripts, and JupyterLab metadata.
├── tsconfig.json                # TypeScript compiler configuration.
├── scripts/
│   └── release.py               # Custom Python script for automated semver releases.
├── style/
│   ├── index.css                # Primary stylesheet imported by JupyterLab.
│   ├── base.css                 # Core CSS variables and generic layout rules.
│   ├── logo.css                 # CSS targeting the command palette VRE icon.
│   ├── readonly.css             # CSS governing the visual lockdown of executed cells.
│   └── vre-logo.png             # The VRE organization logo.
├── vre_jupyterlab_extension/    # The Python package directory.
│   └── __init__.py              # Python entrypoint, defines _jupyter_labextension_paths.
└── src/                         # The TypeScript source code root.
    ├── index.ts                 # The `JupyterFrontEndPlugin` activation entrypoint.
    ├── config/                  # Static constants, default values, and DSL tokens.
    ├── execution/               # The Execution Guard subsystem (freeze logic).
    ├── language/                # CodeMirror 6 Lexer and syntax highlighting definition.
    └── notebook/                # Notebook MIME type synchronization logic.
```

### The Extension Entrypoint (`src/index.ts`)

The `index.ts` file exports a single `JupyterFrontEndPlugin<void>`. When JupyterLab boots, it invokes the `activate` function. This function performs three critical setup tasks:

1.  **Registers the VRE DSL Language**: It instantiates the CodeMirror language support built in `language/vre-language.ts` and maps it to the `'text/x-vre'` MIME type via the `IEditorLanguageRegistry`.
2.  **Hooks the Notebook Tracker**: It connects to `notebookTracker.widgetAdded`. For every newly opened notebook tab, it passes the resulting `NotebookPanel` instance into the execution guard and MIME synchronization subsystems.
3.  **Command Palette**: It registers toggle commands (e.g., toggling read-only CSS) into the JupyterLab command palette.
