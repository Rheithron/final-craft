import { Platform, Plugin } from 'obsidian';
import { compileScreenplay } from './compile-screenplay';
import { exportScreenplayToPdf } from './export-screenplay-pdf';

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

	plugin.addCommand({
		id: 'export-screenplay-pdf',
		name: 'Export screenplay PDF',
		checkCallback: (checking) => {
			const activeFile = plugin.app.workspace.getActiveFile();
			const canExport =
				Platform.isDesktopApp && activeFile?.extension === 'md';
			if (canExport && !checking) {
				void exportScreenplayToPdf(plugin.app, activeFile);
			}
			return canExport;
		},
	});
}