# Vega Mobile Projects Migration Plan & Progress

## Scope
- Source: `/Users/zhiqiu/offline_code/research_ntu/vis2mobile/vega-mobile-projects`
- Target: `/Users/zhiqiu/offline_code/research_ntu/vis2mobile/gallery`
- Exclusions: `vega-altair-10`, `vega-altair-32`, `vega-altair-33`
- Section: Vega Examples in the gallery
- Process: Migrate one project at a time; run checks/lint/dev, verify via Playwright, fix issues, commit, update this file.

## Overall Approach
1. For each project, copy the minimal visualization code, assets, and data into `gallery`.
2. Add a preview route under `gallery/app/preview/vega/<project-id>`.
3. Add a Vega card in the Vega section with iframe pointing to the preview route.
4. Add/update dependencies in `gallery/package.json` as needed.
5. Validate via `bun run check`, `bun run lint`, `bun run dev` + Playwright, fix issues.
6. Commit and update progress.
7. Save comparison screenshots in `gallery/screenshots/<project-id>/`.

## Project Queue (in order)
- [x] vega-01
- [x] vega-02
- [x] vega-03
- [x] vega-04
- [x] vega-05
- [x] vega-altair-01
- [x] vega-altair-02
- [x] vega-altair-03
- [x] vega-altair-04
- [x] vega-altair-05
- [x] vega-altair-06
- [x] vega-altair-07
- [x] vega-altair-08
- [x] vega-altair-09
- [x] vega-altair-11
- [ ] vega-altair-12
- [ ] vega-altair-13
- [ ] vega-altair-14
- [ ] vega-altair-15
- [ ] vega-altair-16
- [ ] vega-altair-17
- [ ] vega-altair-18
- [ ] vega-altair-19
- [ ] vega-altair-20
- [ ] vega-altair-21
- [ ] vega-altair-22
- [ ] vega-altair-23
- [ ] vega-altair-24
- [ ] vega-altair-25
- [ ] vega-altair-26
- [ ] vega-altair-27
- [ ] vega-altair-28
- [ ] vega-altair-29
- [ ] vega-altair-30
- [ ] vega-altair-31
- [ ] vega-altair-34
- [ ] vega-altair-35
- [ ] vega-altair-36
- [ ] vega-altair-37
- [ ] vega-altair-38
- [ ] vega-altair-39
- [ ] vega-altair-40
- [ ] vega-altair-41
- [ ] vega-lite-01
- [ ] vega-lite-02
- [ ] vega-lite-03
- [ ] vega-lite-04
- [ ] vega-lite-05
- [ ] vega-lite-06
- [ ] vega-lite-07
- [ ] vega-lite-08
- [ ] vega-lite-09
- [ ] vega-lite-10
- [ ] vega-lite-11
- [ ] vega-lite-12
- [ ] vega-lite-13
- [ ] vega-lite-14
- [ ] vega-lite-15
- [ ] vega-lite-16
- [ ] vega-lite-17
- [ ] vega-lite-18
- [ ] vega-lite-19
- [ ] vega-lite-20
- [ ] vega-lite-21
- [ ] vega-lite-22

## Progress Log
- 2026-01-13: Plan created.
- 2026-01-13: Migrated vega-01 (Flight Explorer) into gallery.
- 2026-01-13: Migrated vega-02 (Normal 2D) into gallery.
- 2026-01-13: Adjusted vega-02 preview height to match mobile rendering.
- 2026-01-13: Saved comparison screenshots for vega-01, vega-02, vega-03.
- 2026-01-13: Migrated vega-03 (Stock Explorer) into gallery.
- 2026-01-13: Migrated vega-04 (Country Breakdown) into gallery.
- 2026-01-13: Saved comparison screenshots for vega-04.
- 2026-01-13: Migrated vega-05 (Barley Yield) into gallery.
- 2026-01-13: Saved comparison screenshots for vega-05.
- 2026-01-13: Migrated vega-altair-01 (Market Trends) into gallery.
- 2026-01-13: Saved comparison screenshots for vega-altair-01.
- 2026-01-13: Migrated vega-altair-02 (Data Density) into gallery.
- 2026-01-13: Saved comparison screenshots for vega-altair-02.
- 2026-01-13: Migrated vega-altair-03 (Energy Trends) into gallery.
- 2026-01-13: Saved comparison screenshots for vega-altair-03.
- 2026-01-13: Migrated vega-altair-04 (Energy Source Share) into gallery.
- 2026-01-13: Saved comparison screenshots for vega-altair-04.
- 2026-01-13: Migrated vega-altair-05 (Barley Yield Analysis) into gallery.
- 2026-01-13: Saved comparison screenshots for vega-altair-05.
- 2026-01-13: Migrated vega-altair-06 (Seattle Weather) into gallery.
- 2026-01-13: Saved comparison screenshot for vega-altair-06.
- 2026-01-13: Migrated vega-altair-07 (Employment Change) into gallery.
- 2026-01-13: Saved comparison screenshot for vega-altair-07.
- 2026-01-13: Migrated vega-altair-08 (placeholder) into gallery.
- 2026-01-13: Saved comparison screenshot for vega-altair-08.
- 2026-01-13: Migrated vega-altair-09 (Barley Yields) into gallery.
- 2026-01-13: Saved comparison screenshot for vega-altair-09.
- 2026-01-13: Migrated vega-altair-11 (Gantt Overview) into gallery.
- 2026-01-13: Saved comparison screenshots for vega-altair-11.
