# Saint Seiya: Rebirth 2 (EX) data dump

This folder contains Supabase dumps and image manifests scraped from `seiya2.vercel.app`.

## Layout
- `data/<LANG>/tables/`: Full JSON tables for the given language (EN, PT, ES, FR, ID, TH, CN). Each run includes all shared tables plus `LanguagePackage_<LANG>.json` for translations.
- `data/<LANG>/image_urls.json`: All inferred asset URLs (hero portraits, skill icons, artifact previews, force-card icons) for that language run.
- `data/<LANG>/summary.json`: Row counts per table and image URL totals for the run.
- `data/tables/`, `data/image_urls.json`, `data/summary.json`: Earlier EN run kept for convenience.

## Entity quick map
- **Heroes**
  - `RoleConfig`: Base hero records (id, camp/faction, stance, damage type, class, labels, stats, skill lists).
  - `RoleResourcesConfig`: Per-hero names and resource pointers (role_name, portrait ids).
  - `HeroTypeDescConfig`: Lookup text for camps/stances/damage types/classes (`key`, `desc`).
  - `HeroConfig`: Misc hero descriptions (introduction/features), role labels, banners.
  - `HeroQualitySkillConfig`: Quality-skill references per hero (`hero_quality_skill_ids`).
  - `HeroAwakenConfig` + `HeroAwakenInfoConfig`: Awakening steps and added skills.
  - `HeroRelationConfig`: Bonds/relations per hero (bond ids, combine skill/state lists, attributes).
  - `HeroFettersConfig`: Bond definitions (required heroes/conditions, attributes or skill ids).
  - `HeroRelationSkillConfig`: Combine-skill/state metadata referenced by relations.
- **Skills**
  - `SkillConfig`: Core skills (skillid, type, cd, label_list, skill_des/sketch/condition, sub_skills).
  - `SkillLabelConfig`: Label id → name mappings used by heroes/skills.
  - `SkillValueConfig`: Value substitution arrays (`show_value`) applied into skill descriptions.
- **Artifacts**
  - `ArtifactConfig`: Artifact entries (id, name, desc, initial_quality, rarity flag).
  - `ArtifactResourcesConfig`: Asset references per artifact (`preview_icon` paths).
- **Force Cards (Ultimate Power)**
  - `ForceCardItemConfig`: Card definitions (id, name/desc, icons, quality, star, type, sort_weight).
- **Translations**
  - `LanguagePackage_<LANG>.json`: Key/value pairs resolving `LC_*` strings to localized text.

## CSV export
Generate a single CSV that contains heroes, skills, artifacts, force cards, relations, and translations for every language with resolved text:
```bash
python ../export_csv.py --data-dir . --out full_dump.csv
```
The CSV columns are `lang`, `entity_group`, `table`, `record_id`, `row_index`, `raw_json`, and `resolved_json`.

## Assets
No images were downloaded to keep the repo light. To fetch them locally:
```bash
python scraper.py --lang EN --out-dir data/EN --download-images --assets-dir assets/EN
```
Repeat per language as needed; the image list for each run lives in `image_urls.json`.
