import { Plugin } from 'obsidian';
import { registerCommands } from './commands';

export default class FinalCraftPlugin extends Plugin {
	onload() {
		registerCommands(this);
	}
}