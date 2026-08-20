import { App, ItemView, WorkspaceLeaf } from 'obsidian';
import { ScreenplayPage } from '../layout/paginator';
import { ResolvedRenderProfile } from '../layout/profiles';

export const SCREENPLAY_VIEW_TYPE = 'final-craft-screenplay-preview';

export interface ScreenplayPreviewDocument {
	title: string;
	pages: ScreenplayPage[];
	profile: ResolvedRenderProfile;
}

export class ScreenplayPreviewView extends ItemView {
	private document?: ScreenplayPreviewDocument;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return SCREENPLAY_VIEW_TYPE;
	}

	getDisplayText() {
		return this.document?.title ?? 'Final Craft preview';
	}

	getIcon() {
		return 'clapperboard';
	}

	setDocument(document: ScreenplayPreviewDocument) {
		this.document = document;
		this.render();
	}

	protected async onOpen() {
		this.render();
	}

	private render() {
		this.contentEl.empty();
		const document = this.document;
		if (!document) {
			this.contentEl
				.createDiv({ cls: 'final-craft-preview-empty' })
				.setText('Compile a screenplay to open its preview.');
			return;
		}

		const preview = this.contentEl.createDiv({ cls: 'final-craft-preview' });
		const summary = preview.createDiv({ cls: 'final-craft-preview-summary' });
		summary.createEl('h2', { text: document.title });
		summary.createDiv({
			text:
				document.pages.length +
				(document.pages.length === 1 ? ' screenplay page' : ' screenplay pages'),
		});

		for (const page of document.pages) {
			const pageElement = preview.createDiv({ cls: 'final-craft-page' });
			pageElement.setCssProps({
				'--final-craft-page-width': document.profile.pageWidthInches + 'in',
				'--final-craft-page-height': document.profile.pageHeightInches + 'in',
				'--final-craft-line-pitch': document.profile.linePitchPoints + 'pt',
			});
			pageElement.setAttribute('aria-label', 'Screenplay page ' + page.number);

			if (page.number > 1) {
				pageElement
					.createDiv({ cls: 'final-craft-folio' })
					.setText(page.number + '.');
			}

			for (const block of page.blocks) {
				for (let index = 0; index < block.lines.length; index++) {
					const role = block.roles[index];
					const line = block.lines[index];
					if (!role || line === undefined) continue;
					const lineElement = pageElement.createDiv({
						cls: ['final-craft-line', 'final-craft-' + role],
						text: line,
					});
					lineElement.setCssProps({
						'--final-craft-line-index': String(block.startLine - 1 + index),
					});
				}
			}
		}
	}
}

export async function openScreenplayPreview(
	app: App,
	document: ScreenplayPreviewDocument,
) {
	let leaf = app.workspace.getLeavesOfType(SCREENPLAY_VIEW_TYPE)[0];
	if (!leaf) {
		leaf = app.workspace.getLeaf('tab');
		await leaf.setViewState({ type: SCREENPLAY_VIEW_TYPE, active: true });
	}
	await app.workspace.revealLeaf(leaf);

	if (leaf.view instanceof ScreenplayPreviewView) {
		leaf.view.setDocument(document);
	}
}