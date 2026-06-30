# Release Process

This document outlines the standard operating procedure for releasing a new version of the VRE JupyterLab Extension. The process relies on a package-local automation script to minimize human error and ensure consistency across version manifests.

## Pre-Release Requirements

Before initiating a release, ensure that:
1.  All code changes have been reviewed and merged into the main branch.
2.  Continuous Integration (CI) checks are passing.
3.  The local working directory is clean (no uncommitted changes).

## The Release Script

A custom Python script is provided at `scripts/release.py`. This script automates the tedious aspects of the release lifecycle.

To execute the release flow, run:

```bash
cd packages/vre-jupyterlab-extension
npm run release
```

### Script Operations

The `release.py` script performs the following sequence of operations:

1.  **Version Prompting:** Prompts the developer for the new semantic version (e.g., `0.2.0`).
2.  **Manifest Updating:** Automatically updates the version strings in `package.json`, `setup.cfg`, `pyproject.toml`, and `vre_jupyterlab_extension/__init__.py`.
3.  **Artifact Cleaning:** Deletes old build directories (`dist`, `build`, `lib`, `labextension`, `*.egg-info`) to guarantee a pristine build environment.
4.  **Dependency Synchronization:** Executes `npm ci` to ensure exactly matching dependencies as specified in `package-lock.json`.
5.  **Frontend Compilation:** Runs `npm run build:prod` to generate the minified JupyterLab assets.
6.  **Distribution Generation:** Invokes the Python `build` module in an isolated environment (`python3 -m build --wheel --sdist`) to produce the final `.whl` and `.tar.gz` artifacts in the `dist/` directory.

## Publishing to PyPI

Once the release script completes successfully, verify the contents of the `dist/` directory. If the artifacts are sound, they can be uploaded to the Python Package Index.

If automated publishing via GitHub Actions is configured, you simply need to commit the version changes and push a signed git tag:

```bash
git add package.json setup.cfg pyproject.toml vre_jupyterlab_extension/__init__.py
git commit -m "chore: release version 0.2.0"
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

The CI/CD pipeline will intercept the tag push and handle authentication and uploading to PyPI automatically.
