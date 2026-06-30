# VRE JupyterLab Extension

<div style="text-align: center; margin-top: 3rem; margin-bottom: 3rem;">
  <img src="https://raw.githubusercontent.com/virtmat-tools/vre-jupyterlab-extension/refs/heads/main/style/vre-logo.png" alt="VRE Logo" width="160" />
  <h2>Robust Syntax Highlighting & Execution Guarding</h2>
  
  <p style="font-size: 1.2rem; color: var(--md-default-fg-color--light);">A zero-configuration, pip-installable JupyterLab 4 extension built for the Virtual Research Environment.</p>

  <a class="md-button md-button--primary" href="installation/" style="margin-right: 1rem;">Get Started</a>
  <a class="md-button" href="architecture/project-structure/">Read the Docs</a>
</div>

---

## Core Capabilities

<div class="grid cards" markdown>

-   :material-code-json: **Syntax Highlighting**

    Leverages CodeMirror 6 to provide semantic highlighting for VRE DSL constructs, custom keywords, and measurement units.

-   :material-shield-lock: **Execution Guard**

    Employs an intelligent interception layer that prevents code cells within VRE notebooks from being edited or executed concurrently.

-   :material-sync: **MIME Type Synchronization**

    Automatically coerces cell outputs and inputs to `text/x-vre` when connected to a VRE language kernel.

-   :material-package-variant-closed: **Prebuilt Assets**

    Bundles all required frontend assets directly inside the Python distribution wheel. No Node.js required for end-users.

</div>
