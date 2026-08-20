import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';

const output = path.join(tmpdir(), 'final-craft-parser-test.mjs');
await build({ entryPoints: ['src/fountain/parser.ts'], bundle: true, format: 'esm', platform: 'node', outfile: output });
const { parseFountain } = await import(pathToFileURL(output).href);

test('parses core Fountain semantics', async () => {
	const source = await readFile('tests/fixtures/fountain/core.fountain', 'utf8');
	const elements = parseFountain(source);
	assert.deepEqual(elements.map((item) => item.type), ['scene-heading','action','action','dialogue-block','dialogue-block','dialogue-block','transition','page-break']);
	assert.equal(elements[1].text, 'Two source lines form one Action paragraph.');
	assert.equal(elements[2].forced, true);
	assert.equal(elements[3].character, 'McGINTY');
	assert.equal(elements[3].forced, true);
	assert.deepEqual(elements[4].extensions, ['V.O.']);
	assert.equal(elements[5].dual, true);
});

test('removes notes and boneyards', () => {
	const elements = parseFountain('/* EXT. DELETED - DAY */\n[[private note]]\n.FORCED PLACE\n\n!UPPERCASE ACTION');
	assert.deepEqual(elements.map((item) => item.type), ['scene-heading', 'action']);
	assert.equal(elements[0].forced, true);
	assert.equal(elements[1].forced, true);
});