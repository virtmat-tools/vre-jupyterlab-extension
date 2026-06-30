<div align="center">
  <img src="https://raw.githubusercontent.com/virtmat-tools/vre-jupyterlab-extension/refs/heads/main/style/vre-logo.png" alt="VRE logo" width="128" />

  # VRE JupyterLab Extension

  [![CI](https://github.com/virtmat-tools/vre-jupyterlab-extension/actions/workflows/extension-pr-ci.yml/badge.svg)](https://github.com/virtmat-tools/vre-jupyterlab-extension/actions/workflows/extension-pr-ci.yml)
  [![PyPI Version](https://img.shields.io/pypi/v/vre-jupyterlab-extension.svg?color=blue)](https://pypi.org/project/vre-jupyterlab-extension)
  [![Downloads](https://static.pepy.tech/badge/vre-jupyterlab-extension)](https://pepy.tech/projects/vre-jupyterlab-extension)
  [![JupyterLab 4](https://img.shields.io/badge/JupyterLab-4.x-F37626?logo=jupyter)](https://jupyterlab.readthedocs.io/en/stable/)
  [![Docs](https://img.shields.io/badge/Docs-GitHub%20Pages-green)](https://virtmat-tools.github.io/vre-jupyterlab-extension/)
  [![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](LICENSE)
</div>

<br />

> A prebuilt **JupyterLab 4** extension that provides advanced **CodeMirror 6 highlighting** for the VRE DSL and a smart **execution guard** to protect your VRE kernels.

---

## 🚀 Quick Install

No Node tooling required! The provided wheel embeds the prebuilt labextension assets so you can jump right into your environment.

```bash
pip install vre-jupyterlab-extension
jupyter lab
```

## 🛠️ Developer / Build from Source

To hack on the extension, install the local dependencies, compile the frontend, and pack the wheel:

```bash
# 1. Setup the project
cd packages/vre-jupyterlab-extension
npm ci

# 2. Build the frontend bundle
npm run build:prod

# 3. Build the Python distribution packages (.whl, .tar.gz)
python3 -m pip install --upgrade build
python3 -m build --wheel --sdist

# 4. Install your local wheel
pip install dist/vre_jupyterlab_extension-*.whl
```

## 📦 Releases

We provide a streamlined release script to handle versions, clean artifacts, and generate the final distribution files:

```bash
cd packages/vre-jupyterlab-extension
npm run release
```
*Tip: Always use this tool rather than building manually for releases to ensure `package.json`, `setup.cfg`, and `__init__.py` versions stay perfectly synchronized.*

## 📚 Documentation & Resources

- 📖 **[Full Documentation](https://virtmat-tools.github.io/vre-jupyterlab-extension/)**
- 🐍 **[PyPI Project Page](https://pypi.org/project/vre-jupyterlab-extension/)**

*Local documentation development:* run `mkdocs serve` from this directory after installing `requirements_docs.txt`.

## ⚙️ Requirements

- `jupyterlab>=4.2,<5`

## 📝 License

Distributed under the **BSD-3-Clause** License. See `LICENSE` for more information.
