import { Plugin, TFile } from 'obsidian';
import { compileScreenplay } from '../commands/compile-screenplay';

const MENU_TITLE = 'Final Craft: Compile screenplay';

export function registerFileMenus(plugin: Plugin) {
	plugin.registerEvent(
		plugin.app.workspace.on('file-menu', (menu, file) => {
			if (!(file instanceof TFile) || file.extension !== 'md') {
				return;
			}

			menu.addItem((item) =>
				item
					.setTitle(MENU_TITLE)
					.setIcon('clapperboard')
					.onClick(() => compileScreenplay(plugin.app, file)),
			);
		}),
	);
}