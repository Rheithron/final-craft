import { App, ButtonComponent, Modal, TextAreaComponent } from 'obsidian';

export class ErrorDetailsModal extends Modal {
	constructor(
		app: App,
		private readonly heading: string,
		private readonly details: string,
		private readonly description = 'Copy these details when reporting the problem.',
		private readonly copyLabel = 'Copy details',
	) {
		super(app);
	}
	onOpen() {
		this.setTitle(this.heading);
		const description = this.contentEl.createEl('p', { text: this.description });
		description.addClass('final-craft-error-description');
		const textArea = new TextAreaComponent(this.contentEl).setValue(this.details).setPlaceholder('No details were provided.');
		textArea.inputEl.readOnly = true;
		textArea.inputEl.addClass('final-craft-error-details');
		const copyButton = new ButtonComponent(this.contentEl).setButtonText(this.copyLabel).setCta();
		copyButton.onClick(async () => {
			await navigator.clipboard.writeText(this.details);
			copyButton.setButtonText('Copied');
		});
	}
}
