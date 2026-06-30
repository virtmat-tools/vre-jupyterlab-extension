# Development Setup

This guide details the procedures required to set up a local development environment for the VRE JupyterLab Extension. The project utilizes a monorepo-style structure and relies on `npm` for frontend dependency management and `build` for Python distribution.

## Environment Preparation

You will need the following toolchain installed on your workstation:

*   Python 3.10 or higher
*   Node.js (v18 or v20 recommended)
*   npm (v9 or higher)

It is highly recommended to isolate your Python environment using a virtual environment (e.g., `venv` or `conda`).

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
```

## Installing Dependencies

Navigate to the extension package directory and install the necessary Node.js dependencies.

```bash
cd packages/vre-jupyterlab-extension
npm ci
```

## Frontend Compilation

The extension's TypeScript source code must be compiled into JavaScript, and subsequently bundled via Webpack for JupyterLab to consume.

To perform a complete production build:

```bash
npm run build:prod
```

During active development, you may prefer to use the watch mode, which automatically recompiles the TypeScript sources upon modification:

```bash
npm run watch
```

*Note: Changes to the underlying Webpack configuration or JupyterLab extension metadata will require a full rebuild and potentially a JupyterLab server restart.*

## Symlinking for Local Testing

To test the extension within a local JupyterLab instance without repeatedly building and installing Python wheels, you can create a symbolic link to the development directory.

```bash
pip install -e .
jupyter labextension develop . --overwrite
```

When running in this mode, you can execute `jupyter lab` in a separate terminal. If you are running `npm run watch`, you simply need to refresh your browser window to observe changes in the frontend logic.
