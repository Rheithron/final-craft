# Scene notes and ordering

Every Markdown file below `source_folder` is treated as a scene note and needs YAML like:

```yaml
---
scene: "12A"
act: ACT_2
---
```

Keep `scene` quoted so YAML preserves it as a string. IDs must be unique. Final Craft sorts by scene ID rather than filename.

When the master note has an `acts` map, `act` is required and must exactly match one map key. Without a map, `act` is optional.

Put screenplay text in one or more fenced `fountain` blocks. Multiple blocks compile in document order. Notes with no Fountain blocks remain in scene ordering and produce a copyable warning.
