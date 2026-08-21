import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';

const output = path.join(tmpdir(), 'final-craft-fountain-diagnostics-test.mjs');
await build({ entryPoints: ['tests/support/pagination-api.ts'], bundle: true, format: 'esm', platform: 'node', outfile: output });
const { fountainWarnings, parseFountain, removeManualActMarkers } = await import(pathToFileURL(output).href);

test('reports unsupported Fountain constructs instead of silently accepting them', () => {
	const source = 'ODYSSEUS^\nDinner?\n\n**LOUD**\n\n>Centered<\n\n~Song\n\n# Section\n\n= Synopsis';
	const warnings = fountainWarnings('Scenes/001.md', source, parseFountain(source));
	assert.equal(warnings.length, 6);
	assert.match(warnings.join('\n'), /dual dialogue/);
	assert.match(warnings.join('\n'), /bold, italic, or underline/);
});

test('removes exact manual act labels supplied by the master map', () => {
	const result = removeManualActMarkers('Scenes/001.md', parseFountain('END OF TEASER\n\nINT. PALACE - NIGHT'), {
		TEASER: { start: 'TEASER', end: 'END OF TEASER' },
	});
	assert.equal(result.elements.length, 1);
	assert.equal(result.elements[0].type, 'scene-heading');
	assert.equal(result.warnings.length, 1);
});