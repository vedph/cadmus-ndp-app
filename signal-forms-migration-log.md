# Signal Forms Migration Log

Migration of the libraries under `projects/myrmidon` from reactive forms to signal forms, following the Cadmus v20 core packages (`@myrmidon/cadmus-*` 20.x).

Conventions of this log: every statement is either **verified** (with how) or marked **believed** (with how it could be checked).

## Workspace setup

- Replaced the `build-lib` script with `pnpm build:libs [lib...]` (`scripts/build-libs.mjs`, copied from `cadmus-shell-v3`), which builds the specified libraries plus all those depending on them (or all the libraries), in dependency order. The order is derived from each library's `package.json` (peer)dependencies plus the `@myrmidon/*` imports found in its non-spec sources. `build-lib` is kept as an alias.
  - verified: `node scripts/build-libs.mjs --dry` lists all 13 libraries with `ndpbooks-fonts` before `ndpbooks-fig-plan` before `ndpbooks-pg`, and the four `ndpfrac-*` libraries before `ndpfrac-pg`.
- Added `pnpm check-libs` (`scripts/check-local-libs.js`), run first by `build:libs`. It fails when a local library (any `projects/myrmidon/*` with a `package.json`) is not mapped by `tsconfig.json` `paths` to exactly `./dist/myrmidon/<lib>`, or exists under `node_modules/@myrmidon` as a real directory or as a symlink not pointing to this workspace's `dist/`. Unlike the shell's version, it reads `tsconfig.json` with TypeScript's own reader, because this workspace's `tsconfig.json` has comments (the shell's `JSON.parse` failed on it).
  - verified: run at the start: OK for 13 libraries. `ls node_modules/@myrmidon | grep ndp` returned nothing, i.e. resolution is uniformly through tsconfig paths.

## Libraries

### cadmus-part-ndp-notable-word-forms

Components: `NotableWordFormEditorComponent` (manual-save entry editor), `NotableWordFormsPartComponent` (list part).

- Entry editor: the edited model input is named `form` (public API, kept), so the field tree is `formCtl` (the name of the former `FormGroup`).
- Tags are kept in the draft as IDs; the picker's `ThesaurusEntry[]` is a `computed()` from them and the `tagEntries` input. The old `effect()` read `tagEntries()` inside `updateForm()`, so any change of that input rebuilt the form and discarded edits; this is no longer the case.
  - verified: spec "should keep the edits when tagEntries change".
- `value` and `referenceForm` are disabled through `disabled(..., { when })` while there are operations, replacing the `enable()`/`disable()` effect.
- The `min="0"` attribute on the rank input became `min(p.rank, 0)`. Under `ReactiveFormsModule` the attribute activated Angular's `MinValidator` directive, so this keeps the same validation (static `min` is not allowed on `[formField]`, NG8022).
- `maxLength` error messages now appear: the old template tested `errors?.maxLength`, while reactive forms report `maxlength`, so they could never show.
- Enter in a text input saves only when the form is valid and dirty (`onEnterKey`), as did the old implicit submission with a submit button disabled when invalid or pristine.
- Part: thesauri are `computed()`s; settings come from `initSettings()` instead of being reloaded on every `onDataSet`.
- Tests: 61 green (`ng test @myrmidon/cadmus-part-ndp-notable-word-forms`). Added specs: no `<form>`, Enter saves only when dirty, a normalized child echo leaves the editor pristine, bound arrays are copied (no Symbol tags on the caller's objects), saved values carry no Symbol tags, pristine after binding.
- Build: `build:libs cadmus-part-ndp-notable-word-forms` OK (with `cadmus-part-ndp-pg`).

### cadmus-part-ndp-text-passages

Components: `TextPassageEditorComponent` (manual-save entry editor), `TextPassagesPartComponent` (list part).

- The draft derives from the passage and the `citSchemeKey` input (the citation is parsed through `CitSchemeService`, passed to the pure `toDraft()`), as the old `effect()` tracked both.
- Features are kept in the draft as IDs; the picker shows only those found in the `featureEntries` thesaurus, as before. Difference: the old code dropped unknown feature IDs (or all of them when the thesaurus is missing) as soon as a passage was opened, so saving the passage lost them. Now they are kept, unless the user edits the features through the picker. Also, a change of `featureEntries` no longer discards edits.
  - verified: specs "should show only the data.features ids matching featureEntries", "should keep the edits when featureEntries change".
- The "at least one of citation/free citation" group validator became `NgxToolsSignalValidators.atLeastOneRequired(p, [p.citation, p.freeCitation])`; its message is shown from `form().getError('atLeastOneRequired')`.
- Strings are trimmed on save (tag, text, note, free citation), which the old code did not do.
- The part's `settings` `resource()` was left as it was (it is not forms code).
- Tests: 58 green. Build: `build:libs cadmus-part-ndp-text-passages` OK (with `cadmus-part-ndp-pg`).

### Browser check: ndp group

Done in headless Chrome over CDP against `ng serve` on port 4200 (port 4201 fails: the API's CORS policy allows only `http://localhost:4200`, verified with an `OPTIONS` request), after `rm -rf .angular/cache`.

- Served code: verified by fetching every script loaded by the page and searching for `featurePickerEntries` and `tagPickerEntries` (both only in the migrated sources): found in the served chunk.
- Text passages part (item `48cd93fb…`): opens with `isDirty() === false` and no `<form>` in the DOM. The passage editor opens pristine with its Accept button disabled. Typing in the tag input dirties it, Enter saves the entry and closes the editor, the table shows the new tag, and the part becomes dirty.
- Notable word forms part (item `1b1b5f7f…`, a form with 1 reference, 1 link and 1 operation): after visiting all three tabs, so that every child editor rendered, the entry editor is still pristine with no dirty field and Accept disabled; `value` is disabled because of the operation. After Discard, the part is still pristine.

### Nested editors and the Enter key (applies to all entry editors)

The documented `onEnterKey()` (CHANGELOG checklist, `app-object-editor.md`) calls `preventDefault()` only when it saves. When an editor is nested in another one (font editor in label editor in fig-plan item editor), Enter in a pristine or invalid inner editor then bubbles, still not prevented, to the outer editor's `(keydown.enter)`, and `isImplicitSubmission()` (which checks only `defaultPrevented`, verified in `@myrmidon/cadmus-ui` 20.0.1 source) lets the **outer** editor save. With the old nested `<form>`s, implicit submission targeted only the innermost form.

- verified: spec "should not save the item on Enter in a pristine nested label editor" (real label editor inside the item editor) fails with the documented `onEnterKey` (`expected 'e2' to be 'e1'`) and passes with the fix.
- Fix, used in every entry editor of this workspace: when `isImplicitSubmission(event)` is true, always `preventDefault()`, then save only if the form is valid and dirty.

### cadmus-part-ndpbooks-fonts

Components: `PrintFontEditorComponent` (manual-save entry editor), `PrintFontsPartComponent` (list part).

- The editor has no validators, as before. Its template shows "family required" and "too long" messages for errors that no validator produces (pre-existing, kept).
- Strings are now trimmed on save (eid, family, note).
- Tests: 47 green.

### cadmus-part-ndpbooks-fig-plan

Components: `FigPlanItemEditorComponent`, `FigPlanImplItemEditorComponent`, `FigPlanItemLabelEditorComponent` (manual-save entry editors), `PrintFigPlanPartComponent`, `PrintFigPlanImplPartComponent` (parts).

- `editedCit` (the input of the compact citation editor) is now a `computed()` from the bound item only, as the old code set it only in `updateForm()`; the citation editor's own changes update just the `citation` text field.
- Static `maxlength` attributes on `[formControl]` inputs became `maxLength()` rules (position, change type, matrix type and state: 100; matrix state description: 1000; impl part description: 5000). Under `ReactiveFormsModule` they activated Angular's `MaxLengthValidator` directive, so this keeps the same validation.
  - verified in Chrome: the matrix state description textarea still has `maxlength="1000"`, set by `[formField]` from the rule.
- `fonts` in the label editor: reactive `Validators.required` on an array flags an empty array, so it became `NgxToolsSignalValidators.strictMinLength(p.fonts, 1)`.
- `FigPlanImplItemEditorComponent`: in the old `updateForm()`, an item without `location` left the previous item's location in the control; as the editor stays mounted when the part switches from one item to another, that location could be saved into the next item. The draft is now rebuilt from each item, so this no longer happens.
  - verified: spec "should not carry the location over to an item without one".
- Strings are trimmed on save (eid, type and others which were not trimmed before).
- Tests: 153 green, including the nested-Enter specs with the real label editor. Build: `build:libs cadmus-part-ndpbooks-fonts` OK (fonts, fig-plan, ndpbooks-pg); `ndpbooks-pg` tests: 4 green.

### Browser check: ndpbooks group

`ng serve` restarted after `rm -rf .angular/cache`. Served code verified by finding `isDraftInSync` in the served chunk containing `FigPlanImplItemEditor`.

- Fig plan impl part (item `1b1b5f7f…`): opens pristine with no `<form>`. The item editor stays pristine after visiting its three tabs. After making the item dirty, a new label editor opens pristine, and a new font editor nested in it opens pristine. Enter in the pristine font editor leaves the label editor open and pristine; Enter in the pristine label editor does not save the item into the part.

### cadmus-part-ndpdrw-tech

Component: `DrawingTechPartComponent` (part with fields).

- Flag sets and the physical measurements set (`measurementsChange`) go through `setFieldFromChild`; measurements are copied with `copyFormValue` in and out.
- `material` is now trimmed on save.
- Tests: 27 green (added: pristine on bind, child echoes stay pristine, saved measurements carry no Symbol tags). Build: `build:libs cadmus-part-ndpdrw-tech` OK (with `ndpdrw-pg`, whose tests are 2 green).

### Browser check: ndpdrw group, and a stale bundle measured

- First attempt: the drawing tech part threw `TypeError: this.form is not a function`. Measured, not reasoned: the served chunk containing `drawing-tech-materials` had `buildForm` and no `toDraft` (old reactive code), while `dist/myrmidon/cadmus-part-ndpdrw-tech` (written 12:52:23) had no `buildForm`. The dev server log showed a single bundle generation at 12:46:45 and none after. So **`ng serve` does not rebuild when a library in `dist/` changes**: after `build:libs`, stop `ng serve`, delete `.angular/cache`, and restart it.
- After the restart (served chunk now migrated): the part opens pristine and is still pristine 1.5 s later (past child autosave debounces), with no `<form>`. Typing in the note dirties it and enables Save; Enter in the material input does not save. This item has no measurements, so the measurement echo was verified only by spec.

### cadmus-part-ndpfrac-quire-labels, -rulings

Components: `CodFrQuireLabelEditorComponent`, `CodFrRulingEditorComponent` (manual-save entry editors), `CodFrQuireLabelsPartComponent`, `CodFrRulingsPartComponent` (list parts).

- Straight ports; flag sets and the hand ID go through `setFieldFromChild`. The rulings spec located the note input through `NgControl`; it now sets a value on the field and finds the input showing it.
- Tests: 52 and 53 green (added: child echoes stay pristine, Enter saves only when valid and dirty).

### cadmus-part-ndpfrac-support

- The old `updateForm()` defaulted an empty material to the first `cod-fr-support-materials` entry, but only for an existing part (a new part got `''` from `reset()`). `toDraft()` takes the thesaurus entries and the `PhysicalGridCoordsService` used to parse the location as arguments, and keeps both behaviors.
  - verified: specs "should default an empty material to the first entry, pristine", "should not default the material of a new part".
- Tests: 20 green.

### cadmus-part-ndpfrac-layout

- `formulaData` (the input of the layout formula editor) is a `linkedSignal` from the bound part, replaced by what the formula editor emits, as the old code did with a signal set in `updateForm()` and in the output handler.
  - verified: spec "should stay pristine when the formula editor echoes its data" (also checks the editor gets back its own object).
- Behavior change: `features` was not in the old `FormGroup` (although `getValue()` saved it), so changing only the features never made the part dirty, and the change could be lost on closing. It is now a field of the form.
  - verified: spec "should become dirty when only the features change".
- `unitEntries` is a `computed()` falling back to the default units, as before.
- Tests: 26 green. Build: `build:libs` of the four ndpfrac libraries OK (with `ndpfrac-pg`, tests 5 green).

### Browser check: ndpfrac group, and all the parts in the database

After restarting `ng serve` with a cleared cache (served code verified per part: the served chunk containing the component's class name contains `createForm`):

- Each of the 4 ndpfrac parts (item `6c57a787…`) opens on real data valid and pristine, also after visiting all its tabs and waiting 1.5 s, with no `<form>` in the DOM.
- Sweep of **all the 18 ndp parts** in the database (all type/role combinations, including quire labels `sig` and `catch`): every part is pristine after visiting its tabs and waiting; every list entry, opened in its entry editor (visiting all its tabs), is pristine; and the part is still pristine after discarding all of them. So no pending changes prompt appears when closing without changes.
- Round trip on the quire labels part: editing an entry's text (with trailing spaces) and pressing Enter saves the trimmed text into the part's draft and closes the entry editor; the part becomes dirty. Close then shows the pending changes guard ("There are unsaved changes. Do you want to leave?"); answering no stays on the page. Save clears the dirty state; after a reload, the new text is there and the part is pristine.
- Observed, cause only **believed**: a dev-mode warning `NG0956` (track by identity re-created a collection of size 1) appears on loading some parts (quire labels, fig plan impl, support). Believed cause: the list tables track entries by identity, and `toDraft()` copies the entries (`copyFormValue`) each time the data is bound, so a re-bound part produces new objects. Check: count the data bindings when opening the part, or try `track $index` in the list tables and see whether the warning disappears.

## Final verification

- `ng test` of all 13 libraries: all green (notable-word-forms 65, ndp-pg 3, text-passages 58, fig-plan 159, fonts 47, ndpbooks-pg 4, ndpdrw-pg 2, drawing-tech 27, layout 26, ndpfrac-pg 5, quire-labels 52, rulings 53, support 20).
- `node scripts/build-libs.mjs`: all 13 libraries built in dependency order (after the follow-up fixes, the two changed libraries and their dependents were rebuilt).
- No `FormBuilder`, `FormControl`, `FormGroup`, `ReactiveFormsModule`, `NgxToolsValidators`, `formControl` or `formGroup` left in the libraries' sources and templates.
- Changed files were formatted with Prettier 3 (`--single-quote`, as per `.editorconfig`).
- `ng build` of the app: succeeds (after adding `@myrmidon/cadmus-graph-ui-ex`, see below).

## Follow-up fixes (formerly reported as out of scope)

Each fix has specs which were verified to fail with the old code and pass with the new one (by temporarily restoring the old template lines).

- `NotableWordFormEditorComponent`: `eid` is now part of the draft (`maxLength` 100, as the other EIDs here), has a control in the General tab, and is saved trimmed. The links editor now gets `linkDocRefTypeEntries`/`linkDocRefTagEntries` for its assertion references (it got the editor's own `doc-reference-*` thesauri before).
  - verified in Chrome: typed an EID in the first form of a notable word forms part, accepted, saved, reloaded: the EID persisted and shows in the list.
- `notable-word-forms-part.component.html`: `[linkTagEntries]` is now bound to `pin-link-tags`, and `[linkDocRefTagEntries]`/`[linkDocRefTypeEntries]` to `pin-link-docref-tags`/`-types`. The list shows EID, value, language (looked up in its thesaurus), rank, tags and reference form.
  - the thesaurus routing could not be seen in Chrome, as the mock database has none of the `doc-reference-*`/`pin-link-*` thesauri; it is covered by specs (each of the 11 thesauri reaches the matching editor input, and the links editor gets the pin-link ones).
- Dead `(editorClose)` bindings: replaced with `(cancelEdit)` in `fig-plan-item-label-editor` (font editor), `fig-plan-impl-item-editor` (label editor), and also `print-fig-plan-part` (item editor), which had the same dead binding and was not in the earlier report. The `-feature` components' `(editorClose)` bindings are correct (they target part editors).
  - verified in Chrome: in a fig-plan part, Discard closes the item editor; in a fig-plan-impl item, Discard in the font editor closes only it, then Discard in the label editor closes only it.
- `PrintFigPlanPartComponent`: added the `description` textarea in the general tab, bound to `form.description` (the existing `maxLength` 1000 rule).
  - verified in Chrome: typed a description, saved, reloaded: it persisted, and the part opens pristine.
- App dependencies: added `@myrmidon/cadmus-graph-ui-ex` ^20.0.0, plus its peers missing from the app, `three` ^0.186.1 and `d3-force` ^3.0.0 (same ranges as in `cadmus-shell-v3`). `ng build` now succeeds; verified in Chrome: `/graph` renders the graph editor with no console errors.
  - `pnpm add` re-fetched the phantom `zone.js` into the pnpm store without running the `postinstall` guard, which broke every library's tests with `Failed to resolve import "zone.js/testing"`. Running `node scripts/remove-phantom-zonejs.js` fixed it. After any `pnpm add`, run that script (or a full `pnpm install`).
- `NG0100` in `App`: reproduced in Chrome on a fresh load of `/items` after login. The compiled template showed the failing binding: `@if (logged && !itemBrowsers)`. `logged`, `user`, `itemBrowsers` and `version` were plain fields set from RxJS subscriptions in an `Eager` component of a zoneless app, so a change made during change detection was caught by the dev-mode check. `cadmus-shell-v3`'s `AppComponent`, which works, keeps them in signals with `OnPush`. `App` now does the same (the template reads the signals, with `@if (user(); as user)` for the user block). Besides, `logged` is now initialized from `isAuthenticated(true)`, as the subscription already did, rather than from `user !== null`, which was always true because `user` is `undefined` when absent.
  - verified in Chrome: no `NG0100` on reload of `/items`, logout, and login; the toolbar shows the right buttons in each state.

## Out of scope: reported, not fixed

- Upstream docs (`cadmus-shell-v3` CHANGELOG checklist, `cadmus-doc/.../app-object-editor.md`): the documented `onEnterKey()` lets Enter in a pristine nested editor save the enclosing editor (see "Nested editors and the Enter key").
- `@myrmidon/cadmus-thesaurus-store`: `ThesaurusEntriesPickerComponent` renders a `<form>` (inside `cadmus-thesaurus-browser`), so editors embedding the picker get a nested `<form>` (seen in the DOM of the text passage editor). This is harmless for the migrated editors, because `isImplicitSubmission()` ignores inputs inside a native form.
- `src/app/app.spec.ts` is the unchanged CLI scaffold and does not compile (it imports a non-existent `AppComponent`, and expects a `title` and an `<h1>`), so `ng test cadmus-ndp-app` fails. This predates the migration.
- `package.json` lists `three.js` ^0.77.1, an unrelated old package which nothing imports; `three` is the one the graph libraries need.
- `NG0956` warnings (track by identity) still appear when opening some parts.
