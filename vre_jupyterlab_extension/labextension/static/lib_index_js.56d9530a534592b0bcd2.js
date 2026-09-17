"use strict";
(self["webpackChunkvre_jupyterlab_extension"] = self["webpackChunkvre_jupyterlab_extension"] || []).push([["lib_index_js"],{

/***/ "./lib/config/constants.js"
/*!*********************************!*\
  !*** ./lib/config/constants.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   COMMANDS: () => (/* binding */ COMMANDS),
/* harmony export */   EXECUTION: () => (/* binding */ EXECUTION),
/* harmony export */   LANGUAGE: () => (/* binding */ LANGUAGE),
/* harmony export */   PLUGIN_ID: () => (/* binding */ PLUGIN_ID),
/* harmony export */   SETTINGS: () => (/* binding */ SETTINGS),
/* harmony export */   UI: () => (/* binding */ UI)
/* harmony export */ });
/** Unique JupyterLab plugin identifier. */
const PLUGIN_ID = 'vre-jupyterlab-extension:plugin';
/** Plugin setting keys used for persisted runtime toggles. */
const SETTINGS = {
    enabled: 'enabled',
    cellReadonlyDesignEnabled: 'cellReadonlyDesignEnabled'
};
/** Command IDs for user-facing plugin toggles. */
const COMMANDS = {
    toggleReadonlyDesign: `${PLUGIN_ID}:toggle-readonly-design`,
    toggleExtension: `${PLUGIN_ID}:toggle-extension`
};
/** UI constants used for icon styling hooks in command definitions. */
const UI = {
    logoIconClass: 'vre-jupyterlab-extension__logoIcon'
};
/** Language-related constants for VRE CodeMirror integration. */
const LANGUAGE = {
    mime: 'text/x-vre',
    defaultCodeMime: 'text/plain',
    kernelName: 'vre-language',
    extensionName: 'vre-jupyterlab-extension-language-support'
};
/** BEM-style class and metadata constants for execution guard visuals/state. */
const EXECUTION = {
    metadataKey: 'vre.executed',
    stateMetadataKey: 'vre.executionState',
    executedCellClass: 'vre-jupyterlab-extension__cell--executed',
    executedInputClass: 'vre-jupyterlab-extension__input-editor--executed',
    executedEditorClass: 'vre-jupyterlab-extension__cm-editor--executed'
};


/***/ },

/***/ "./lib/config/defaults.js"
/*!********************************!*\
  !*** ./lib/config/defaults.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_LANGUAGE_OPTIONS: () => (/* binding */ DEFAULT_LANGUAGE_OPTIONS)
/* harmony export */ });
const DEFAULT_LANGUAGE_OPTIONS = {
    // Domain-specific keywords (control flow, operations)
    keywords: [
        'else',
        'use',
        'from',
        'to',
        'with',
        'select',
        'file',
        'url',
        'where',
        'column',
        'chunks',
        'step',
        'lineplot',
        'on',
        'for',
        'task',
        'collinear',
        'normal',
        'structure',
        'many_to_one',
        'composition',
    ],
    // Built-in functions available in the language
    builtins: [
        'print',
        'view',
        'vary',
        'if',
        'real',
        'imag',
        'all',
        'any',
        'sum',
        'range',
        'map',
        'filter',
        'reduce',
        'info',
        'tag',
        'min',
        'max',
        'constr',
    ],
    // Type names
    types: [
        'String',
        'Quantity',
        'Bool',
        'Series',
        'Table',
        'BoolArray',
        'StrArray',
        'IntArray',
        'FloatArray',
        'ComplexArray',
    ],
    // Literal constants
    constants: ['true', 'false', 'null', 'default'],
    // Word-based operators
    wordOperators: ['not', 'and', 'or', 'in'],
    // TextM-specific domain types
    textMTypes: [
        'Structure',
        'Calculator',
        'Algorithm',
        'Property',
        'FixedAtoms',
        'FixedLine',
        'FixedPlane',
        'Species',
        'Reaction',
    ],
    // Post-colon property names used in the DSL
    specialProperties: ['array', 'columns'],
    // Unit keywords
    units: ['K', 'eV'],
};


/***/ },

/***/ "./lib/execution/execution-guard.js"
/*!******************************************!*\
  !*** ./lib/execution/execution-guard.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   activateExecutionGuard: () => (/* binding */ activateExecutionGuard),
/* harmony export */   refreshExecutionGuard: () => (/* binding */ refreshExecutionGuard)
/* harmony export */ });
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/notebook */ "webpack/sharing/consume/default/@jupyterlab/notebook");
/* harmony import */ var _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _config_constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../config/constants */ "./lib/config/constants.js");
/* harmony import */ var _freeze_state__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./freeze-state */ "./lib/execution/freeze-state.js");
/* harmony import */ var _notebook_mime_sync__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../notebook/mime-sync */ "./lib/notebook/mime-sync.js");





const notebookPanels = new WeakMap();
let hooksConnected = false;
let actionGuardsConnected = false;
/**
 * Read the active code cell from NotebookActions arguments.
 */
function readActiveCell(args) {
    for (const arg of args) {
        const notebook = arg;
        const cell = notebook?.activeCell;
        if (cell && cell.model?.type === 'code') {
            return cell;
        }
    }
    return null;
}
/**
 * Read the notebook model execution count for a cell.
 */
function readExecutionCount(cell) {
    const count = cell.model.executionCount;
    return typeof count === 'number' && Number.isFinite(count) ? count : null;
}
/**
 * Read the notebook model outputs for a cell.
 */
function readOutputItems(cell) {
    const outputs = cell.model.outputs;
    if (!outputs) {
        return [];
    }
    const length = typeof outputs.length === 'number' ? outputs.length : 0;
    const items = [];
    for (let i = 0; i < length; i += 1) {
        items.push(typeof outputs.get === 'function' ? outputs.get(i) : outputs[i]);
    }
    return items;
}
/**
 * Capture the pieces of cell state needed for execution metadata.
 */
function readCellSnapshot(cell) {
    return {
        executionCount: readExecutionCount(cell),
        outputs: readOutputItems(cell),
    };
}
/**
 * Return true when the cell is already marked as executed.
 */
function isExecuted(cell) {
    const value = cell.model.getMetadata(_config_constants__WEBPACK_IMPORTED_MODULE_2__.EXECUTION.metadataKey);
    const stateValue = cell.model.getMetadata(_config_constants__WEBPACK_IMPORTED_MODULE_2__.EXECUTION.stateMetadataKey);
    return (0,_freeze_state__WEBPACK_IMPORTED_MODULE_3__.isExecutedSnapshot)(value, stateValue);
}
/**
 * Store the executed flag in notebook metadata.
 */
function setExecutedMetadata(cell, executed) {
    cell.model.setMetadata(_config_constants__WEBPACK_IMPORTED_MODULE_2__.EXECUTION.metadataKey, executed);
}
/**
 * Store the execution state payload in notebook metadata.
 */
function setExecutionState(cell, status) {
    const previousState = (0,_freeze_state__WEBPACK_IMPORTED_MODULE_3__.parseState)(cell.model.getMetadata(_config_constants__WEBPACK_IMPORTED_MODULE_2__.EXECUTION.stateMetadataKey));
    cell.model.setMetadata(_config_constants__WEBPACK_IMPORTED_MODULE_2__.EXECUTION.stateMetadataKey, (0,_freeze_state__WEBPACK_IMPORTED_MODULE_3__.buildState)(readCellSnapshot(cell), status, previousState));
}
/**
 * Apply or clear the executed visual treatment.
 */
function setFrozenState(cell, shouldFreeze, showReadonlyDesign) {
    setExecutedMetadata(cell, shouldFreeze);
    setReadonlyAppearance(cell, shouldFreeze && showReadonlyDesign);
}
/**
 * Persist the execution status and sync the visual state.
 */
function syncExecutionStatus(cell, status, isReadonlyDesignEnabled) {
    setExecutionState(cell, status);
    setFrozenState(cell, status === 'success', isReadonlyDesignEnabled());
}
/**
 * Apply or clear readonly styling on a cell.
 */
function setReadonlyAppearance(cell, executed) {
    const shouldLock = executed;
    const cellAny = cell;
    cellAny.readOnly = shouldLock;
    cell.model.setMetadata('editable', !shouldLock);
    cell.model.setMetadata('deletable', !shouldLock);
    const applyClasses = (on) => {
        const inputEditorHost = cell.node?.querySelector('.jp-InputArea-editor');
        const cmEditorHost = cell.node?.querySelector('.cm-editor');
        inputEditorHost?.classList.toggle(_config_constants__WEBPACK_IMPORTED_MODULE_2__.EXECUTION.executedInputClass, on);
        cmEditorHost?.classList.toggle(_config_constants__WEBPACK_IMPORTED_MODULE_2__.EXECUTION.executedEditorClass, on);
        if (on) {
            cell.addClass(_config_constants__WEBPACK_IMPORTED_MODULE_2__.EXECUTION.executedCellClass);
        }
        else {
            cell.removeClass(_config_constants__WEBPACK_IMPORTED_MODULE_2__.EXECUTION.executedCellClass);
        }
    };
    applyClasses(shouldLock);
    requestAnimationFrame(() => {
        applyClasses(shouldLock);
    });
}
/**
 * Show the block message for a repeated execution attempt.
 */
async function notifyBlockedExecution() {
    await (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.showDialog)({
        title: 'VRE Cell Already Executed',
        body: 'This VRE cell is declarative and has already been executed. Re-execution is blocked.',
        buttons: [_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.Dialog.okButton({ label: 'OK' })],
    });
}
/**
 * Return true after blocking a rerun request for an already executed cell.
 */
async function blockExecutedCellRun(cell, isPluginEnabled, isReadonlyDesignEnabled) {
    if (!isPluginEnabled() || !shouldGuardCell(cell) || !isExecuted(cell)) {
        return false;
    }
    setExecutionState(cell, 'blocked');
    setReadonlyAppearance(cell, isReadonlyDesignEnabled());
    await notifyBlockedExecution();
    return true;
}
/**
 * Safely extract text content from a cell model across JupyterLab variants.
 */
function getCellText(cell) {
    if (!cell || !cell.model) {
        return '';
    }
    const sharedModel = cell.model.sharedModel;
    if (typeof sharedModel?.getSource === 'function') {
        return sharedModel.getSource() ?? '';
    }
    const val = cell.model.value;
    if (typeof val?.text === 'string') {
        return val.text;
    }
    return '';
}
/**
 * Return true when a cell should be subject to execution guard rules.
 */
function shouldGuardCell(cell, notebook) {
    if (cell.model.type !== 'code') {
        return false;
    }
    // Empty cells (nothing inside them) must never be disabled or frozen
    if (getCellText(cell).trim() === '') {
        return false;
    }
    // Fast-path: check the cell's mime type.
    // If it is explicitly Python or another language (not VRE and not plain text), it's not a VRE cell.
    const mime = cell.model.mimeType;
    if (mime && mime !== 'text/x-vre' && mime !== 'text/plain') {
        return false;
    }
    if (notebook) {
        const panel = notebookPanels.get(notebook);
        if (panel && !(0,_notebook_mime_sync__WEBPACK_IMPORTED_MODULE_4__.isVreKernel)(panel)) {
            return false;
        }
    }
    return true;
}
/**
 * Infer the execution status from NotebookActions payloads.
 */
function readExecutionStatus(payload, cell) {
    if (payload?.success === true) {
        return 'success';
    }
    if (payload?.cancel === true) {
        return 'cancelled';
    }
    if (payload?.error) {
        return 'error';
    }
    if (payload?.success === false) {
        return 'error';
    }
    const snapshot = readCellSnapshot(cell);
    if ((0,_freeze_state__WEBPACK_IMPORTED_MODULE_3__.hasErrorOutputs)(snapshot.outputs)) {
        return 'error';
    }
    return 'unknown';
}
/**
 * Sync one cell's guarded state.
 */
function syncCellState(cell, isPluginEnabled, isReadonlyDesignEnabled, notebook) {
    if (cell.model.type !== 'code') {
        return;
    }
    if (!shouldGuardCell(cell, notebook) || !isPluginEnabled() || !isReadonlyDesignEnabled()) {
        setReadonlyAppearance(cell, false);
        cell.model.deleteMetadata(_config_constants__WEBPACK_IMPORTED_MODULE_2__.EXECUTION.metadataKey);
        cell.model.deleteMetadata(_config_constants__WEBPACK_IMPORTED_MODULE_2__.EXECUTION.stateMetadataKey);
        return;
    }
    setFrozenState(cell, isExecuted(cell), true);
}
/**
 * Connect global notebook execution hooks once.
 */
function bindNotebookHooks(isPluginEnabled, isReadonlyDesignEnabled) {
    if (hooksConnected) {
        return;
    }
    hooksConnected = true;
    _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_1__.NotebookActions.executionScheduled.connect(async (_, payload) => {
        if (!isPluginEnabled()) {
            return;
        }
        const notebook = payload?.notebook;
        const cell = payload?.cell;
        if (!cell || !shouldGuardCell(cell, notebook)) {
            return;
        }
        if (isExecuted(cell)) {
            payload.cancel = true;
            setExecutionState(cell, 'blocked');
            setReadonlyAppearance(cell, isReadonlyDesignEnabled());
            await notifyBlockedExecution();
        }
    });
    _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_1__.NotebookActions.executed.connect((_sender, payload) => {
        if (!isPluginEnabled()) {
            return;
        }
        const notebook = payload?.notebook;
        const cell = payload?.cell;
        if (!cell || !shouldGuardCell(cell, notebook)) {
            return;
        }
        const alreadyExecuted = isExecuted(cell);
        // A blocked re-run emits a cancelled execution event; ignore it so we do not
        // overwrite blocked metadata and accidentally unfreeze the cell.
        if (payload?.cancel === true && alreadyExecuted) {
            setFrozenState(cell, true, isReadonlyDesignEnabled());
            return;
        }
        const status = readExecutionStatus(payload, cell);
        // Defensive fallback: once frozen as executed, do not allow non-success events
        // to transition a cell back to executable.
        if (alreadyExecuted && status !== 'success') {
            setFrozenState(cell, true, isReadonlyDesignEnabled());
            return;
        }
        syncExecutionStatus(cell, status, isReadonlyDesignEnabled);
    });
}
/**
 * Intercept NotebookActions run APIs so reruns are rejected before scheduling.
 */
function bindActionGuards(isPluginEnabled, isReadonlyDesignEnabled) {
    if (actionGuardsConnected) {
        return;
    }
    actionGuardsConnected = true;
    const actionNames = ['run', 'runAndAdvance', 'runAndInsert'];
    const actions = _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_1__.NotebookActions;
    for (const name of actionNames) {
        const original = actions[name];
        if (typeof original !== 'function') {
            continue;
        }
        if (original.__vreGuardWrapped === true) {
            continue;
        }
        const wrapped = async (...args) => {
            const cell = readActiveCell(args);
            // Try to find the notebook instance in the arguments
            let notebook = null;
            for (const arg of args) {
                if (arg?.activeCell) {
                    notebook = arg;
                    break;
                }
            }
            // Short-circuit if not a VRE notebook
            if (notebook) {
                const panel = notebookPanels.get(notebook);
                if (panel && !(0,_notebook_mime_sync__WEBPACK_IMPORTED_MODULE_4__.isVreKernel)(panel)) {
                    return original.apply(actions, args);
                }
            }
            if (cell &&
                (await blockExecutedCellRun(cell, isPluginEnabled, isReadonlyDesignEnabled))) {
                return false;
            }
            return original.apply(actions, args);
        };
        wrapped.__vreGuardWrapped = true;
        actions[name] = wrapped;
    }
}
/**
 * Keep all guarded cells in a notebook visually up to date.
 */
function syncNotebookView(panel, isPluginEnabled, isReadonlyDesignEnabled) {
    const notebook = panel.content;
    let refreshPending = false;
    const refresh = () => {
        notebook.widgets.forEach((cell) => {
            syncCellState(cell, isPluginEnabled, isReadonlyDesignEnabled, notebook);
        });
    };
    const scheduleRefresh = () => {
        if (refreshPending) {
            return;
        }
        refreshPending = true;
        requestAnimationFrame(() => {
            refreshPending = false;
            refresh();
        });
    };
    refresh();
    notebook.modelContentChanged.connect(() => {
        refresh();
    });
    panel.sessionContext.kernelChanged.connect(() => {
        refresh();
    });
    panel.sessionContext.statusChanged.connect(() => {
        refresh();
    });
    // Some editors are attached/replaced after notebook restore. Observe DOM
    // child changes and resync guarded classes for executed cells.
    const observer = new MutationObserver(() => {
        scheduleRefresh();
    });
    observer.observe(notebook.node, {
        childList: true,
        subtree: true,
    });
    panel.disposed.connect(() => {
        observer.disconnect();
    });
}
/**
 * Refresh the existing code cells in a notebook panel.
 */
function syncPanelCells(panel, isPluginEnabled, isReadonlyDesignEnabled) {
    const notebook = panel.content;
    notebook.widgets.forEach((cell) => {
        syncCellState(cell, isPluginEnabled, isReadonlyDesignEnabled, notebook);
    });
}
/**
 * Wire execution-guard behavior into a notebook panel.
 */
function activateExecutionGuard(panel, isPluginEnabled, isReadonlyDesignEnabled) {
    if (panel.content) {
        notebookPanels.set(panel.content, panel);
    }
    panel.__vreRefreshExecutionGuard = () => {
        syncPanelCells(panel, isPluginEnabled, isReadonlyDesignEnabled);
    };
    panel.context.ready
        .then(() => {
        bindActionGuards(isPluginEnabled, isReadonlyDesignEnabled);
        bindNotebookHooks(isPluginEnabled, isReadonlyDesignEnabled);
        syncNotebookView(panel, isPluginEnabled, isReadonlyDesignEnabled);
        syncPanelCells(panel, isPluginEnabled, isReadonlyDesignEnabled);
    })
        .catch(() => {
        // Ignore startup race errors and allow notebook to continue.
    });
}
/**
 * Force-refresh execution-guard appearance for a previously wired notebook panel.
 */
function refreshExecutionGuard(panel) {
    const fn = panel.__vreRefreshExecutionGuard;
    if (typeof fn === 'function') {
        fn();
    }
}


/***/ },

/***/ "./lib/execution/freeze-state.js"
/*!***************************************!*\
  !*** ./lib/execution/freeze-state.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildExecutionState: () => (/* binding */ buildExecutionState),
/* harmony export */   buildState: () => (/* binding */ buildState),
/* harmony export */   getStatus: () => (/* binding */ getStatus),
/* harmony export */   hasErrorOutputItems: () => (/* binding */ hasErrorOutputItems),
/* harmony export */   hasErrorOutputs: () => (/* binding */ hasErrorOutputs),
/* harmony export */   hasSuccessfulExecutionSnapshot: () => (/* binding */ hasSuccessfulExecutionSnapshot),
/* harmony export */   isAlreadyExecutedSnapshot: () => (/* binding */ isAlreadyExecutedSnapshot),
/* harmony export */   isExecutedSnapshot: () => (/* binding */ isExecutedSnapshot),
/* harmony export */   isSuccessfulSnapshot: () => (/* binding */ isSuccessfulSnapshot),
/* harmony export */   normalizeCount: () => (/* binding */ normalizeCount),
/* harmony export */   normalizeExecutionCount: () => (/* binding */ normalizeExecutionCount),
/* harmony export */   parseExecutionState: () => (/* binding */ parseExecutionState),
/* harmony export */   parseState: () => (/* binding */ parseState)
/* harmony export */ });
/** Normalize a kernel execution count to a finite number or null. */
function normalizeCount(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
/** Return true when any output entry represents an error output. */
function hasErrorOutputs(outputs) {
    for (const item of outputs) {
        const candidate = item;
        const outputType = candidate?.output_type ?? candidate?.type;
        if (outputType === 'error') {
            return true;
        }
    }
    return false;
}
/** Return true when a snapshot should be treated as a successful execution. */
function isSuccessfulSnapshot(snapshot) {
    if (hasErrorOutputs(snapshot.outputs)) {
        return false;
    }
    return normalizeCount(snapshot.executionCount) !== null || snapshot.outputs.length > 0;
}
/** Derive an execution status from a snapshot. */
function getStatus(snapshot) {
    if (hasErrorOutputs(snapshot.outputs)) {
        return 'error';
    }
    if (isSuccessfulSnapshot(snapshot)) {
        return 'success';
    }
    return 'unknown';
}
/** Return true when a cell is already frozen as executed. */
function isExecutedSnapshot(metadataValue, stateValue) {
    if (metadataValue === true) {
        return true;
    }
    const state = stateValue;
    return state?.success === true;
}
/** Safely parse the extension execution state metadata payload. */
function parseState(value) {
    if (!value || typeof value !== 'object') {
        return undefined;
    }
    return value;
}
/** Create a serializable metadata record for a single execution attempt. */
function buildState(snapshot, status, previousState) {
    const priorAttempts = Number.isFinite(previousState?.attempts) ? Number(previousState?.attempts) : 0;
    const priorBlockedCount = Number.isFinite(previousState?.blockedCount)
        ? Number(previousState?.blockedCount)
        : 0;
    const attempts = status === 'blocked' ? priorAttempts : priorAttempts + 1;
    const blockedCount = status === 'blocked' ? priorBlockedCount + 1 : priorBlockedCount;
    return {
        status,
        success: status === 'success',
        executionCount: normalizeCount(snapshot.executionCount),
        outputCount: snapshot.outputs.length,
        attempts,
        blockedCount,
        updatedAt: new Date().toISOString(),
    };
}
// Backward-compatible API names used by tests and older call sites.
const normalizeExecutionCount = normalizeCount;
const hasErrorOutputItems = hasErrorOutputs;
const hasSuccessfulExecutionSnapshot = isSuccessfulSnapshot;
const isAlreadyExecutedSnapshot = isExecutedSnapshot;
const parseExecutionState = parseState;
const buildExecutionState = buildState;


/***/ },

/***/ "./lib/index.js"
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_codemirror__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/codemirror */ "webpack/sharing/consume/default/@jupyterlab/codemirror");
/* harmony import */ var _jupyterlab_codemirror__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_codemirror__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jupyterlab/notebook */ "webpack/sharing/consume/default/@jupyterlab/notebook");
/* harmony import */ var _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _jupyterlab_settingregistry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jupyterlab/settingregistry */ "webpack/sharing/consume/default/@jupyterlab/settingregistry");
/* harmony import */ var _jupyterlab_settingregistry__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_settingregistry__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _execution_execution_guard__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./execution/execution-guard */ "./lib/execution/execution-guard.js");
/* harmony import */ var _language_vre_language__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./language/vre-language */ "./lib/language/vre-language.js");
/* harmony import */ var _notebook_completer_trigger__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./notebook/completer-trigger */ "./lib/notebook/completer-trigger.js");
/* harmony import */ var _notebook_mime_sync__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./notebook/mime-sync */ "./lib/notebook/mime-sync.js");
/* harmony import */ var _config_constants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./config/constants */ "./lib/config/constants.js");
/* harmony import */ var _config_defaults__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./config/defaults */ "./lib/config/defaults.js");
/* harmony import */ var _style_index_css__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../style/index.css */ "./style/index.css");











/**
 * Create the default VRE language support.
 */
function makeLanguageSupport() {
    return (0,_language_vre_language__WEBPACK_IMPORTED_MODULE_5__.createVreLanguageExtension)({
        keywords: _config_defaults__WEBPACK_IMPORTED_MODULE_9__.DEFAULT_LANGUAGE_OPTIONS.keywords,
        units: _config_defaults__WEBPACK_IMPORTED_MODULE_9__.DEFAULT_LANGUAGE_OPTIONS.units,
    });
}
/**
 * Main VRE JupyterLab Extension plugin.
 */
const plugin = {
    id: _config_constants__WEBPACK_IMPORTED_MODULE_8__.PLUGIN_ID,
    autoStart: true,
    requires: [_jupyterlab_codemirror__WEBPACK_IMPORTED_MODULE_1__.IEditorLanguageRegistry, _jupyterlab_codemirror__WEBPACK_IMPORTED_MODULE_1__.IEditorExtensionRegistry, _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_2__.INotebookTracker],
    optional: [_jupyterlab_settingregistry__WEBPACK_IMPORTED_MODULE_3__.ISettingRegistry, _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.ICommandPalette],
    activate: async (app, languageRegistry, editorExtensionRegistry, notebookTracker, settingRegistry, commandPalette) => {
        const languageSupport = makeLanguageSupport();
        const state = {
            enabled: true,
            cellReadonlyDesignEnabled: true,
        };
        const readBool = (settings, key, defaultValue) => {
            const value = settings.composite[key];
            return typeof value === 'boolean' ? value : defaultValue;
        };
        const isOn = () => state.enabled;
        const showReadonlyDesign = () => state.enabled && state.cellReadonlyDesignEnabled;
        const useVreMime = () => state.enabled;
        const refreshPanels = () => {
            notebookTracker.forEach((panel) => {
                (0,_notebook_mime_sync__WEBPACK_IMPORTED_MODULE_7__.refreshNotebookMime)(panel);
                (0,_execution_execution_guard__WEBPACK_IMPORTED_MODULE_4__.refreshExecutionGuard)(panel);
            });
        };
        let settings = null;
        const save = async (key, value) => {
            if (!settings) {
                return;
            }
            try {
                await settings.set(key, value);
            }
            catch {
                // Preserve in-memory behavior even if persistence fails.
            }
        };
        if (settingRegistry) {
            try {
                const loadedSettings = await settingRegistry.load(_config_constants__WEBPACK_IMPORTED_MODULE_8__.PLUGIN_ID);
                settings = loadedSettings;
                const sync = () => {
                    state.enabled = readBool(loadedSettings, _config_constants__WEBPACK_IMPORTED_MODULE_8__.SETTINGS.enabled, true);
                    state.cellReadonlyDesignEnabled = readBool(loadedSettings, _config_constants__WEBPACK_IMPORTED_MODULE_8__.SETTINGS.cellReadonlyDesignEnabled, true);
                    refreshPanels();
                };
                sync();
                loadedSettings.changed.connect(() => {
                    sync();
                });
            }
            catch {
                // Use defaults when settings are unavailable.
            }
        }
        /** Toggle readonly styling for already executed cells. */
        app.commands.addCommand(_config_constants__WEBPACK_IMPORTED_MODULE_8__.COMMANDS.toggleReadonlyDesign, {
            label: 'VRE: Toggle Cell Readonly Design',
            iconClass: _config_constants__WEBPACK_IMPORTED_MODULE_8__.UI.logoIconClass,
            isToggled: () => showReadonlyDesign(),
            execute: async () => {
                state.cellReadonlyDesignEnabled = !state.cellReadonlyDesignEnabled;
                refreshPanels();
                await save(_config_constants__WEBPACK_IMPORTED_MODULE_8__.SETTINGS.cellReadonlyDesignEnabled, state.cellReadonlyDesignEnabled);
            },
        });
        /** Toggle the whole extension on or off. */
        app.commands.addCommand(_config_constants__WEBPACK_IMPORTED_MODULE_8__.COMMANDS.toggleExtension, {
            label: 'VRE: Toggle Extension',
            iconClass: _config_constants__WEBPACK_IMPORTED_MODULE_8__.UI.logoIconClass,
            isToggled: () => isOn(),
            execute: async () => {
                state.enabled = !state.enabled;
                refreshPanels();
                await save(_config_constants__WEBPACK_IMPORTED_MODULE_8__.SETTINGS.enabled, state.enabled);
            },
        });
        if (commandPalette) {
            commandPalette.addItem({ command: _config_constants__WEBPACK_IMPORTED_MODULE_8__.COMMANDS.toggleReadonlyDesign, category: 'VRE' });
            commandPalette.addItem({ command: _config_constants__WEBPACK_IMPORTED_MODULE_8__.COMMANDS.toggleExtension, category: 'VRE' });
        }
        languageRegistry.addLanguage({
            name: 'VRE DSL',
            mime: _config_constants__WEBPACK_IMPORTED_MODULE_8__.LANGUAGE.mime,
            extensions: ['vm'],
            support: languageSupport,
        });
        editorExtensionRegistry.addExtension({
            name: _config_constants__WEBPACK_IMPORTED_MODULE_8__.LANGUAGE.extensionName,
            factory: () => ({
                instance: () => languageSupport.extension,
                reconfigure: () => null,
            }),
        });
        const wireNotebookPanel = (panel) => {
            (0,_notebook_mime_sync__WEBPACK_IMPORTED_MODULE_7__.attachNotebookMimeSync)(panel, () => useVreMime());
            (0,_execution_execution_guard__WEBPACK_IMPORTED_MODULE_4__.activateExecutionGuard)(panel, () => isOn(), () => showReadonlyDesign());
            (0,_notebook_completer_trigger__WEBPACK_IMPORTED_MODULE_6__.attachEmptyLineCompleter)(panel, app, () => isOn());
        };
        notebookTracker.widgetAdded.connect((_sender, panel) => {
            wireNotebookPanel(panel);
        });
        notebookTracker.forEach(panel => {
            wireNotebookPanel(panel);
        });
    },
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (plugin);


/***/ },

/***/ "./lib/language/vre-language.js"
/*!**************************************!*\
  !*** ./lib/language/vre-language.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createVreLanguageExtension: () => (/* binding */ createVreLanguageExtension)
/* harmony export */ });
/* harmony import */ var _codemirror_language__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @codemirror/language */ "webpack/sharing/consume/default/@codemirror/language");
/* harmony import */ var _codemirror_language__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_codemirror_language__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lezer_highlight__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @lezer/highlight */ "webpack/sharing/consume/default/@lezer/highlight");
/* harmony import */ var _lezer_highlight__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_lezer_highlight__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _config_defaults__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../config/defaults */ "./lib/config/defaults.js");



const NUMBER_WITH_OPTIONAL_UNIT = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/;
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*/;
const MAGIC = /^%[A-Za-z_][A-Za-z0-9_]*/;
const OPERATOR = /^(?:\:=|==|!=|<=|>=|[-+*/=<>])/;
const PUNCTUATION = /^[()[\]{},.:;]/;
const STRING = /^"(?:[^"\\]|\\.)*"|^'(?:[^'\\]|\\.)*'/;
function toLookup(values) {
    return new Set(values);
}
/**
 * Stream parser for VRE syntax tokenization in CodeMirror 6.
 * Maintains consistency with the Pygments console highlighting.
 */
function vreStreamParser(options) {
    const keywords = toLookup(options.keywords);
    const builtins = toLookup(options.builtins);
    const types = toLookup(options.types);
    const constants = toLookup(options.constants);
    const wordOperators = toLookup(options.wordOperators);
    const textMTypes = toLookup(options.textMTypes);
    const specialProperties = toLookup(options.specialProperties);
    const units = toLookup(options.units);
    return {
        startState() {
            return {
                taskMode: false,
                lastIdentifier: null,
                pendingPropertySource: null,
            };
        },
        token(stream, state) {
            if (stream.eatSpace()) {
                return null;
            }
            if (stream.match(/#.*/)) {
                state.taskMode = false;
                state.lastIdentifier = null;
                state.pendingPropertySource = null;
                return 'comment';
            }
            if (stream.match(STRING)) {
                return 'string';
            }
            if (stream.match(MAGIC)) {
                state.taskMode = false;
                state.lastIdentifier = null;
                state.pendingPropertySource = null;
                return 'magic';
            }
            if (stream.match(OPERATOR)) {
                return 'operator';
            }
            if (stream.match(PUNCTUATION)) {
                const punctuation = stream.current();
                if (punctuation === ':') {
                    if (state.lastIdentifier) {
                        state.pendingPropertySource = state.lastIdentifier;
                        if (state.lastIdentifier === 'task') {
                            state.taskMode = true;
                        }
                    }
                }
                else if (punctuation === ',' || punctuation === ')' || punctuation === ']' || punctuation === '}' || punctuation === ';') {
                    state.taskMode = false;
                    state.pendingPropertySource = null;
                }
                state.lastIdentifier = null;
                return 'punctuation';
            }
            if (stream.match(NUMBER_WITH_OPTIONAL_UNIT)) {
                stream.eatSpace();
                const beforeUnit = stream.current();
                if (stream.match(IDENTIFIER, true)) {
                    const token = stream.current().replace(beforeUnit, '').trim();
                    if (units.has(token)) {
                        return 'number';
                    }
                }
                return 'number';
            }
            if (stream.match(IDENTIFIER)) {
                const word = stream.current();
                if (state.taskMode) {
                    state.lastIdentifier = word;
                    return 'taskValue';
                }
                if (state.pendingPropertySource) {
                    state.pendingPropertySource = null;
                    if (specialProperties.has(word)) {
                        state.lastIdentifier = word;
                        return 'propertyName';
                    }
                }
                if (constants.has(word)) {
                    state.lastIdentifier = word;
                    return 'constant';
                }
                if (builtins.has(word)) {
                    state.lastIdentifier = word;
                    return 'builtin';
                }
                if (wordOperators.has(word)) {
                    state.lastIdentifier = word;
                    return 'wordOperator';
                }
                if (types.has(word) || textMTypes.has(word)) {
                    state.lastIdentifier = word;
                    return 'type';
                }
                if (keywords.has(word)) {
                    state.lastIdentifier = word;
                    return 'keyword';
                }
                if (/^[A-Z]/.test(word)) {
                    state.lastIdentifier = word;
                    return 'typeName';
                }
                state.lastIdentifier = word;
                return 'variableName';
            }
            state.lastIdentifier = null;
            state.pendingPropertySource = null;
            stream.next();
            return null;
        },
        tokenTable: {
            magic: [_lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.special(_lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.keyword)],
            builtin: [_lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.function(_lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.variableName)],
            constant: [_lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.atom],
            wordOperator: [_lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.operator],
            type: [_lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.typeName],
            taskValue: [_lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.atom],
            propertyName: [_lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.propertyName],
        },
        languageData: {
            commentTokens: { line: '#' },
        },
    };
}
/**
 * Highlight style for VRE DSL - synchronized with Pygments console colors.
 * Reference: vre-language-pygments/texts_style.py (VMLangStyle)
 */
const vreHighlightStyle = _codemirror_language__WEBPACK_IMPORTED_MODULE_0__.HighlightStyle.define([
    { tag: _lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.keyword, color: '#7c4dff', fontWeight: 'bold' },
    { tag: _lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.special(_lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.keyword), color: '#0066ff', fontWeight: 'bold' },
    { tag: _lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.atom, color: '#00838f' },
    { tag: _lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.typeName, color: '#6a1b9a', fontWeight: 'bold' },
    { tag: _lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.function(_lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.variableName), color: '#2080d0' },
    { tag: _lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.operator, color: '#ad1457' },
    { tag: _lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.propertyName, color: '#1565c0' },
    { tag: _lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.punctuation, color: '#5f6368' },
    { tag: _lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.string, color: '#BB6622' },
    { tag: _lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.number, color: '#007700' },
    { tag: _lezer_highlight__WEBPACK_IMPORTED_MODULE_1__.tags.comment, color: '#607d8b', fontStyle: 'italic' },
]);
/**
 * Create a CodeMirror LanguageSupport extension for VRE DSL.
 * Configured with comprehensive keyword/type/builtin lists for Pygments parity.
 */
function createVreLanguageExtension(userOptions) {
    const options = {
        keywords: userOptions?.keywords ?? _config_defaults__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_LANGUAGE_OPTIONS.keywords,
        builtins: userOptions?.builtins ?? _config_defaults__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_LANGUAGE_OPTIONS.builtins,
        types: userOptions?.types ?? _config_defaults__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_LANGUAGE_OPTIONS.types,
        constants: userOptions?.constants ?? _config_defaults__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_LANGUAGE_OPTIONS.constants,
        wordOperators: userOptions?.wordOperators ?? _config_defaults__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_LANGUAGE_OPTIONS.wordOperators,
        textMTypes: userOptions?.textMTypes ?? _config_defaults__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_LANGUAGE_OPTIONS.textMTypes,
        specialProperties: userOptions?.specialProperties ?? _config_defaults__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_LANGUAGE_OPTIONS.specialProperties,
        units: userOptions?.units ?? _config_defaults__WEBPACK_IMPORTED_MODULE_2__.DEFAULT_LANGUAGE_OPTIONS.units,
    };
    const language = _codemirror_language__WEBPACK_IMPORTED_MODULE_0__.StreamLanguage.define(vreStreamParser(options));
    return new _codemirror_language__WEBPACK_IMPORTED_MODULE_0__.LanguageSupport(language, [(0,_codemirror_language__WEBPACK_IMPORTED_MODULE_0__.syntaxHighlighting)(vreHighlightStyle)]);
}


/***/ },

/***/ "./lib/notebook/completer-trigger.js"
/*!*******************************************!*\
  !*** ./lib/notebook/completer-trigger.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   attachEmptyLineCompleter: () => (/* binding */ attachEmptyLineCompleter)
/* harmony export */ });
/* harmony import */ var _mime_sync__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mime-sync */ "./lib/notebook/mime-sync.js");

/**
 * Handle Tab key press on an empty line in a VRE cell by invoking the completer.
 * Wired directly to the NotebookPanel DOM node for panel-scoped execution.
 */
function attachEmptyLineCompleter(panel, app, isEnabled) {
    const handleKeyDown = (event) => {
        if (event.key !== 'Tab' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }
        if (!isEnabled() || !(0,_mime_sync__WEBPACK_IMPORTED_MODULE_0__.isVreKernel)(panel)) {
            return;
        }
        const activeCell = panel.content.activeCell;
        if (!activeCell || activeCell.model.type !== 'code') {
            return;
        }
        const editor = activeCell.editor;
        if (!editor || !editor.hasFocus()) {
            return;
        }
        const cursor = editor.getCursorPosition();
        const lineText = editor.getLine(cursor.line) ?? '';
        const textBeforeCursor = lineText.slice(0, cursor.column);
        if (textBeforeCursor.trim() === '') {
            event.preventDefault();
            event.stopPropagation();
            if (app.commands.hasCommand('completer:invoke-notebook')) {
                void app.commands.execute('completer:invoke-notebook');
            }
            else if (app.commands.hasCommand('completer:invoke')) {
                void app.commands.execute('completer:invoke');
            }
        }
    };
    panel.node.addEventListener('keydown', handleKeyDown, true);
    panel.disposed.connect(() => {
        panel.node.removeEventListener('keydown', handleKeyDown, true);
    });
}


/***/ },

/***/ "./lib/notebook/mime-sync.js"
/*!***********************************!*\
  !*** ./lib/notebook/mime-sync.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   attachNotebookMimeSync: () => (/* binding */ attachNotebookMimeSync),
/* harmony export */   isVreKernel: () => (/* binding */ isVreKernel),
/* harmony export */   refreshNotebookMime: () => (/* binding */ refreshNotebookMime)
/* harmony export */ });
/* harmony import */ var _config_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config/constants */ "./lib/config/constants.js");

/**
 * Return true when the notebook kernel looks like a VRE kernel.
 */
function isVreKernel(panel) {
    const pref = panel.sessionContext.kernelPreference || {};
    const kernelName = (panel.sessionContext.session?.kernel?.name || pref.name || '').toLowerCase();
    const displayName = (panel.sessionContext.kernelDisplayName || '').toLowerCase();
    const langName = (pref.language || '').toLowerCase();
    return (kernelName === _config_constants__WEBPACK_IMPORTED_MODULE_0__.LANGUAGE.kernelName ||
        kernelName.includes('vre') ||
        displayName.includes('vre') ||
        langName.includes('vre') ||
        langName.includes('virtmat'));
}
/**
 * Wire VRE MIME sync into a notebook panel.
 *
 * When enabled and the kernel matches VRE, code cells are switched to the VRE MIME.
 */
function attachNotebookMimeSync(panel, shouldUseVreMime) {
    const notebook = panel.content;
    const sync = () => {
        if (!notebook?.model) {
            return;
        }
        const useVreMime = shouldUseVreMime() && isVreKernel(panel);
        for (let i = 0; i < notebook.model.cells.length; i += 1) {
            const cell = notebook.model.cells.get(i);
            if (cell.type !== 'code') {
                continue;
            }
            if (useVreMime) {
                cell.mimeType = _config_constants__WEBPACK_IMPORTED_MODULE_0__.LANGUAGE.mime;
            }
            else if (cell.mimeType === _config_constants__WEBPACK_IMPORTED_MODULE_0__.LANGUAGE.mime) {
                cell.mimeType = _config_constants__WEBPACK_IMPORTED_MODULE_0__.LANGUAGE.defaultCodeMime;
            }
        }
    };
    panel.__vreRefreshMime = sync;
    panel.context.ready
        .then(() => {
        sync();
        notebook.modelContentChanged.connect(sync);
        panel.sessionContext.kernelChanged.connect(sync);
    })
        .catch(() => {
        // no-op
    });
}
/**
 * Force-refresh the VRE MIME state for a previously wired notebook panel.
 */
function refreshNotebookMime(panel) {
    const fn = panel.__vreRefreshMime;
    if (typeof fn === 'function') {
        fn();
    }
}


/***/ }

}]);
//# sourceMappingURL=lib_index_js.56d9530a534592b0bcd2.js.map