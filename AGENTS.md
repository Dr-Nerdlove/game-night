# Notes for AI assistants

A short orientation for a new session on this project - whatever tool you use. More detail, with the reasons:
`DEVELOPMENT.md`. For users: `README.md` (English).

## What this is

A decision helper for game night: which board game from your own collection suits tonight's group (number of
players, mood, complexity, time)? Everything lives in `index.html` - one file, no toolkit, no dependencies, no
build step. The shelf starts **empty**; the nine `BEISPIELSPIELE` (sample games) only go in when the user taps
the button.

**Two ways to the user, the same file:**

- **Android app** (Capacitor): `apk.yml` builds it, on demand only.
- **Web version on GitHub Pages**, mainly for the iPhone: `pages.yml` publishes on **every push to `main`** that
  touches the web files. The repo is public for that reason - nothing that has to stay secret belongs in it (key
  and password are kept as GitHub secrets).

There is no home server, no Windows scripts and no Claude artifact version any more; the history is in
`DEVELOPMENT.md`. Everything is stored on the device, there is no account.

## Language

**Since October 2026 the repository is English** (the owner's decision, because the repository is public):
documentation, code comments and commit messages. Please keep it that way. Code identifiers that are German
already (`frischeKarte`, `TEXTE`, `BEISPIELSPIELE` ...) keep their names; renaming them was deliberately not done.

**The interface is bilingual** and follows the system language - there is no setting in the program; on Android 13
and up it can be set per app in the system settings. Whoever changes a text changes it in *both* languages
(`MARKUP_EN` for fixed labels, `TEXTE` for everything the script builds); details in `DEVELOPMENT.md` under "Two
languages".

**The keys of the stored data are never translated** (`party`, `gruebeln`, `leicht` ...). They are in every
backup; changing them makes existing backups unreadable.

**The README is English**, it is the project's outward face.

Exception: **the build workflow and commit messages** are plain ASCII, umlauts spelled out ("moeglicherweise").

## Files

| File | Purpose |
| --- | --- |
| `index.html` | the whole application |
| `.github/workflows/apk.yml` | builds the Android app on GitHub's machines; also writes the native parts (Java) and the Android language lists |
| `sw.js` | service worker of the web version (not in the app) |
| `.github/workflows/pages.yml` | publishes the web version on GitHub Pages |
| `icon-*.png`, `app-icon-*.png`, `manifest.webmanifest` | icons |
| `logo.png`, `screenshots/` | images for the README |
| `CHANGELOG.md` | change history, updated with every version |
| `README.md` | user guide, in English |
| `DEVELOPMENT.md` | reasons and history of the decisions |
| `FONTS.md` | license notice for the embedded fonts |
| `LICENSE` | GPL-3.0-or-later (the fonts keep the OFL 1.1) |

## Read before changing `index.html`

A new field on a game has to be carried in **four** places, otherwise it is silently lost on editing:
`normalize()`, `submitGame()`, the export projection in `renderCollection()` and, where needed, `startEdit()` /
`resetForm()`. This mistake has happened once already.

The file is around 250 KB because two fonts are embedded in it as data. Don't be alarmed and don't "tidy up": they
are the reason the app looks the same offline as online. License notice in `FONTS.md`, reasoning in
`DEVELOPMENT.md`.

The version number sits in the footer as `data-fassung="1.2.3"` on the element, not as text; the script turns it
into "Version" (or "Fassung" in German). The build workflow looks for exactly this spelling.

The inner padding of `.wrap` is in **two** places (the normal rule and `@media (max-width:520px)`) and contains the
`--sicher-*` variables in both. They keep the status bar away from the heading in the Android app; details in
`DEVELOPMENT.md` under "System bars".

## Signing: do not touch

The APK is signed with a fixed key from the secrets `SIGNIER_SCHLUESSEL` and `SIGNIER_PASSWORT`. If the key
changes, the app can no longer be updated over the previous version, and every user loses their collection when
they have to uninstall. Every build writes the fingerprint to the log - it must stay the same. Background in
`DEVELOPMENT.md`.

## Releasing a new version

The number is in three places and must be the same everywhere, otherwise the build aborts: `package.json`,
`data-fassung="1.2.3"` in `index.html` and a section `## [1.2.3]` in `CHANGELOG.md`.

**No two-digit parts** in the number (the owner's wish): after x.9.z comes the next major version, so 2.9.2 →
3.0.0, not 2.10.0. Never go back to a smaller number: Android turns 1.2.3 into 10203 and refuses any update to a
smaller value.

A push to `main` updates the **web version** by itself. The **APK** is only built on demand, either with
`git tag v1.2.3 && git push origin v1.2.3` - or, **necessarily from a session**, by starting the workflow in the
"Actions" tab with the box `veroeffentlichen` ticked (through the GitHub tools: `run_workflow` with the input
`veroeffentlichen`). Tags cannot be pushed from here, the server answers with HTTP 403; branch pushes work. Details
in `DEVELOPMENT.md`.

**After a change to the native parts** (Java in `apk.yml`, manifest, language lists) do a **trial run without the
box ticked** first: Java cannot be compiled here, only the build shows whether it holds. An error there otherwise
costs a burnt version number.

## Two rules for the interface

- **Nothing tappable under 44 pixels.** Chips, text buttons, expandable rows, checkboxes together with their label.
  This was violated once already - 72 of 112 elements.
- **"Played today" does not re-sort the list** (`frischeKarte()` instead of `render()`), otherwise the confirmed
  card disappears from under the finger. Reasoning in `DEVELOPMENT.md`.

## Check, don't hope

There are no automated tests. What has proven itself:

```bash
# Syntax of the page (and of the service worker)
sed -n '/^<script>/,/^<\/script>/p' index.html | sed '1d;$d' > /tmp/app.js
node --check /tmp/app.js && node --check sw.js

# Serve it to check it in the browser (localhost may use the service worker)
python3 -m http.server 8111
```

For interface checks, **puppeteer-core** against the existing Chromium (`/opt/pw-browsers/...`) has proven itself:
real device emulation (412×915, pixel density 2), `emulateMediaFeatures` for light/dark, clicks on the interface,
and in the end measuring instead of looking - hit areas, spacing, contrast. Listen for console errors
(`pageerror`), otherwise silent failures slip through.

**Careful with `getComputedStyle` after a click:** `render()` rebuilds the chips, the old element is then detached
and returns empty values. Look it up again after the click.

**Careful with `pkill -f`**: the pattern also matches your own command line and kills the running shell. Use
`pkill -x node` or remember the process number.

**The shelf is empty at the start.** A test that needs games first clicks `[data-leer="beispiele"]` (or writes
`spieleabend.sammlung` into the storage).

**Rebuild the Capacitor bridge** when a test is meant to run "in the app": as ready-made objects under
`window.Capacitor.Plugins` (`isNativePlatform`, `Sprache.lesen`, ...). There is no `registerPlugin` there - that
once hid an error because the test silently supplied it.

**Wikidata throttles cloud machines** with HTTP 429 (without a CORS header, the browser only reports a network
error). So test the evaluation with answers in the Wikidata format (`page.setRequestInterception`), and only
individual cases live.

## What has proven itself

**Who the owner is and how they want to work:**

- The owner is **not a programmer**. Answer in **German**, without technical terms where something simpler will do;
  for decisions, one clear proposal instead of a list of all possibilities.
- **Building and publishing may happen without asking** once the change is checked ("you can just build"). Asking
  costs them more than it helps. Exception: anything that cannot be undone (swapping the key, rewriting history,
  deleting something that is not in the repo).
- **One branch per task** (see "Changes"), named like `fix/short-topic`, instead of the session's random branch.
  Merge into `main` once the owner agrees; that push also publishes the web version. Pull requests only if they
  ask for one.
- **Measure first, then claim - and say mistakes openly.** They rely on the assurance "checked"; where something
  could only be checked in the browser instead of on a real device, that belongs to it. Name explicitly what cannot
  be checked here (effect on the phone, Java compilation).
- **They have one device, for trying things out:** feedback comes with a screenshot from the phone. Then measure,
  don't tweak by feel.
- **Before any update with consequences for stored data**, remind them to make a backup first ("Backup & moving").
- **Small, clearly defined jobs** may be done by a cheaper model as a helper; still measure the result yourself
  before it is published.

- Look first, then claim. Several mistakes in this project came from guessed addresses and assumptions about files.
- Don't add a line that appears on every card - what everyone shares says nothing.
- Don't hard-exclude anything the user might still want: lower it in the ranking and name the reason instead.

<!-- owner-rules v12: general (AGENTS.md) - begin -->

## General rules

### People

- Unless "Project knowledge" says otherwise, assume that the people you work with **do not program**: they
  build their projects together with AI assistants and rely on you for the code, its quality and its
  explanation. "Project knowledge" lists who works on the project.
- Talk to them in **German**, in plain words, without jargon. Say what changes for them, not which file
  changed.
- When they ask for ideas or something is unclear, **offer choices and let them pick before building**, with
  a recommendation. Do not build a proposal nobody chose.
- **Report honestly**: a test that failed, a step that was skipped, a fix that turned out to be wrong. Say
  what was **really tested** and what was only built or compiled, and what it means for them.
- **Merge, release or publish only when the person asks for it.** Never merge or overwrite the work of
  someone else without their consent; propose it to them (pull request, comment) instead.

### Language

- **Everything in the repository is English**: files and documentation, code comments, commit messages,
  branch names, pull requests, issues and release notes. Only the conversation with the people is German.
- Text that the product itself shows to its users (an app's interface, a device's display, its store page)
  stays in the language or languages the product is made for. "Project knowledge" names them.
- **A product in several languages stays in all of them.** Every new or changed text goes into every
  language the product offers, in the same change; never leave one language behind, drop one, or fall back
  to another language silently. Write each language naturally (not word for word), with its proper
  characters (ä, ö, ü, ß in German). Check that no text is missing in any language before calling the change
  done.
- Where a project still has older content in another language, do not translate it on your own: offer it as
  a choice.

### Testing

- Where the project has automated tests, **every new behaviour that can be tested automatically gets a test,
  and a sabotage check**: break the behaviour on purpose (it must still compile, and it must break the
  behaviour, not just a selector or a text), run the test, see it fail, put the code back and confirm that
  the file is byte for byte what it was (`cmp`). A test that passes against broken code is worthless.
- **What cannot be tested automatically** (hardware, devices, displays, animations, things that need a real
  account or service) gets no test suite of its own. Check it as far as possible (build, compile, a preview),
  then on the real device or service, and say plainly which part is checked how.
- Where the project has no tests at all, do not set up a test suite on your own: when a change would be
  risky without one, offer it to the owner as a choice.
- Run the project's checks before pushing, as "Project knowledge" or the project's own instructions say.
  Where they say nothing: the checks that cover what changed, and the whole suite when the change could have
  effects elsewhere.

### Safety and data

- **Never put secrets into the repository**: passwords, API keys, tokens, private addresses. Use the
  project's way of keeping them out (environment, settings, `.gitignore`); if there is none, ask.
- **Personal data** (of the people or of the product's users) is not sent anywhere new, logged or published
  without asking.
- **What users have stays usable after an update**: their settings, saved data, accounts. When a change
  would break or reset them, say so before building and offer a way to carry them over.
- **Never overwrite `main` with a force-push and never delete it.** Not even when asked in passing; the
  owner does that themselves if it is ever needed.
- **Ask before anything hard to undo**: deleting data or files that are not part of the change, rewriting
  history, changing a live service, publishing to a store.
- **New libraries or services** only with a reason, said in plain words; prefer what the project already
  uses.

### Changes

- **One topic per change** (branch, pull request): easier to check, to release and to undo.
- **One branch per task.** Create it from the latest default branch (usually `main`) with a name that says
  what the change is about: `type/short-topic`, lower case, English, words joined by hyphens - `feature/` for
  something new, `fix/` for a bug, `docs/` for documentation, `chore/` for tidying up (e.g.
  `feature/online-update`, `fix/ota-redirect-query`, `docs/ai-rules`). Not who or when, and nothing vague like
  `test` or `update2`. Push to that branch instead of the random branch name the environment gives the
  session; this is the owner's standing permission to push to such branches. A new task in the same session
  gets a new branch. Merge into the default branch only when the person asks for it; where others work on the
  project, propose the merge as a pull request instead. Where the project has its own naming habits, follow
  them.
- **After a merge or release, the new version is not everywhere at once.** GitHub keeps copies for a while
  (raw files and download links about 5 minutes, GitHub Pages about 10), and whatever a workflow builds or
  publishes only exists once its run has finished. Tell the person **how long to wait** (from the cache times
  and how long the project's last run took) and **how to check that the new version has arrived**: the run
  finished green under "Actions", the new version number in the app, on the release page or in the file, the
  new text on the page after a reload that bypasses the browser's cache. Where you can check it yourself, do
  so before calling it done, and say what you saw.
- **Commit messages and pull request titles** say in one line what changes, e.g. "Fix online update: keep
  the signed download URL"; more detail, and why, goes below.
- Changes that users notice go into the release notes or changelog in plain words (in English, like
  everything in the repository; texts shown to users inside the product or in a store, such as "what's new",
  in every language the product offers).

### Repository

Aim for what is common practice on GitHub, in proportion to the project: a small experiment needs less than
something others install. **Do not restructure an existing repository on your own**: point out what is
missing, with a recommendation, and let the people choose.

- **README**: what the project is (with a picture where it helps), how to install and use it, how to work on
  it (build, test, release), and its licence. Keep it up to date with every change that affects it.
- **Pull request descriptions**: what changes, why, how it was tested (and what was not), and anything the
  reviewer should know.
- **Automatic checks (CI)**: every push and pull request builds the project and runs its tests
  automatically; merge only when they pass. Where a project has none, offer to set it up.
- **Releases**: version numbers `vMAJOR.MINOR.PATCH` (e.g. `v1.4.2`: major for breaking changes, minor for
  new features, patch for fixes). Files that are published are built by CI, never by hand. Each release says
  in plain words what is new and how to install or update.
- **Basics**: a `.gitignore` for build output and local files, a **licence** file (without one, nobody may
  legally reuse the code, even in a public repository; the choice of licence is the people's), and a
  `CHANGELOG.md` where releases alone do not tell the story.

- **Protecting `main`**: when the rules are installed, check whether the repository is public or private.
  - **Public**: recommend to protect `main` against force-pushes and deletion, and give the steps below. The
    owner of the repository decides whether it makes sense for this project. You cannot set it up yourself,
    because you have no access to the repository settings.
  - **Private**: recommend nothing where the repository belongs to the rules' owner: they have no GitHub Pro,
    and in a free account branch protection and rulesets exist only for public repositories (source:
    `github/docs`, file `data/reusables/gated-features/protected-branches.md`). They can ignore GitHub's
    notes about missing protection there. Where the repository belongs to someone else, their plan decides
    and you cannot see it: mention once that protection on a private repository needs a paid plan (Pro or
    Team), and leave the decision to its owner.
  - **If you cannot tell** whether the repository is public or private (no way to look it up), ask instead of
    guessing.
  - **Whose repository it is matters**: only the repository's owner (or an admin) can open its settings. Where
    it belongs to someone else, say so and tell the person to pass the steps on to them.

  Steps for the owner (give them in German):

  1. Auf GitHub das Repository öffnen: **Settings → Rules → Rulesets → New ruleset → New branch ruleset**.
  2. Name: `main schützen`. **Enforcement status**: `Active`.
  3. **Target branches → Add target → Include default branch**.
  4. **Restrict deletions** und **Block force pushes** angehakt lassen.
  5. **Require status checks to pass** nur anhaken, wenn das Projekt CI hat; dann die CI-Prüfung auswählen.
     Achtung: Dann kann niemand mehr direkt auf `main` pushen, jede Änderung muss erst auf einem anderen
     Branch die Prüfung bestehen. Das passt nur, wenn ohnehin nichts direkt auf `main` geschrieben wird
     (auch kein Workflow). Bleibt ein Merge hängen, zuerst dort nachsehen: ob die Prüfung umbenannt wurde
     oder bei dieser Änderung gar nicht lief.
  6. **Nicht** "Require a pull request before merging" mit Approvals anhaken: Wer allein arbeitet, kann eigene
     Pull Requests nicht freigeben und würde sich selbst aussperren. Auch zu zweit ist es nicht nötig und
     bremst nur jeden Merge; der Schutz vor Force-Push und Löschen reicht.
  7. Auf **Create** klicken.

  Geklappt hat es, wenn das Ruleset in der Liste unter **Rulesets** als "Active" steht.
  Für weitere Projekte: das Ruleset dort über **Export ruleset** speichern und im nächsten Projekt über
  **Import a ruleset** übernehmen.

### Showing changes

- Show visual changes rather than describing them: **screenshots** where the result runs on a computer.
- Where no screenshot is possible (a device, a display, a phone app, print): build a **preview** (a mock-up
  page, a pixel preview), or ask for a **photo** of the real thing.

### Checking facts at the source

- Do not build on memory where the real thing can be checked: read the actual source of a library, look at
  the real answer of a server or service, read the real data. Behaviour that "should" be so is often not.
- When a cause is unclear, **ask for a log or an error message before guessing**, and say what it would show.

### Keeping knowledge in the repository

- Sessions end and are deleted; the repository stays. What a later session needs to know goes into the
  project's files ("Project knowledge", the README, other docs, commit messages), not only into the
  conversation: decisions and why, traps that cost time, how to build, test and release, and the limits of
  the environment (what a cloud session cannot do there).

<!-- owner-rules v12: general (AGENTS.md) - end -->

## Project knowledge

Most of this project's knowledge is in the sections above and in `DEVELOPMENT.md`; this list points to it.

- **People:** the owner (GitHub: Dr-Nerdlove) works on it alone, with AI assistants, and does not program. They
  decide about merging and releases; as "What has proven itself" says, tested changes may be built and
  published without asking; each task gets its own branch, merged into `main` once they agree.
- **Repository language:** English since October 2026 (the owner's decision, because the repository is public):
  documentation, comments and commit messages. German identifiers in the code stay as they are. Older commit
  messages and GitHub releases from before that stay German. Commit messages and the build workflow are plain ASCII.
- **Product languages:** German and English, following the system language. Fixed labels in `MARKUP_EN`, script
  texts in `TEXTE` (both in `index.html`); Android language lists are written by `apk.yml`. Stored data keys are
  never translated.
- **Build and test:** no automated tests. Syntax check and local server as under "Check, don't hope";
  interface checks with puppeteer-core against the preinstalled Chromium. Not checkable here: the Java parts
  (only the GitHub build shows it) and the real effect on a phone (the owner sends a phone screenshot).
- **Release:** see "Releasing a new version": version in `package.json`, `data-fassung` and
  `CHANGELOG.md`, no two-digit parts, never lower. A push to `main` publishes the web version; the APK comes from
  the `apk.yml` workflow with `veroeffentlichen`. Never change the signing key.
- **Traps:** a new game field must be carried in four places; the embedded fonts are not clutter; `.wrap`
  padding in two places; touch targets of at least 44 px; "Played today" must not re-sort; the test traps under
  "Check, don't hope" (`getComputedStyle` after `render()`, `pkill -f`, empty shelf, Capacitor bridge,
  Wikidata 429).
- **Repository:** public; GPL-3.0-or-later (`LICENSE`; the fonts keep the OFL 1.1). Version scheme `x.y.z` without
  two-digit parts (see "Releasing a new version"), changes in `CHANGELOG.md`. No tests; the only automatic check is a
  syntax check of the script and `sw.js` in `pages.yml`, which stops the web version from going out when it fails.
  The APK is built on demand by `apk.yml`.
- **Limits of the environment:** a cloud session cannot push tags (HTTP 403; use the workflow instead) and cannot
  compile Java. Wikidata throttles cloud machines.
