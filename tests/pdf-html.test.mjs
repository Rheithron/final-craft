import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';

const output = path.join(tmpdir(), 'final-craft-pdf-html-test.mjs');
await build({ entryPoints: ['tests/support/pagination-api.ts'], bundle: true, format: 'esm', platform: 'node', outfile: output });
const { paginate, parseFountain, renderPrintHtml, resolveRenderProfile } =
	await import(pathToFileURL(output).href);

test('renders paginated screenplay HTML for Chromium PDF output', async () => {
	const source = await readFile(
		'tests/fixtures/pagination/long-dialogue-more-continued.fountain',
		'utf8',
	);
	const profile = resolveRenderProfile('letter', 'normal', 'courier-prime');
	const pages = paginate(parseFountain(source), profile);
	const html = renderPrintHtml({
		title: 'Test <Screenplay>',
		titlePage: {
			title: 'Test <Screenplay>',
			subtitle: 'Pilot Episode',
			episodeTitle: 'A Test & Escape',
			writingCredit: 'Written by',
			authors: ['Writer One'],
			contactName: 'Writer One',
			contactEmail: 'writer@example.com',
		},
		pages,
		profile,
	});

	assert.equal((html.match(/<section class="page">/g) ?? []).length, 2);
	assert.equal((html.match(/<section class="page title-page">/g) ?? []).length, 1);
	assert.match(html, /@page\{size:8\.5in 11in;margin:0\}/);
	assert.match(html, /<title>Test &lt;Screenplay&gt;<\/title>/);
	assert.match(html, /<div class="cover-title">TEST &lt;SCREENPLAY&gt;<\/div>/);
	assert.match(html, /A Test &amp; Escape/);
	assert.match(html, /writer@example\.com/);
	assert.match(html, /\.act-start\{text-decoration:underline/);
	assert.match(html, /<div class="folio">2\.<\/div>/);
	assert.match(html, /\(MORE\)/);
	assert.match(html, /DOLOMIEU \(CONT&#039;D\)/);
});