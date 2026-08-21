# Alpha installation and test checklist

## Clean-vault installation

Copy only `main.js`, `manifest.json`, and `styles.css` to `.obsidian/plugins/final-craft/`, reload Obsidian, and enable Final Craft.

## Desktop checks

1. Copy the example project into the vault and compile its master note.
2. Confirm cover, act openings, folios, `(MORE)`/`(CONT'D)`, and forced page break.
3. Export Letter and A4 versions and inspect page size at 100% zoom.
4. Inspect standard PDF title, author, subject, keywords, creator, and language.
5. Verify XMP `finalCraft:contactEmail` with an XMP-aware inspector.
6. Trigger an unsupported Fountain warning and verify **Copy warnings**.
7. Select an unavailable font and verify the fallback warning.

## Mobile checks

1. Enable the plugin on iOS or Android.
2. Compile the example master and scroll through the preview.
3. Confirm PDF export is absent; export is intentionally desktop-only.

## A4 visual acceptance

Use `paper: a4` and `density: normal`. The preview summary must show `A4`, and the PDF media box must be 210 x 297 mm (8.267717 x 11.692913 in). Check the title page, page-one top margin, folios, and bottom line.

Automated tests cover A4 geometry and calibrated line capacity; this visual check validates the desktop PDF runtime and installed font.
