# vre-jupyterlab-extension

This page collects extension-specific notes:

## Overview

- The package is a prebuilt JupyterLab extension. The wheel contains `labextension/` and `install.json` so users do not need Node tooling to install the extension.
- Runtime requirement: `jupyterlab>=4.2,<5`.
- Supports Python 3.10, 3.11, 3.12.

## Features

- CodeMirror 6 syntax highlighting for the VRE DSL.
- Execution guard for VRE notebook cells.
- Settings integration for language and execution customization.

## Developer Notes

### Building

- The `setup.py` copies the `labextension/` folder and `install.json` into the Python package during wheel build.
- Use `npm run build` (from the package folder) before building the wheel.

### Testing

Run unit tests:

```bash
npm run ci
```

### Release

See [RELEASE.md](../RELEASE.md) for detailed release instructions.

## Contributing

Contributions are welcome. Please open an issue or pull request on GitHub.

## License

BSD-3-Clause
