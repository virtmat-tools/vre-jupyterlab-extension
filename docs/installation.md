# Installation

Recommended (PyPI):

```bash
pip install vre-jupyterlab-extension
jupyter lab
```

Developer / build from source:

```bash
# build frontend assets and Python wheel
cd packages/vre-jupyterlab-extension
npm ci
npm run build
python -m pip install --upgrade build
python -m build --wheel --sdist
python -m pip install dist/vre_jupyterlab_extension-*.whl
```

If you use this from other repos, add the package to `requirements.txt`:

```
vre-jupyterlab-extension==0.1.3
```

After installing, start JupyterLab:

```bash
jupyter lab
```

The extension will be automatically loaded and available in JupyterLab.
