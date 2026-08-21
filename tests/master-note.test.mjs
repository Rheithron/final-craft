import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';

const output = path.join(tmpdir(), 'final-craft-master-note-test.mjs');
await build({ entryPoints: ['tests/support/pagination-api.ts'], bundle: true, format: 'esm', platform: 'node', outfile: output });
const { parseMasterNote } = await import(pathToFileURL(output).href);

const validMaster = {
	final_craft: true,
	title: 'The Prisoner of Messina',
	subtitle: 'Pilot Episode',
	episode_title: 'Des Alpes aux Pyramides',
	writing_credit: 'Written by',
	authors: ['Domenico Pozzetti'],
	contact: {
		name: 'Domenico Pozzetti',
		email: 'Domenico@ThePrisonerOfMessina.com',
	},
	pdf_title: 'The Prisoner of Messina - Pilot Episode',
	subject: 'Epic Historical Drama Television Series Pilot Episode',
	keywords: ['screenplay', 'pilot episode'],
	creator: 'Domenico@ThePrisonerOfMessina.com',
	language: 'en-US',
	source_folder: 'Pilot/Scenes',
	paper: 'letter',
	density: 'normal',
	font: 'courier-prime',
};

test('parses optional title-page contact metadata', () => {
	const result = parseMasterNote(validMaster);
	assert.equal(result.ok, true);
	assert.deepEqual(result.project.contact, validMaster.contact);
	assert.equal(result.project.episodeTitle, validMaster.episode_title);
	assert.equal(result.project.pdfTitle, validMaster.pdf_title);
	assert.equal(result.project.subject, validMaster.subject);
	assert.deepEqual(result.project.keywords, validMaster.keywords);
	assert.equal(result.project.creator, validMaster.creator);
	assert.equal(result.project.language, validMaster.language);
});

test('rejects an empty contact mapping', () => {
	const result = parseMasterNote({ ...validMaster, contact: {} });
	assert.equal(result.ok, false);
	assert.match(result.errors.join(' '), /contact must define/);
});