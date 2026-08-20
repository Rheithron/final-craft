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