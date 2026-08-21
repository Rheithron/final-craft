# Master note reference

The active Markdown note is a Final Craft master when its YAML contains `final_craft: true`. It describes the whole screenplay; its Markdown body is ignored.

## Required properties

| Property | Value |
| --- | --- |
| `final_craft` | Boolean `true` |
| `title` | Non-empty string |
| `source_folder` | Vault-relative folder containing scene notes |
| `paper` | `letter` or `a4` |
| `density` | `loose`, `normal`, `tight`, or `very-tight` |
| `font` | `courier-prime`, `courier-final-draft`, or `courier-new` |

The selected font must be installed on the device. Final Craft warns when it is unavailable because fallback metrics can change wrapping and pagination.

## Cover and PDF properties

| YAML property | Cover | Standard PDF/XMP result |
| --- | --- | --- |
| `title` | Main title | Title when `pdf_title` is absent |
| `subtitle` | Optional line | Not embedded separately |
| `episode_title` | Optional line | Not embedded separately |
| `writing_credit` | Optional line | Not embedded separately |
| `authors` | One line per author | Author (`dc:creator`) joined with commas |
| `contact.name` | Bottom-left contact block | Not embedded separately |
| `contact.email` | Bottom-left contact block | Custom XMP `finalCraft:contactEmail` |
| `pdf_title` | No | Title override (`dc:title`) |
| `subject` | No | Subject/description (`dc:description`) |
| `keywords` | No | Standard Keywords plus XMP `dc:subject` |
| `creator` | No | Creator/creator tool; defaults to `Final Craft` |
| `language` | No | PDF language plus XMP `dc:language` |

Final Craft always writes `Final Craft` as PDF Producer and sets creation and modification dates at export time.

`keywords` must be a YAML list of non-empty strings. Use one meaningful phrase per item rather than splitting a phrase into isolated words. Add the contact email as another keyword if ordinary metadata readers should expose it even when they do not understand the custom XMP field.
## Act map

Each optional `acts` key must define `start` and `end`. Every scene must use one matching `act` value, and an act cannot resume after a later act begins.

```yaml
acts:
  TEASER:
    start: TEASER
    end: END OF TEASER
  ACT_1:
    start: ACT ONE
    end: END OF ACT ONE
  ACT_2:
    start: ACT TWO
    end: END OF EPISODE
```

Final Craft starts each mapped section on a new page and underlines its opening label. Do not type these exact labels inside Fountain blocks: the master map is authoritative, and matching manual labels are ignored with a warning.
