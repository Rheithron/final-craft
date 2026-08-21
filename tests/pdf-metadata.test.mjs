import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';
import { PDFDocument } from 'pdf-lib';

const output = path.join(tmpdir(), 'final-craft-pdf-metadata-test.mjs');
await build({ entryPoints: ['tests/support/pagination-api.ts'], bundle: true, format: 'esm', platform: 'node', outfile: output });
const { addPdfMetadata } = await import(pathToFileURL(output).href);

test('embeds configured metadata without changing page count', async () => {
	const source = await PDFDocument.create();
	source.addPage([612, 792]);
	const bytes = await addPdfMetadata(await source.save(), {
		title: 'The Prisoner of Messina',
		author: 'Domenico Pozzetti',
		subject: 'Epic Historical Drama Television Series Pilot Episode',
		keywords: ['screenplay', 'pilot episode'],
		creator: 'Domenico@ThePrisonerOfMessina.com',
		language: 'en-US',
		contactEmail: 'Domenico@ThePrisonerOfMessina.com',
	});
	const result = await PDFDocument.load(bytes, { updateMetadata: false });
	assert.equal(result.getPageCount(), 1);
	assert.equal(result.getTitle(), 'The Prisoner of Messina');
	assert.equal(result.getAuthor(), 'Domenico Pozzetti');
	assert.equal(result.getSubject(), 'Epic Historical Drama Television Series Pilot Episode');
	assert.match(result.getKeywords() ?? '', /screenplay/);
	assert.equal(result.getCreator(), 'Domenico@ThePrisonerOfMessina.com');
	assert.equal(result.getProducer(), 'Final Craft');
	const serialized = new TextDecoder().decode(bytes);
	assert.match(serialized, /xmlns:finalCraft="https:\/\/github\.com\/Rheithron\/final-craft\/ns\/1\.0\/"/);
	assert.match(
		serialized,
		/<finalCraft:contactEmail>Domenico@ThePrisonerOfMessina\.com<\/finalCraft:contactEmail>/,
	);
});