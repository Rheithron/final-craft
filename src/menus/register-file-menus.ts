import { Platform, Plugin, TFile } from 'obsidian';
import { compileScreenplay } from '../commands/compile-screenplay';
import { exportScreenplayToPdf } from '../commands/export-screenplay-pdf';

const COMPILE_MENU_TITLE = 'Final Craft: Compile screenplay';
const EXPORT_MENU_TITLE = 'Final Craft: Export screenplay PDF';

export function registerFileMenus(plugin: Plugin) {
	plugin.registerEvent(
		plugin.app.workspace.on('file-menu', (menu, file) => {
			if (!(file instanceof TFile) || file.extension !== 'md') {
				return;
			}

			menu.addItem((item) =>
				item
					.setTitle(COMPILE_MENU_TITLE)
					.setIcon('clapperboard')
					.onClick(() => compileScreenplay(plugin.app, file)),
			);

			if (Platform.isDesktopApp) {
				menu.addItem((item) =>
					item
						.setTitle(EXPORT_MENU_TITLE)
						.setIcon('file-down')
						.onClick(() => exportScreenplayToPdf(plugin.app, file)),
				);
			}
		}),
	);
}