# Installation Guide

The VRE JupyterLab Extension is distributed as a prebuilt extension. This architectural decision ensures that end users do not need `Node.js`, `npm`, or `yarn` installed on their systems. The frontend assets are pre-compiled and bundled directly within the Python wheel.

## Prerequisites

Ensure your environment meets the following minimum requirements before proceeding:

*   Python 3.8 or higher
*   JupyterLab 4.2.0 to 4.9.9 (`jupyterlab>=4.2,<5`)

## Standard Installation

To install the extension from the Python Package Index (PyPI), execute the following command in your terminal or virtual environment:

```bash
pip install vre-jupyterlab-extension
```

Upon successful installation, the JupyterLab server will automatically detect the extension via the provided `install.json` and static asset directories bundled in the wheel.

## Verifying the Installation

To confirm that the extension has been successfully registered with JupyterLab, run the extension list command:

```bash
jupyter labextension list
```

You should see `vre-jupyterlab-extension` listed with a status of `OK` and `enabled`.

Once verified, you may start your JupyterLab instance:

```bash
jupyter lab
```

## Uninstallation

To remove the extension from your environment, simply uninstall the Python package. JupyterLab will automatically unregister the frontend assets during its next initialization sequence.

```bash
pip uninstall vre-jupyterlab-extension
```
