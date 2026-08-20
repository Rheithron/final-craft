import { Plugin } from 'obsidian';
import { compileScreenplay } from './compile-screenplay';

export function registerCommands(plugin: Plugin) {
	plugin.addCommand({
		id: 'compile-screenplay',
		name: 'Compile screenplay',
		checkCallback: (checking) => {
			const activeFile = plugin.app.workspace.getActiveFile();
			const canCompile = activeFile?.extension === 'md';

			if (canCompile && !checking) {
				void compileScreenplay(plugin.app, activeFile);
			}

			return canCompile;
		},
	});
}