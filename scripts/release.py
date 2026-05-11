#!/usr/bin/env python3
"""Package-local release helper: update package version, clean builds, and rebuild.

Run this from `packages/vre-jupyterlab-extension` or via `npm run release`.
It prompts for a new semantic version, updates `package.json`, `setup.cfg`, `__init__.py`, and
`pyproject.toml`, cleans build artifacts, installs package-local deps, runs `npm run build:prod`,
and builds the Python wheel/sdist.
"""
import json
import re
import shutil
import subprocess
from configparser import ConfigParser
from pathlib import Path


ROOT = Path(__file__).parent.parent.resolve()


def ask_version():
    v = input("New version (semver, e.g. 0.2.0): ").strip()
    if not re.match(r"^\d+\.\d+\.\d+([a-zA-Z0-9.-]+)?$", v):
        print("Version doesn't look like semver. Aborting.")
        raise SystemExit(1)
    return v


def update_setup_cfg(path: Path, version: str) -> bool:
    cfg = ConfigParser()
    cfg.read(path)
    changed = False
    if cfg.has_section("metadata"):
        old = cfg.get("metadata", "version", fallback=None)
        if old != version:
            cfg.set("metadata", "version", version)
            with open(path, "w", encoding="utf8") as f:
                cfg.write(f)
            changed = True
    return changed


def update_package_json(path: Path, version: str) -> bool:
    data = json.loads(path.read_text(encoding="utf8"))
    old = data.get("version")
    if old != version:
        data["version"] = version
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
        return True
    return False


def update_init_version(path: Path, version: str) -> bool:
    text = path.read_text(encoding="utf8")
    new_text, n = re.subn(r"__version__\s*=\s*['\"][^'\"]+['\"]", f"__version__ = \"{version}\"", text)
    if n and new_text != text:
        path.write_text(new_text, encoding="utf8")
        return True
    return False


def update_pyproject_toml(path: Path, version: str) -> bool:
    if not path.exists():
        return False
    text = path.read_text(encoding="utf8")
    new_text, n = re.subn(r"^version\s*=\s*\"[^\"]+\"", f'version = "{version}"', text, flags=re.M)
    if n and new_text != text:
        path.write_text(new_text, encoding="utf8")
        return True
    return False


def rm_rf(path: Path):
    if path.exists():
        if path.is_dir():
            shutil.rmtree(path)
        else:
            path.unlink()


def run(cmd, cwd=None, check=True):
    print("$", " ".join(cmd))
    try:
        subprocess.run(cmd, cwd=cwd or ROOT, check=check)
    except subprocess.CalledProcessError as e:
        print(f"Error: Command failed with exit code {e.returncode}")
        raise


def python_cmd() -> str:
    venv_python = ROOT / ".venv" / "bin" / "python"
    if venv_python.exists():
        return str(venv_python)
    return "python3"


def clean_builds(root: Path):
    patterns = [
        "dist",
        "build",
        "*.egg-info",
        "lib",
        "labextension",
        "vre_jupyterlab_extension/labextension",
        "tsconfig.tsbuildinfo",
    ]
    for p in patterns:
        for match in root.glob(p):
            rm_rf(match)
        for match in root.glob(p + "*"):
            rm_rf(match)


def install_package_deps(root: Path):
    # Keep release flow package-local so it works without monorepo root files.
    # Regenerate lockfile if it was missing so npm ci remains reproducible.
    lockfile = root / "package-lock.json"
    if not lockfile.exists():
        run(["npm", "install", "--package-lock-only", "--ignore-scripts"], cwd=root, check=True)
    run(["npm", "ci"], cwd=root, check=True)


def build_frontend(root: Path):
    # This repository is npm-lock based; prefer npm to avoid jlpm/yarn lock drift.
    try:
        run(["npm", "run", "build:prod"], cwd=root, check=True)
        return
    except subprocess.CalledProcessError:
        if shutil.which("jlpm"):
            run(["jlpm", "build:prod"], cwd=root, check=True)
            return
        raise


def main():
    version = ask_version()

    changed = []

    setup_cfg = ROOT / "setup.cfg"
    if setup_cfg.exists() and update_setup_cfg(setup_cfg, version):
        changed.append(str(setup_cfg))

    pkg_json = ROOT / "package.json"
    if pkg_json.exists() and update_package_json(pkg_json, version):
        changed.append(str(pkg_json))

    init_py = ROOT / "vre_jupyterlab_extension" / "__init__.py"
    if init_py.exists() and update_init_version(init_py, version):
        changed.append(str(init_py))

    pyproj = ROOT / "pyproject.toml"
    if pyproj.exists() and update_pyproject_toml(pyproj, version):
        changed.append(str(pyproj))

    print("Updated files:", changed)

    print("Cleaning build artifacts in extension package...")
    clean_builds(ROOT)

    print("Installing package-local Node dependencies with npm ci...")
    install_package_deps(ROOT)

    print("Building frontend with jlpm build:prod when available...")
    build_frontend(ROOT)

    print("Building Python distributions (wheel and sdist)...")
    py = python_cmd()
    run([py, "-m", "pip", "install", "--upgrade", "build"])
    run([py, "-m", "build", "--wheel", "--sdist"], cwd=ROOT)

    print("Release flow completed. Commit and tag if desired.")
    print(f"  Dist artifacts in: {ROOT / 'dist'}")
    print(f"  Tagged as: v{version}")


if __name__ == "__main__":
    main()
