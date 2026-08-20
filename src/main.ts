import { Plugin } from 'obsidian';
import { registerCommands } from './commands';
import { registerFileMenus } from './menus/register-file-menus';
import {
	SCREENPLAY_VIEW_TYPE,
	ScreenplayPreviewView,
} from './preview/screenplay-view';

export default class FinalCraftPlugin extends Plugin {
	onload() {
		this.registerView(
			SCREENPLAY_VIEW_TYPE,
			(leaf) => new ScreenplayPreviewView(leaf),
		);
		registerCommands(this);
		registerFileMenus(this);
	}
}