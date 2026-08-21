# Fountain support

## Supported in the alpha

- Standard and forced scene headings
- Action and forced action
- Character cues and forced cues
- Dialogue, parentheticals, and character extensions
- Transitions, forced transitions, and common shot lines
- `[[notes]]` and `/* boneyards */` (removed)
- Forced page breaks using `===`

## Reported but not fully rendered

Final Craft reports these constructs in a copyable warning dialog:

- Dual dialogue (`^`) renders sequentially
- Bold, italic, and underline markup can remain visible
- Centered text (`>...<`)
- Lyrics (`~`)
- Sections (`#`) and synopsis lines (`=`)

Fountain title-page syntax is not used. Configure cover and PDF metadata in master-note YAML instead.

Pagination is deterministic for the selected profile and includes conservative orphan/widow handling. It is not intended to reproduce the exact page breaks of every other screenwriting application.
