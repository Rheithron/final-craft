# Final Craft

Final Craft compiles screenplay projects from Markdown notes inside Obsidian. Keep each scene in its own note, arrange the project from one YAML master note, preview deterministic screenplay pages, and export a metadata-rich PDF without sending your writing anywhere.

> **Early release:** review exported PDFs before production or distribution.

## What works

- Ordered scene compilation from a vault folder
- Core Fountain screenplay elements and forced `===` page breaks
- Letter and A4 profiles with configurable density and Courier-family fonts
- Safe page breaks, including `(MORE)` and `(CONT'D)`
- Optional teaser, cold-open, and act boundaries generated from the master note
- Title page, standard PDF metadata, and embedded XMP contact email
- Copyable compile and export warnings
- Compile and preview on desktop or mobile; PDF export on desktop
- Local/offline operation with no telemetry

## A very short voyage

A scene note can contain:

```fountain
INT. PALACE OF ITHACA - NIGHT

ODYSSEUS enters, only twenty years late.

ODYSSEUS
Hi, Penelope. What's for dinner?

PENELOPE
(without looking up)
Consequences.
```

Open a configured master note and run **Final Craft: Compile screenplay**. On desktop, run **Final Craft: Export screenplay PDF**. Both commands also appear in a Markdown file's context menu.

For a complete, ready-to-copy project, see [The Odyssey example](examples/Final%20Craft%20Example/README.md).

## Documentation

- [Master note reference](docs/master-note.md)
- [Scene notes and ordering](docs/scene-notes.md)
- [Fountain support and limitations](docs/fountain-support.md)
- [Release testing checklist](docs/alpha-testing.md)

## Install

After Community Directory publication, install Final Craft from **Settings → Community plugins → Browse**.

For manual installation:

1. Run `npm install` and `npm run build`.
2. Create `<vault>/.obsidian/plugins/final-craft/`.
3. Copy `main.js`, `manifest.json`, and `styles.css` into that folder.
4. Reload Obsidian and enable **Final Craft** under **Settings -> Community plugins**.

The plugin ID is permanently `final-craft`.

## Development

```bash
npm install
npm run build
npm test
npm run lint
```

Final Craft is under active development. PDF export uses Obsidian's desktop runtime; compilation and preview avoid desktop-only APIs.
