"""Setup configuration for the JupyterLab extension using jupyter-packaging.

This file avoids importing submodules that may not exist during PEP 517
isolation and only uses `ensure_targets` to include the prebuilt assets.
"""

from pathlib import Path

from jupyter_packaging.setupbase import ensure_targets
from setuptools import setup
from setuptools.command.build_py import build_py as _build_py


class build_py(_build_py):
    """Ensure labextension and install.json are included in the wheel."""

    def run(self):
        ensure_targets([
            str(Path(__file__).parent / "vre_jupyterlab_extension" / "labextension"),
            str(Path(__file__).parent / "install.json"),
        ])
        super().run()


setup(cmdclass={"build_py": build_py})
