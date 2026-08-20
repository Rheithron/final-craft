import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';

const output = path.join(tmpdir(), 'final-craft-layout-test.mjs');
await build({ entryPoints: ['src/layout/index.ts'], bundle: true, format: 'esm', platform: 'node', outfile: output });
const { reflowElement, resolveRenderProfile, wrapText } = await import(pathToFileURL(output).href);

test('resolves certified Letter and calibrated A4 capacities', () => {
	assert.equal(resolveRenderProfile('letter', 'normal', 'courier-prime').lineCapacity, 54);
	assert.equal(resolveRenderProfile('a4', 'normal', 'courier-prime').lineCapacity, 58);
	assert.equal(resolveRenderProfile('a4', 'very-tight', 'courier-prime').lineCapacity, 69);
});

test('wraps action to 60 characters and preserves Unicode code points', () => {
	const lines = wrapText('A '.repeat(40).trim(), 60);
	assert.equal(lines.length, 2);
	assert.ok(lines.every((line) => Array.from(line).length <= 60));
	assert.deepEqual(wrapText('È'.repeat(61), 60).map((line) => Array.from(line).length), [60, 1]);
});

test('uses dialogue and parenthetical widths', () => {
	const profile = resolveRenderProfile('letter', 'normal', 'courier-prime');
	const result = reflowElement({
		type: 'dialogue-block',
		character: 'DOLOMIEU',
		extensions: ['V.O.'],
		forced: false,
		dual: false,
		content: [
			{ type: 'parenthetical', text: '(' + 'quietly '.repeat(5).trim() + ')' },
			{ type: 'dialogue', text: 'word '.repeat(20).trim() },
		],
	}, profile);
	assert.equal(result.lines[0], 'DOLOMIEU (V.O.)');
	assert.ok(result.lines.slice(1).every((line) => Array.from(line).length <= 35));
});