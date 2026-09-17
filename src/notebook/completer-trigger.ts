import { JupyterFrontEnd } from '@jupyterlab/application';
import { NotebookPanel } from '@jupyterlab/notebook';
import { isVreKernel } from './mime-sync';

/**
 * Handle Tab key press on an empty line in a VRE cell by invoking the completer.
 * Wired directly to the NotebookPanel DOM node for panel-scoped execution.
 */
export function attachEmptyLineCompleter(
	panel: NotebookPanel,
	app: JupyterFrontEnd,
	isEnabled: () => boolean,
): void {
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Tab' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
			return;
		}

		if (!isEnabled() || !isVreKernel(panel)) {
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
			} else if (app.commands.hasCommand('completer:invoke')) {
				void app.commands.execute('completer:invoke');
			}
		}
	};

	panel.node.addEventListener('keydown', handleKeyDown, true);

	panel.disposed.connect(() => {
		panel.node.removeEventListener('keydown', handleKeyDown, true);
	});
}
