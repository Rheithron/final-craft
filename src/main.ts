import { Plugin } from 'obsidian';
import { registerCommands } from './commands';
import { registerFileMenus } from './menus/register-file-menus';

export default class FinalCraftPlugin extends Plugin {
	onload() {
		registerCommands(this);
		registerFileMenus(this);
	}
}