import { App, ButtonComponent, Modal, TextAreaComponent } from 'obsidian';

export class ErrorDetailsModal extends Modal {
	constructor(
		app: App,
		private readonly heading: string,
		private readonly details: string,
	) {
		super(app);
	}

	onOpen() {
		this.setTitle(this.heading);
		const description = this.contentEl.createEl('p', {
			text: 'Copy these details when reporting the problem.',
		});
		description.addClass('final-craft-error-description');

		const textArea = new TextAreaComponent(this.contentEl)
			.setValue(this.details)
			.setPlaceholder('No error details were provided.');
		textArea.inputEl.readOnly = true;
		textArea.inputEl.addClass('final-craft-error-details');

		const copyButton = new ButtonComponent(this.contentEl)
			.setButtonText('Copy error')
			.setCta();
		copyButton.onClick(async () => {
			await navigator.clipboard.writeText(this.details);
			copyButton.setButtonText('Copied');
		});
	}
}