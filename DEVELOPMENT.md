# Development notes

This file is for people or programs that will continue developing the project
later. It explains how the project is built and **why** it is built that way --
the why is nowhere in the source code and would otherwise be lost.

## The core: one file

`index.html` is the whole application -- structure, styling and logic in one
file, around 2600 lines. No toolkit, no dependencies, no build step. Opening
the file is enough.

It also contains the two fonts as data (around 120 KB, credits in
`FONTS.md`). That is why the file is around 250 KB instead of 130. In return
there is **no network request nobody asked for**, and the page looks the same
offline as online. (The only exception is the "Find data" button, see "Looking
up data on Wikidata".) Before, the fonts came from Google -- the app promised
"no network needed" and did not keep that promise when it came to looks.

This is a deliberate decision, not negligence. The project should still run in
five years and be something a person can continue developing without wanting to
set up a toolchain. Anyone who introduces modules, bundlers or a UI framework
here trades that property for convenience. That can be well justified, but it is
a real trade-off.

The script part, from bottom to top: data (`MOODS`, `BEISPIELSPIELE`), storage,
scoring (`evaluate`), output (`render*`), form, event handling.

## Storage

The collection lives **only on the device**: `localStorage`, written by
`persist()`. In the Android app that is the app's storage, in the web version
the browser's. There is no account and no sync; the way between devices is the
backup. The line above the form tells the user this.

There used to be two more ways, both gone -- see the git history:

- a **Claude account** (`connectDb()` via the `db` capability of an artifact)
  for the page as a Claude artifact, removed in 2.9.2,
- until 1.4.1 a bundled **Node server** for the home network, including a
  Windows service, dropped in 2.0.0. To find it:
  `git log -- spieleabend-server.mjs`.

**Important when changing things:** every new field on a game must be carried
in *four* places, or it is silently lost: `normalize()` (reading in and
limiting), `submitGame()` (taking it over when editing), the export projection
in `renderCollection()` and -- if it can be edited in the form -- `startEdit()`
and `resetForm()`. This exact mistake happened once with the `lastPlayed`
field.

## Recurring decisions

- **Nothing is ruled out hard that the user might still want.** Recently played
  games slip down the ranking but do not disappear: someone who wants a rematch
  should be able to find the game.
- **Reasons instead of silent disappearing.** What falls through a filter is
  listed below with the reason ("with the explanation, takes 65 min or more").
  That is the property that makes the tool usable.
- **Never say anything twice.** The reason line names the moods that matched;
  the tag line below it therefore leaves them out (`uebrigeTags()`) and
  disappears completely if nothing is left.
- **No line that appears on every card.** A note that everyone shares says
  nothing. That is why "never played" only appears once there is any play
  history at all, and why the reason line stays empty when no filter is set.
  This was needed three times -- the temptation is great.
- **Explanation time comes from the complexity**, not from a flat amount: easy
  +5, medium +10, demanding +20 minutes.

## Android app

`.github/workflows/apk.yml` builds the APK on GitHub's machines, because the
Android SDK is preinstalled there. Capacitor packages `index.html` into an app.

The workflow runs in four cases:

- **A push to `main` that changes `package.json`** (a merged pull request): if
  the version there has no tag yet, it builds and releases it. If the tag exists
  (say only a dependency changed), the small job `entscheiden` stops it before
  anything is built. Decided in November 2026 with the owner: a release should
  not need a manual start, but also not come with every small change - so the
  version number in the pull request is the switch.
- **A pull request** that touches `apk.yml`, `package.json`,
  `capacitor.config.json` or the app icons: a trial build, nothing is published.
  That is the check for the Java parts, which cannot be compiled anywhere else.
  Pull requests from forks are skipped (no secrets, so no signing).
- On a version tag (`v*`) or via "Run workflow" with the `veroeffentlichen`
  checkbox: a release by hand.
- "Run workflow" without the tick: a trial run.

A release stays unchanged afterwards; a trial run only attaches its APK as a
build artifact (it disappears after seven days).

**What the workflow adds to the freshly generated Android project** -- `npx cap
add android` creates `android/` anew on every build, which is why everything
customised is written as a heredoc in the workflow:

- the native building blocks `SystemfarbenPlugin` and `SprachePlugin` and a
  `MainActivity` that registers both (see "Material You" and "Two languages"),
- `values-de/strings.xml` (German app name), `locales_config.xml` including the
  reference in the manifest,
- the signing and the version number.

**Java cannot be compiled outside the build.** The pull request's trial build
shows whether a change to these building blocks holds; merge only when it is
green.

### The icon

The source is **`Board-Game-Recommender_Logo.png`**; all `icon-*.png` and both
`app-icon-*.png` are computed from it. Anyone who edits one of them by hand will
get deviations on the next run.

The mark is a **disc**: dark green `(35, 84, 62)` on the left, ochre
`(234, 171, 54)` on the right, dividing line exactly in the middle -- the same
two-part split as in the logo. On it sits the motif, scaled to **118 % of the
circle's diagonal** and moved up by 1.5 %. At these values nothing is clipped
and the margin stays even; they come from a comparison of 112, 118 and 124
percent.

Four things that went wrong while building and can go wrong again:

- **The light edge of the original has to go**, otherwise its anti-aliasing
  fringe draws the silhouette of the old tile into the disc. Flood fill from the
  image edge (threshold 225), then erode by two points. Cutting out by colour
  does *not* work: the die `(226, 162, 55)` is too close to the background
  ochre.
- **The light outlines of the hexagons drop out in the process** and have to be
  brought back, otherwise the hexagons are barely visible on the green. They are
  attached to the page background, because the hexagons stick out of the tile at
  the bottom. Brightness will not do it -- at around 248 the page background is
  just as light as the outline. Shape will: without an outline every hexagon is
  a connected part of its own, separated from the large part made of tile and
  content. So take everything except the largest part and fill the gap again, 18
  points wide (measured in the original).
- **Build everything first, then punch out the disc.** The motif brings the
  tile background with it -- that belongs, but has to be cut off as well.
- **Both layers of the adaptive icon fill the whole image area** -- the
  foreground too. That sounds wrong, because Android shows only the middle 72 dp
  of a 108 dp layer, and it was my first mistake too: I computed the motif for
  those 66 percent, and on the home screen it appeared only half as large as
  intended. The reason is in `ic_launcher.xml`, which `capacitor-assets` writes:
  it sets up both layers with `<inset android:inset="16.7%">`. That puts our
  image as a whole into the visible area. Anyone who computes for 66 percent
  again shrinks it a second time.

  This can be checked without a device: `npx cap add android`, then
  `npx capacitor-assets generate --android`, and look in
  `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`.

### The backup as a file

In the app, `<a download>` does nothing. Capacitor's WebView is not given a
`DownloadListener` -- checked in the source of `@capacitor/android`, there is
none. So the click fizzled out, and the message claimed "File saved" anyway.

That is why the app now writes the file itself (`@capacitor/filesystem`) and
hands it to Android's share sheet (`@capacitor/share`). It is written to the
cache: that is the only place the app may write without a permission and the
share sheet can read -- `android/app/src/main/res/xml/file_paths.xml` releases
exactly that with `<cache-path>`.

**Straight into the Downloads folder does not work.** Since Android 11 no app
gets at the public folders without further ado; the directories the filesystem
plugin offers for this (`DOCUMENTS`, `EXTERNAL_STORAGE`) run into the permission
there and fail. Through the share sheet the user picks the place themselves, and
"Save to Files" leads into the Downloads folder.

**The plugins are not registered, they are already there.** At start the native
side writes a ready-made object for every registered plugin into
`window.Capacitor.Plugins` -- `JSExport.getPluginJS` in the source of
`@capacitor/android` produces it method by method. It is used from there:
`window.Capacitor.Plugins.Filesystem.writeFile({…})`.

There is **no** `registerPlugin` there. That lives in the package
`@capacitor/core`, which is bundled along in a project with a build step --
this page deliberately does not load it. My first attempt called it anyway; the
button aborted before anything happened, and silently. Anyone changing anything
here: `window.Capacitor` is assembled from three places
(`JSExport.getGlobalJS`, `native-bridge.js`, `JSExport.getPluginJS`), and only
what is in those is present in the app.

This can be reproduced in the browser with a dummy that rebuilds exactly these
three places -- explicitly without `registerPlugin` -- and checks all four cases
(browser, app, cancel, app without the plugins). A test that rebuilds its own
assumption instead passes and proves nothing. (The check scripts were throwaway
files and are not in the repo.)

### Material You

From version 12 on, Android derives a palette from the wallpaper and makes it
available **to native apps only**. These colours are deliberately hidden from
the browser engine -- the colour could be used to recognise a device. Measured:
Chromium does not even know the CSS keyword `AccentColor` meant for this
(`CSS.supports('color','AccentColor')` is false). So there is no way around
native code.

`SystemfarbenPlugin.java` reads the palette via
`getIdentifier("system_accent1_600", "color", "android")` -- by name instead of
via `android.R.color.*`, so that on older devices it simply drops out instead of
failing. The workflow rewrites the file on every run, together with a
`MainActivity` that registers it (and the `SprachePlugin`); after all, `npx cap
add android` creates the project fresh each time. The `registerPlugin` must come
**before** `super.onCreate` -- that is where the bridge is built, and plugins
registered afterwards come too late (see `BridgeActivity.onCreate`).

Android's steps run opposite to the Material numbering: **0 is the lightest,
1000 the darkest.**

The tricky part is not reading it but the contrast: the palette comes from the
wallpaper and can be anything. That is why `passtStufe()` recalculates every
text colour and moves on to the next step if necessary. One case cannot be
solved that way and needs `knopfPaar()`: if the button tone is too light for
white text, searching further on the text side does not help -- it cannot get
lighter than step 0, so the surface is darkened instead. With a green wallpaper
the button tone is `#318c4f`, and white on it only reaches 4.0.

This can be checked without a device: a dummy for
`Capacitor.Plugins.Systemfarben` feeds in made-up palettes -- blue, red, green,
yellow and an unusable one made of nothing but mid grey. What is expected: four
palettes take effect in light and dark with all contrasts above 4.5:1, the
unusable one falls back to the app's own colours.

### The back button

Left alone, Android's back button ends the app immediately -- whether you are in
the form, browsing the collection or far down the page. Capacitor itself does
not handle it at all (there is nothing about it in the source of
`@capacitor/android`). Only `@capacitor/app` hooks in, and like this: if there
is **no** JS listener, it goes back in the page's history -- so on a page
without history, nowhere, and the app could no longer be left with Back at all.
Anyone who adds the plugin therefore has to register the listener and decide
themselves when to quit.

`eineEbeneZurueck()` in `index.html` fixes the order: form, backup section,
collection, reject list, scroll to the top -- and only then out. The whole
listener sits in a `try`, and if anything fails, the app quits. That is exactly
the behaviour without the addition; nobody should get stuck in the app because
this code has a bug.

### Signing

**The most important part of the whole workflow.** For Android, the signature is
an app's identity. Two packages with different identities are two different
apps, even with the same name and the same ID -- an update then fails with "App
not installed", and the only help is uninstalling. In doing so Android deletes
the app's storage, that is, the whole collection.

That is exactly what happened up to and including 1.2.0: it was built with
`assembleDebug`, and the debug key normally sits on the developer's computer in
`~/.android/debug.keystore`. GitHub's machines are fresh on every run -- the file
is missing there, so Gradle created **a new random key every time**.

Since then: `assembleRelease` with a fixed key from two secrets.

| Secret | Content |
| --- | --- |
| `SIGNIER_SCHLUESSEL` | the key file, Base64-encoded |
| `SIGNIER_PASSWORT` | the password, the same for store and key |

To be created under *Settings → Secrets and variables → Actions*. If they are
missing, the build stops right in the second step with an understandable message
-- better that than a package that cannot be updated later.

Inside, the key is called `spieleabend` (alias, fixed in the workflow). Every
build reads the fingerprint of the finished APK and compares it with
`ERWARTETE_SIGNATUR` in the workflow; on a mismatch it stops before anything is
released. The fingerprint is no secret -- it is in every APK and is there to be
checked.

It is read with **`apksigner`**, not with `keytool`: the latter only understands
the old JAR signature (v1), which is no longer produced at all from `minSdk 24`.
This mistake has happened and went unnoticed, because in a pipeline only the
exit status of the last element counts -- hence `set -o pipefail` in that step.

Three things you have to know:

- **If the key is lost, it is gone.** Then no update can be built any more, and
  all users would have to uninstall once. A copy belongs in a safe place outside
  GitHub.
- **The key never belongs in the repository.** Hence the secrets.
- **Never replace it unless it has to be.** A replacement means for every user:
  uninstall, reinstall, back up the collection beforehand.

### Releasing a new version

The version number is in **three** places. The workflow compares them and stops
if one differs -- this comparison is the actual safeguard:

| Place | Form |
| --- | --- |
| `package.json` | `"version": "1.2.3"` |
| `index.html` | `data-fassung="1.2.3"` on the footer element |
| `CHANGELOG.md` | section `## [1.2.3] – YYYY-MM-DD` |

A push to `main` updates the **web version** by itself (see there). The **APK**
is released by itself when a push to `main` raises the version (see "Android
app"). By hand there are two more ways that end up in the same place:

**In the browser** -- "Actions" tab → "Android-App bauen" → "Run workflow", tick
`veroeffentlichen`. The tag is created in the process.

**On the command line**

```bash
git push origin main
git tag v1.2.3
git push origin v1.2.3
```

GitHub does the rest: build the APK, name it `game-night-1.2.3.apk`, create the
release `v1.2.3` and insert the matching section from `CHANGELOG.md` as the
accompanying text.

There is a solid reason for the browser way: from a Claude Code session **no
tags can be pushed** -- the server rejects it with HTTP 403, while branch pushes
go through. Without this way an assistant could continue developing the project
but could not release a version.

Android additionally requires an integer that must never get smaller. It is
computed from the number: `1.2.3` → `10203`. That leaves room up to 99 for each
part -- anyone who needs a three-digit patch version has to change the formula
**and** make sure the number still grows.

Which version runs on a device is shown in the footer of the page. That is the
only place where a user can read it -- please keep it up to date.


### System bars (top and bottom edge)

Since Android 15 the app draws underneath the status bar and the navigation bar
("edge-to-edge"). Without a countermeasure the clock covers the heading.

Solved **without an extra package**: Capacitor 8 sets the variables
`--safe-area-inset-top/right/bottom/left` on `<html>` as soon as the viewport
meta tag contains `viewport-fit=cover`. `index.html` converts them in `:root`
into variables of its own (`--sicher-oben` …) and adds them to the padding of
`.wrap` -- in **two** places, the normal rule and the one under
`@media (max-width:520px)`.

If that fails (a very old WebView version below 140), Capacitor pushes the view
inwards itself and sets the variables to `0px`. So double spacing cannot occur.
In a browser without system bars `env(…)` takes effect and also returns 0 -- the
margin is then exactly as before.

That is why `viewport-fit=cover` **must** stay in the viewport meta tag, and
Capacitor must not fall back below version 8. Capacitor 8 requires Node 22; that
is set in the workflow.

## How results are shown

The first `VOLLE_KARTEN` (three) results appear as a full card, the rest as a
row; tapping turns a row into a card (`state.expanded`). Reason: with 19 results
the page was 6600 pixels long, which is a good seven screens.

The dice push their result to **position 1** in `renderResults()` and jump to
the heading, not to the card. Before, you landed in the middle of the list with
no context. So that the information "this would have been the ranking" is not
lost, the best result is remembered **before** the re-sorting and keeps its
"Best match" label.

The "Describe the group" block folds shut (`state.filtersOpen`, remembered in
the settings). When folded, only the summary remains, and the first result moves
from pixel 1065 to 489 -- that is, onto the first screen.

## Using it on a phone

**44 pixels is the lower limit for everything that is tapped.** Android
recommends 48, Apple 44. Before, 72 of 112 controls were below it -- the chips at
34, the sort buttons at 27, an expandable row at 18. That never shows at a desk
with a mouse and shows immediately on a train.

It can be checked in one pass: collect all `button`, `input`, `summary` and
`textarea`, measure the height, report everything under 44. For checkboxes the
surrounding label counts, not the box.

Two places depend on it:

- **The button row below the filter is sticky** (`position:sticky`) while the
  block is open. Without it, "Let the dice decide" starts at pixel 882 of 915.
- **The player count is a counter**, not one chip per number. That pays for the
  space the larger chips cost -- and removes the arbitrary limit of 12.

## Why "Played today" does not re-sort

The button sets `lastPlayed` to today. In the scoring that costs 25 points, so
the game slips to the end -- and thereby disappears from under the finger at
exactly the moment you confirmed it. Measured: afterwards a label of a different
card sat in the same spot.

That is why the button does **not** call `render()` but `frischeKarte(g)`: this
one card is rebuilt, the order stays. The new ranking takes effect at the next
roll or filter change. Anyone who switches back to `render()` brings the problem
back.

The same holds for **"Not in the mood"** (`data-pause`): it also only calls
`frischeKarte(g)` on the card.

## Why "Not in the mood" pauses instead of hiding

The owner asked for a way to push back games that rise to the top because they
have not been played for months (they get the "long unplayed" bonus), but which
nobody feels like playing right now. Decided with them:

- **Three months, then it ends by itself** (`pausedUntil`, a timestamp; 0 = no
  pause). A pause that ends on its own cannot be forgotten.
- **The game stays among the matches, sorted to the end** - not into "doesn't
  fit tonight": it does fit, the group just does not want it. That follows the
  rule "don't hard-exclude, lower it and name the reason". The bar still shows
  the real match; the reason line says "paused until ...".
- **The dice skip paused games** unless nothing else fits.
- `pausedUntil` is carried in all four places (`normalize()`, `submitGame()`
  keeps it from the existing game since the form has no field for it, the export
  in `renderCollection()`; the form itself does not need it). The export leaves
  the key out when a game is not paused, so backups stay as they were.

## Light and dark

There is **only one** palette for dark, in `@media (prefers-color-scheme: dark)`.
There is no longer a switch in the page; the device decides.

For this to work in the Android app, there is a chain you should know before
touching it:

1. The WebView derives `prefers-color-scheme` from the **`isLightTheme`**
   attribute of the app theme -- not directly from the system setting.
2. Capacitor's activity theme is `Theme.AppCompat.DayNight.NoActionBar`, and
   DayNight sets `isLightTheme` according to the device's night mode.

Anyone who changes the theme in `android/app/src/main/res/values/styles.xml` to
a fixed light or dark variant pins the page down as well.

If the page does **not** follow the system on a device, the next step is
`WebSettingsCompat.setAlgorithmicDarkeningAllowed(true)` in `MainActivity` -- the
workflow would have to write that in after `npx cap add android`, because the
`android/` folder is created anew on every build.

## Two languages

The interface speaks German and English. **There is deliberately no switch of
its own**: the language comes from the device. From Android 13 on it can
additionally be set for the app alone (Settings → Apps → Game Night →
Language); the web version follows the browser's language.

### Where the language comes from

This is the spot where it is not as simple as it looks.

In the WebView, `navigator.language` **always reports the system's language** --
even when a different one is set for the app. That is not a fault of the page:
the WebView simply does not get the app language, and Google considers that
intended. Anyone who relies on `navigator.language` alone builds an app whose
language setting visibly does nothing.

That is why the app also asks natively. The order:

1. the last remembered language from `localStorage` -- so that the first sight
   is already right and nothing jumps,
2. otherwise `navigator.language`,
3. in the app: the answer of the `Sprache` plugin, which always wins and
   refreshes what was remembered.

Step 3 only arrives after the first paint -- a bridge to Capacitor is always
asynchronous. That is why the switch must work **in both directions**, also back
to German. For that, `spracheAnwenden()` remembers the German original text of
every element in the first pass (`URTEXT`, `URATTR`); without this memory the
translation would be a one-way street.

All that is visible is a brief jump, and only on the very first start after a
change -- after that the language is remembered in storage.

### What the Android project needs for it

- **`res/xml/locales_config.xml`** lists which languages the app supports, and
  `android:localeConfig` in the manifest points to it. **Without both, the
  "Language" item does not appear in the app settings at all.**
- **`SprachePlugin`** reads `getActivity().getResources().getConfiguration()` --
  only the activity's configuration carries the app language.
- **`MainActivity.onConfigurationChanged`** reloads the page when the language
  has changed. Necessary because the manifest lists `locale` under
  `configChanges`: Android then does *not* rebuild the activity, and the page
  would otherwise stay in the old language until someone quits the app.

Two dictionaries, because they have two different jobs:

| | where the original text lives | what for |
| --- | --- | --- |
| `MARKUP_EN` | in the markup (German) | fixed labels; replaced for English only |
| `TEXTE` | in the dictionary (both languages) | everything the script builds itself |

So the markup keeps its German original text. That is on purpose: the file stays
understandable to read, and if the script fails, something sensible is still
there. `spracheAnwenden()` replaces the labels at start by means of `data-t`
(content) and `data-t-attr` (attributes such as `placeholder` or `aria-label`).

**What is not translated, and why.** The keys of the stored data stay the same
in every language: `party`, `gruebeln`, `leicht`, `mittel`, `schwer` and the
rest. They are in the stored collection and in every backup. Anyone who
translates them makes every existing backup unreadable and separates the two
language versions from each other. Measured: a backup from the German app can be
read into the English one and vice versa, and moods and complexity arrive
correctly.

The notes of the example games exist twice (`note` and `noteEn`);
`beispielSammlung()` takes the matching one on loading, and only one is stored.
Notes typed in by the user are not touched by the language choice -- they are
the user's data, not a label.

**The version number** is no longer in the footer as text but as `data-fassung`
on the element; the script turns it into "Fassung 1.2.3" or "Version 1.2.3". So
the number stays a single place, and the workflow still checks it -- it now
looks for `data-fassung="…"`.

**The name in the app menu** follows the same rule, but via Android:
`capacitor.config.json` supplies the English name, and the workflow additionally
creates `values-de/strings.xml` with "Spieleabend". Android chooses by the
system language.

## The empty shelf and the examples

Up to 2.7, 21 games from the author's shelf were in the code as the starting
collection. Since 2.8 the shelf starts empty -- whoever gets the app should not
first have to delete somebody else's games. That makes the empty shelf the first
sight for every newcomer, so it gets two buttons instead of a sentence: "Add
your first game" and "Load example games". "Let the dice decide" is greyed out
as long as nothing fits.

A collection that is already stored stays untouched on update (measured with 21
games in storage). Only a collection that was never saved would be lost -- that
is, one that was never changed.

## Looking up data on Wikidata

**Why not BGG:** since July 2025, BoardGameGeek requires a registration and a
personal token for the XML interface, which is not supposed to be passed on. In
an app that others install, it cannot be accommodated.

**Wikidata** is free (CC0), needs no key and, with `origin=*`, also answers
requests from the browser. Two requests per search:

1. `list=search` with `haswbstatement:P1872` -- only entries with a player
   count. Without this filter, a search for "Catan" returns the city of Catania
   first.
2. `wbgetentities` for up to six results, with labels and statements.

Evaluated are P1872/P1873 (player count), P2047 (duration, converted to minutes,
ranges too) and P136/P31 (genre/kind → mood suggestion, table `WD_STIMMUNG`).
With several statements the preferred rank counts, otherwise all normal ones;
deprecated ones never. Example Wingspan: maximum player counts 5, 7 and 2
entered -- without regard to rank the expansion would have slipped through.

Not available: complexity and best player count. The message says so instead of
pretending the form is complete.

**Throttling:** Wikidata answers too many requests with 429 -- and without a
CORS header. The browser then reports only a network error. The app therefore
uses `navigator.onLine` to distinguish "no network" from "Wikidata currently
unreachable or overloaded". When testing from a cloud machine, throttling
applies after just a few requests; on a phone it is not to be expected.

## Web version (GitHub Pages)

**Why:** there is no APK for the iPhone, and the App Store requires a paid
developer account. A page on GitHub Pages costs nothing (the repo is public) and
can be put on the home screen via "Add to Home Screen" like an app.

**Publishing:** `.github/workflows/pages.yml` copies only the web files
(`index.html`, `sw.js`, `manifest.webmanifest`, `icon-*.png`) to `site/` and
pushes them to Pages. Every push to `main` that touches one of them updates the
web version; there is no version-tag step. The Android app continues to be built
by `apk.yml` alone.

**`sw.js`:** the page is loaded *network first* -- whoever is online always has
the newest version, and `sw.js` contains no version number that could be
forgotten. Only without a network does the cache step in. Icons and manifest
come from the cache and are refreshed in the background. The worker does not
touch foreign addresses (Wikidata).

**Not in the Android app:** there the APK delivers the files itself. A worker
could hold on to the old version after an update. It is registered only over
https or `localhost`, never in the app.

**Note for the iPhone:** a small box above the shelf that can be tapped away. It
appears only on iOS (iPad too, which reports itself as a Mac), only in the
Safari tab (not from the home screen), never in the app and no longer once it has
been tapped away (`spieleabend.ioshinweis`).

**The seven-day rule:** through Intelligent Tracking Prevention, Safari deletes
the script storage of sites that have not been visited for seven days. Web apps
from the home screen are exempt. Hence the box -- and hence the advice to back
up. With `localStorage` this is not a fault of the page, but iOS.

### Two traps of the web version

**Separate storage on iOS.** The Safari tab and the home-screen app do not share
`localStorage`. Anyone who creates a collection in the tab and then puts the
page on the home screen finds an empty shelf there. The iPhone note therefore
says explicitly: first to the home screen, then enter games -- and mentions the
move via "Backup & moving".

**The browser clears storage by itself.** A browser may delete a site's data
without further ado when space gets short. `speicherFestmachen()` asks for
persistent storage (`navigator.storage.persist()`) on the first save --
deliberately not on opening, because Firefox prompts for it and the question
only makes sense once there is something to protect. Against Safari's 7-day rule
this does not help.

## Backup reminder

The collection lives only on the device, and hardly anyone backs it up on their
own. That is why the page shows a reminder (`erinnerungPruefen()`, a box in the
style of the iOS note). The thresholds are deliberately restrained: from 5 games
on (a tiny collection is not worth the nagging), if never backed up only 14 days
after the first save (not right on the first evening), otherwise 30 days after
the last backup. "Later" postpones by 7 days.

What counts as a backup: "Copy as text" if `writeText` succeeded; in the app
`share()` without cancellation; in the browser the started download. The
fallback (just selecting the text) does **not** count -- whether it reached the
clipboard is unknown. "Back up now" only opens the backup and does not count.

Keys (timestamps in milliseconds): `spieleabend.seit` (first `persist()`),
`spieleabend.gesichert`, `spieleabend.erinnerungspaeter`.

## The date field

`<input type="date">` shows the format of the **system language**, not that of
the page. A `lang="de"` on the field changes nothing -- checked in Chromium, all
three variants gave `mm/dd/yyyy`. There is no way to force it without giving up
the device's calendar; on a phone that is the most valuable thing about the
field.

That is why the chosen day appears once more below it, written out
(`datumAusgeschrieben()`), in the language of the interface
(`toLocaleDateString(ORTSFORM, …)`, that is `de-DE` or `en-GB`) and with the
weekday. Anyone who tidies up here and removes this line brings the problem
back.

## Automatic checks

Until November 2026 there were no automated tests: every change was checked by
hand with a headless browser. Then the owner asked for the safety net they have
in their other projects - a check on every pull request, so a change that does
not fit `main` shows up before the merge. `checks.yml` runs three jobs:

- **syntax** -- the same check as in `pages.yml`;
- **version** -- `tests/check-version.sh`: `package.json`, `data-fassung` and
  `CHANGELOG.md` agree, and no part has two digits;
- **browser** -- `tests/smoke.mjs` with `puppeteer-core` (pinned in
  `tests/package.json`, kept apart from the app's own `package.json` so the APK
  build does not install it). It serves the folder itself, blocks the service
  worker and every outside request (Wikidata), gives each test a clean browser
  context and fails on any console error.

Each test was checked by sabotage: the behaviour broken on purpose, the test
seen failing, the file restored. The touch-target test measures a checkbox
through its label, as the 44-pixel rule says.

## What is left out on purpose

- **No third language.** German and English are enough; every further one
  doubles the upkeep without anyone having asked for it.
- **No box images.** Every comparable app lives off them. Here they would need
  either a network or a lot of storage, and the legal situation of publisher
  images is unclear. The gain does not outweigh the loss of the offline
  property.
- **No home server any more.** Up to 1.4.1 a Node server was included that shared
  the collection in the home network, including a Windows service. The project is
  an Android app with a web version; the server was maintenance effort without
  benefit. History: `git log --diff-filter=D`.
- **No native iOS app.** That would need a paid Apple developer account ($99 a
  year); without it a self-built app runs only seven days. The web version on the
  home screen replaces it for free.
- **No Claude artifact version any more.** The page used to run additionally as
  an artifact, with account storage and "Suggest data" via Claude. Both were
  removed in 2.9.2.
- **No sign-in.** The collection lives on the device, not on a service.
