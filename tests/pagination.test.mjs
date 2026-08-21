import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';

const output = path.join(tmpdir(), 'final-craft-pagination-test.mjs');
await build({ entryPoints: ['tests/support/pagination-api.ts'], bundle: true, format: 'esm', platform: 'node', outfile: output });
const { paginate, parseFountain, resolveRenderProfile } = await import(pathToFileURL(output).href);
const profile = resolveRenderProfile('letter', 'normal', 'courier-prime');

async function pagesFor(name) {
	const source = await readFile('tests/fixtures/pagination/' + name + '.fountain', 'utf8');
	return paginate(parseFountain(source), profile);
}

test('keeps exactly 54 lines on one page', async () => {
	const pages = await pagesFor('exactly-54-lines');
	assert.equal(pages.length, 1);
	assert.equal(pages[0].usedLines, 54);
});

test('moves the 55th line to page two without a one-line orphan', async () => {
	const pages = await pagesFor('overflow-55-lines');
	assert.equal(pages.length, 2);
	assert.deepEqual(pages.map((page) => page.usedLines), [53, 2]);
});

test('moves a Scene Heading and following lines together', async () => {
	const pages = await pagesFor('scene-heading-orphan');
	assert.equal(pages.length, 2);
	assert.equal(pages[0].usedLines, 50);
	assert.equal(pages[1].blocks[0].type, 'scene-heading');
});

test('moves a Character cue with its Dialogue', async () => {
	const pages = await pagesFor('character-cue-orphan');
	assert.equal(pages.length, 2);
	assert.equal(pages[1].blocks[0].type, 'dialogue-block');
	assert.deepEqual(pages[1].blocks[0].lines, ['DOLOMIEU', 'A final warning.']);
});

test('splits long Action across pages', async () => {
	const pages = await pagesFor('long-action-split');
	assert.deepEqual(pages.map((page) => page.usedLines), [54, 6]);
});

test('adds MORE and a continued Character cue to split Dialogue', async () => {
	const pages = await pagesFor('long-dialogue-more-continued');
	assert.equal(pages.length, 2);
	assert.equal(pages[0].blocks[0].lines.at(-1), '(MORE)');
	assert.equal(pages[1].blocks[0].lines[0], "DOLOMIEU (CONT'D)");
});

test('honors a forced page break', async () => {
	const pages = await pagesFor('forced-page-break');
	assert.equal(pages.length, 2);
	assert.deepEqual(pages.map((page) => page.usedLines), [10, 10]);
});
test('renders exactly 60 characters and wraps character 61', async () => {
	const pages = await pagesFor('character-width-60');
	const actionBlocks = pages[0].blocks.filter((block) => block.type === 'action');
	assert.deepEqual(actionBlocks.map((block) => block.lines.length), [1, 2]);
	assert.equal(Array.from(actionBlocks[0].lines[0]).length, 60);
	assert.deepEqual(actionBlocks[1].lines.map((line) => Array.from(line).length), [60, 1]);
});
test('starts every later act on a new page and marks opener roles', () => {
	const profile = resolveRenderProfile('letter', 'normal', 'courier-prime');
	const pages = paginate([
		{ type: 'act', text: 'TEASER', boundary: 'start' },
		{ type: 'scene-heading', text: 'EXT. DESERT - DAY', forced: false },
		{ type: 'action', text: 'The horizon refuses to move.', forced: false },
		{ type: 'act', text: 'END OF TEASER', boundary: 'end' },
		{ type: 'act', text: 'ACT ONE', boundary: 'start' },
		{ type: 'scene-heading', text: 'INT. TENT - NIGHT', forced: false },
		{ type: 'action', text: 'A lantern gutters.', forced: false },
		{ type: 'act', text: 'END OF ACT ONE', boundary: 'end' },
	], profile);
	assert.equal(pages.length, 2);
	assert.deepEqual(pages[0].blocks.map((block) => block.type), [
		'act', 'scene-heading', 'action', 'act',
	]);
	assert.equal(pages[0].blocks[0].startLine, 1);
	assert.equal(pages[0].blocks[1].startLine, 3);
	assert.deepEqual(pages[0].blocks[0].roles, ['act-start']);
	assert.deepEqual(pages[0].blocks[3].roles, ['act-end']);
	assert.deepEqual(pages[1].blocks[0].lines, ['ACT ONE']);
	assert.equal(pages[1].blocks[0].startLine, 1);
});