# Changelog

All notable changes are listed here, newest first.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the numbering follows [Semantic Versioning](https://semver.org/):
with **X**.y.z something fundamental changes, with x.**Y**.z something is
added, with x.y.**Z** something is repaired.

## [Unreleased]

## [3.1.0] – 2026-11-09

### Added

- **"Not in the mood"** on every suggestion card: the game is paused for three
  months. It stays among the matches but moves to the end of the list, says
  "paused until ..." and is skipped by the dice. The pause ends by itself, or
  earlier with "End pause" on the card or in the collection. The pause is part
  of the backup; older backups load as before.

### Changed

- **The project moves from the GNU General Public License to the GNU Affero
  General Public License, version 3 or any later version.** The full text is
  in the project as `LICENSE`. For using the app nothing changes; the new
  licence additionally requires that the source of a changed version is
  offered to everyone who uses it over a network. The two bundled fonts keep
  their own licence, the SIL Open Font License 1.1.

## [3.0.1] – 2026-10-30

### Changed

- The repository was renamed to `game-night`. The links in this changelog and
  the web address now point to the new name; the app itself is unchanged and
  stored data is not affected. The web version lives at
  `https://dr-nerdlove.github.io/game-night/` (a new address means a new, empty
  storage there: move the collection over via "Backup & moving").

## [3.0.0] – 2026-10-27

### Added

- **Backup reminder:** The collection lives only on the device, and hardly
  anyone backs it up. From 5 games on, a box appears when the last backup is
  more than 30 days old (never backed up: no sooner than 14 days after the
  start). "Back up now" opens the backup, "Later" postpones it by a week. A
  copy to the clipboard counts as a backup (only if it worked), as do sharing
  in the app and downloading in the browser.

### Changed

- The build workflow now uses current versions of its GitHub building blocks
  (Node 24). GitHub is retiring the old Node version; without the switch the
  build would eventually have broken. Nothing changes for the app itself.

## [2.9.2] – 2026-10-25

### Removed

- **Everything that existed only for the page as a Claude artifact:** the
  storage in the Claude account, "Suggest data" including the request to
  Claude, the related texts and the queries on `window.claude`. The page now
  runs only as an app and as a web version, and both save on the device. The
  code was never reachable there, but it bloated the file and was misleading.
  The Wikidata lookup ("Find data") is not affected.

## [2.9.1] – 2026-10-25

### Changed

- The iPhone notice now warns about the real trap: the Safari tab and the
  Home Screen app have **separate storage**. So enter games in the app on the
  Home Screen first; anything already entered in the tab is moved over via
  "Backup & moving". The README says the same and lists what else users of the
  web version should watch out for.
- On the first save, the web version asks for persistent storage so that the
  browser does not delete the collection by itself when space runs short.

## [2.9.0] – 2026-10-25

### Added

- **Web version on GitHub Pages**, also for the iPhone: open it in Safari and
  put it on the Home Screen via "Share" → "Add to Home Screen". Every push to
  `main` that touches the web files updates it.
- **Offline use through a service worker** (`sw.js`): the page loads from the
  network first and from the cache when there is no network. It is not
  registered in the Android app.
- **A notice for the iPhone**: a box that can be dismissed, shown in the
  Safari tab, explains the way to the Home Screen — otherwise iOS deletes the
  collection after seven days without a visit.

## [2.8.0] – 2026-10-24

### Added

- **"Find data"** next to the name field: fetches the official title, player
  count and length from Wikidata, plus a mood suggestion derived from the
  genre. With several hits a small selection appears. Difficulty and "Shines
  at" are unknown to Wikidata — those stay manual work, and the message says
  so. The request goes out only when the button is tapped, never otherwise.
- **Example games to try out**: nine well-known titles, loaded with one button
  on the empty shelf.

### Changed

- **The shelf starts empty.** The author's 21 games are removed from the app
  and the repo. A collection that is already saved is kept on update.
- The empty shelf now offers two ways out ("Add your first game", "Load
  example games"), and "Let the dice decide" is greyed out as long as nothing
  fits.

## [2.7.2] – 2026-10-23

### Fixed

- "Look up on BGG" started an empty search when you edited a game from the
  collection. The link was only set while typing — when the script filled the
  name field itself, it stayed as it was. The same hit two further places:
  after "Cancel" it still pointed at the game edited before, and after a
  suggestion from Claude it searched for the old title instead of the
  corrected one. All three now go through the same function.

## [2.7.1] – 2026-10-22

### Added

- **The language can now be set for the app alone**, under Settings → Apps →
  Game Night → Language (from Android 13). Before, only the system-wide
  switch worked — the entry did not even appear, because the app lacked the
  declaration of which languages it supports (`locales_config.xml` and
  `android:localeConfig` in the manifest).

### Fixed

- The page took its language from `navigator.language`, and in the WebView
  that **always reports the system language** — a per-app language would
  never have arrived. A small native building block now reads it out and the
  page switches accordingly. On the very first start after a change, the
  language jumps over briefly; after that it is remembered in storage.
- Changing the language while the app was running only took effect after
  quitting: the manifest lists `locale` under `configChanges`, so Android does
  not rebuild the activity. `MainActivity` now checks for itself and reloads
  the page.

## [2.7.0] – 2026-10-22

### Added

- **The app is now also available in English** and follows the system
  language: a German device gets German, every other one English. There is
  deliberately no setting for it — the device already knows the answer.
  Translated are labels, reasons, messages, error texts, the dates and the
  notes of the starting collection.
- The name under the icon follows the same rule: "Spieleabend" on German
  devices, "Game Night" otherwise.

### Changed

- The version number now sits in the footer as a `data-fassung` attribute on
  the element instead of in the text; the script turns it into "Fassung 2.7.0"
  or "Version 2.7.0". The number thus stays in a single place. The build
  workflow checks accordingly.
- The README is now in English; the German version is gone.

### Unchanged — on purpose

- The keys of the saved data (`party`, `gruebeln`, `leicht` …) stay the same
  in every language. A backup from the German app can be read into the English
  one and vice versa; measured in both directions. Notes you typed yourself
  stay exactly as typed.

## [2.6.1] – 2026-10-22

### Changed

- The footer of the app now shows only the version. The note about the
  license is gone from there — the license is in the repo (`LICENSE`), and
  that is enough.

## [2.6.0] – 2026-10-22

### Added

- **On Android 12 and newer the app follows the Material You colours.**
  Android derives a palette from the wallpaper; the app adopts it for
  surfaces, text, lines and accents. On older devices and in the browser
  everything stays as before.

  Every text colour is recalculated in the process: if the contrast against
  its background is not enough for 4.5:1, the page moves on to the next tone
  step until it is. For the filled button the surface is darkened if
  necessary — the text cannot go lighter than the lightest step. If a palette
  turns out to be no good at all, the app's own stays in place; half-tinted
  would look broken.

- **The project is now under the GNU General Public License, version 3 or any
  later version.** The full text is in the project as `LICENSE`. Until now no
  license had been chosen on purpose; that meant reuse without prior
  agreement was not permitted. The two bundled fonts keep their own license,
  the SIL Open Font License 1.1.
- The bottom of the page now states which license the app is under.

## [2.5.1] – 2026-10-21

### Fixed

- **Under "Read in", two rows of buttons touched.** "Read a file" and the row
  below sat at zero points from each other, their outlines lying on top of one
  another. The gap of 8 points only applied within a row, not between two.

## [2.5.0] – 2026-10-21

### Added

- **Two coarse date buttons when editing a game:** *A month ago* and *Six
  months ago*, next to *Today*, *Yesterday* and *Clear*. Meant for games you
  played long ago but never entered here: without a date, the page considers
  a game new, gives it a bonus in the ranking and writes "never played" on it.
  Roughly right beats nothing at all.

### Changed

- **Less air under "Your group".** The row has to stay 48 points high — it is
  the tap area —, but all the rest fell below the text. Now the text sits in
  the middle: 26 instead of 41 points to the first heading, with a tap area of
  the same size.
- **The buttons under "Backup & moving" are ordered by direction.** Before,
  there were five buttons in two rows that wrapped unevenly. Now "Back up"
  ("Copy as text", "Save as file") and "Read in" (first "Read a file", then
  "Merge in" or "Replace collection"), in full rows.
- The line under the date field now says how long ago it was even for older
  dates ("6 months ago"). It used to stop at 31 days — just where the new
  buttons aim. Card, list and echo now use the same wording.

## [2.4.0] – 2026-10-20

A review of the structure: duplicates out, the same things shown the same way,
superfluous things gone.

### Changed

- **Difficulty is now shown as a word everywhere** — "Difficulty: Light"
  instead of three dots. The dots were explained nowhere, in the short result
  line even without any label, and meaningless for a screen reader. In the
  collection list the word was already there.
- **The summary now names only what is set.** Before, it normally read "4
  people · any mood · any difficulty · any time" — three of four items said
  "nothing selected".
- **"Reset" in the filter is now called "Clear filters".** The same word also
  stood above throwing away the whole collection.
- **The filter is called "Only long-unplayed"** and can thus be told apart
  from the sort of the same name; its heading "Shelf" is now "Additionally".
- **The sort now has a visible heading.** Its pills looked like the filters
  and did something different.
- **"Best for" is now called "Shines at (optional, player count)".**
- **"Let the dice decide" is outlined instead of filled.** It was the most
  conspicuous button on the start page and does what is needed least often;
  the answer is in the list below.
- **The date field appears only when editing.** When adding a freshly bought
  game, "last played" is almost never meant, but it cost four lines. A newly
  created game counts as never played.

### Removed

- **"Reset to starting collection".** The button brought back the 21 example
  games and threw away your own — only a risk for a grown collection. Whoever
  really wants to start over uses "Backup & moving" → "Replace collection".
- The number of games appeared twice on the page, in the header and at the
  collection. Now only at the top.
- A sentence in the footer text that repeated what the collection offers
  anyway.

### Fixed

- **The warning colour for dangerous buttons existed only on mouse hover** —
  so never on a phone. "Replace collection" is now always red.

## [2.3.0] – 2026-10-13

### Added

- **The Back button goes up one level instead of closing the app.** First the
  form, then the backup section, then the collection, then the list of games
  that dropped out, then to the top — and only from the top out of the app.
  Until now every tap on Back was an immediate end, no matter where you were.

### Changed

- **All tap areas are now at least 48 points high** instead of 44. 48 is the
  minimum Android names for this; 44 comes from Apple.

### Fixed

- **The two main buttons were too pale in light mode.** Light text on the
  ochre measured 4.11:1 and so stayed below the required 4.5:1. They now have
  their own, darker tone — 5.6:1. The ochre stays where it only decorates.
- **With an enlarged system font the page ran off the side of the screen.**
  The button row, the card grid and the header of a card could not wrap. Now
  nothing sticks out past the edge up to double the font size.
- The colour of the system bars now follows light and dark mode instead of
  always being ochre.
- In landscape the rows of the collection were only 44 points high.

## [2.2.5] – 2026-10-13

### Fixed

- **A backup that had been read in could silently vanish before being read
  into the collection.** The field under "Backup & moving" otherwise always
  shows the current collection and rewrote itself on every redraw — a tap on a
  filter was enough, and the file just read in was gone. "Replace collection"
  then replaced it with itself, without a word. On a new device the old
  collection would never have arrived that way. Now what you have read in or
  pasted stays until it has been merged in; closing the section shows your own
  collection again.
- Singular and plural when merging in: "1 game merged in" instead of "1
  games", "one was already there" instead of "1 were already there".

## [2.2.4] – 2026-10-13

### Fixed

- **"Save as file" still did nothing in the app.** The repair from 2.2.1
  touched the button in the wrong place: it first registered the two building
  blocks for file and sharing instead of using the ones the app provides
  itself at start. The command needed for that does not exist in the app at
  all, so the button aborted before anything could happen — without a message.
  Now it uses what is there.
- **The button no longer stays silent when something goes wrong.** Every error
  ends up visibly in the line below instead of fizzling out unheard.

## [2.2.3] – 2026-10-12

### Changed

- **The introductory sentence is shorter:** "You describe the group, the
  shelf makes suggestions." That way it fits in two lines next to the button
  instead of three below it; the header of the page now measures 145 instead
  of 169 points. The button next to it has become eight points narrower for
  that — without it the saving would only apply from 390 points of screen
  width, with it from 370 and so on the usual phones.

## [2.2.2] – 2026-10-12

### Changed

- **The introductory sentence and "Edit collection" now sit at the same
  height.** The button sits on the right, the sentence runs to its left and
  continues below it instead of taking a row of its own. The header of the
  page has shrunk from 201 to 169 points as a result; the filters start
  correspondingly earlier.

## [2.2.1] – 2026-10-12

### Fixed

- **"Save as file" did nothing in the app** — and still reported "File
  saved". The reason: the window the app runs in has nobody to accept a
  download; the click fizzled out. The app now writes the file itself and
  hands it to Android's share sheet. There you choose where to — "Save to
  Files" puts it in the Downloads folder, and mail, Drive or a chat work just
  as well. If you cancel, the app says so too. In the browser everything stays
  as it was.

## [2.2.0] – 2026-10-12

### Changed

- **The time filter is now a bar.** Before, four tiles that looked the same,
  arranged in a square — as if they were moods, although time is the only
  field that has an order. Now one continuous strip, to be read from left to
  right: Any · 30 · 60 · 90 minutes, with the "at most" in the heading. It is
  still tapped, not slid: with four values a tap is one movement and dragging
  is three, and "Any" is not a point on a time axis. The block shrank from 128
  to 77 points in the process, and every area still measures 86 × 44 points.

## [2.1.3] – 2026-10-12

### Changed

- **"Edit collection" is now on the right.** The header reads from left to
  right, the button is the jump to the end of the page — it sits at the end of
  the row.

### Fixed

- **The headings in the filter stuck to their buttons.** 8 points of space
  were intended, in fact it was zero: a `<legend>` is not a flex item, so the
  column gap provided for that does not apply to it. Now it is 12 points
  everywhere, in the filter as in the form.
- **There was too much air under "Reset" and "Let the dice decide".** The
  space for the phone's navigation bar was counted twice — once in the
  position of the button row, once in its padding. Measured 80 points instead
  of 46.

## [2.1.2] – 2026-10-12

### Fixed

- **The three hexagons in the icon have their light outlines back.** They had
  been lost when the motif was cut out; on the green part the left hexagon was
  then barely recognisable. Now all three stand out clearly on the disc again.

## [2.1.1] – 2026-10-12

### Fixed

- **The icon sat too small in its disc.** The margin was far too wide, the
  motif looked zoomed out. Cause: Android shows only the middle area of an
  icon layer, and I had calculated the motif for that — but the toolkit
  already places the layers suitably, so it was scaled down twice. The motif
  now fills the disc the way it does everywhere else; it is roughly half as
  large again as in 2.1.0.

## [2.1.0] – 2026-10-12

### Changed

- **The app icon is now a round disc.** Before, the motif sat on a tile that
  Android cut to size depending on the home screen — sometimes round,
  sometimes with rounded corners, and the old tile shape remained visible at
  the edges. The mark is now round by itself: green on the left, ochre on the
  right, the motif in the middle, nothing cut off.
- The logo at the top of the page is round to match, instead of rounded-square.

## [2.0.1] – 2026-10-12

### Fixed

- **The moods appeared twice on the card.** Once in green as the reason ("this
  is why it fits"), once in grey as a label ("these are its moods"). The label
  line now shows only what the reason has not already named — and is dropped
  entirely if nothing is left.
- The reason enumerates the German way: "A, B und C" instead of "A und B und
  C". (In English: "A, B and C" instead of "A and B and C".)

## [2.0.0] – 2026-10-12

From now on the project is an Android app. Everything that belonged to the
home server is gone.

### Removed

- **The bundled home server and the Windows scripts.**
  `spieleabend-server.mjs`, `windows-dienst.ps1`, the four `dienst-*.cmd` and
  `start-windows.cmd` are deleted, as is the code in the page that looked for
  `api/sammlung`. At app start one request is thereby dropped that always went
  nowhere anyway. Whoever still needs the server: it is in the history, `git
  log`.
- Of three storage routes, two remain: **device** and, only in the published
  Claude version, **account**. The note above the form says "on this device"
  instead of "in this browser" — in an app, browser is the wrong word.

### Changed

- **The app icon fills the mask.** Before, the logo sat small in an ochre
  ring; now it reaches to the edge. Measured: with every usual mask shape not
  a single point of background is visible any more. The corners of the motif
  are cropped for that.
- **One ladder of spacing instead of seven single values.** The source had 8,
  10, 14, 16, 18, 22 and 26 pixels with no connection — that is the reason
  for a restless layout, not any single wrong value. Now four steps: 8 within
  a label, 12 in a card, 20 between fields, 24 between blocks.
- **The counter for the number of people sits in the middle**, minus and plus
  equally far from the edge. The word "people" is gone: it stood between the
  number and the plus and tore the group apart — the label above asks "How
  many of you are there?" anyway.

### Fixed

- **The filter block opened up again** when you tapped a chip right after
  collapsing it. `renderFilters()` forced the open/closed state on every
  rebuild, while the `toggle` event arrives delayed. Now it is set once at
  start; after that the element keeps track itself.

## [1.4.1] – 2026-10-12

Tidying up the layout. Nothing changes in the function.

### Changed

- **The header area hung to the right.** Title, paragraph and the button all
  stood in one column next to the logo; to its left an empty area remained.
  Now only the title row shares the space with the logo, everything else uses
  the full width.
- **The chips no longer wrap irregularly.** Eight moods and four times stood
  now two side by side, now singly — the right edge was ragged. Now a grid
  with fields of equal width, in the form just as in the filter.
- **"Let the dice decide" takes the free width.** Before, both buttons stuck
  to the right and left half the row empty.
- **The labels on the cards are no longer pills.** Two rows of buttons that
  were none are now one calm line with separator dots.
- **"Players 2–5 players"** on the cards said the word twice.
- Shorter introduction, shorter explanation under "Fits tonight", somewhat
  larger gaps between the chips.

## [1.4.0] – 2026-10-12

A pass on ease of use, with measurements instead of opinions.

### Changed

- **The player count is a counter instead of twelve buttons.** Minus, field,
  plus. The upper limit of 12 was not a decision but a loop in the source —
  now it is 99, and whoever is fifteen simply types the number. The row
  shrinks from 93 to 66 pixels in the process.
- **Everything that is tapped is at least 44 pixels high.** Before, 72 of 112
  controls were smaller: the chips 34, the small text buttons likewise 34, the
  sort buttons 27 and the line "N games drop out today" a mere 18. Android
  recommends 48, Apple 44.
- **The button row stays at the bottom edge while the filter is open.** "Let
  the dice decide" used to begin at pixel 882 of 915 — that is, below the
  screen, although it is the main button of the app.
- **"Played today" no longer pulls the card away.** Freshly played games slide
  down the ranking; as a result exactly the card you had just confirmed
  disappeared, and a different one slid under your finger. Now only this one
  card is refreshed and stays put. The new ranking takes effect at the next
  roll or filter change.

### Added

- **Multiple selection is recognisable.** "What are you in the mood for?" and
  "How much thinking?" carry the addition "several possible", selected chips a
  checkmark. Before, "one of" and "several of them" looked identical.
- **"Edit collection ↓" in the header.** The collection begins roughly three
  screen heights further down; from here it is one tap away.

### Not changed

The contrast was calculated through: the worst value is 6.29 — the standard
requires 4.5. Nothing to do here.

## [1.3.0] – 2026-10-12

### Removed

- **The "Dark/Light" switch.** Light or dark is now decided by the device
  alone. In the Android app the WebView passes the system setting through: it
  derives `prefers-color-scheme` from the `isLightTheme` attribute of the app
  theme, and Capacitor's `Theme.AppCompat.DayNight` switches exactly by that.
  If you change the phone's setting while the app is running, the page follows
  without a restart.

  Incidentally, this removes the double colour palette: before, every dark
  value stood twice in the source — once for the system setting, once for the
  switch. Now only once.

### Added

- `color-scheme: light dark` as a declaration and in the styling. With it,
  input fields, scroll bars and the calendar of the date field also follow the
  chosen scheme instead of staying light.

## [1.2.2] – 2026-10-12

Nothing changes in the app itself; 1.2.1 was already signed correctly. What
was missing was the proof of it.

### Fixed

- **The fingerprint of the signature stayed empty.** It was read with
  `keytool`, which understands only the old JAR signature (v1) — but from
  `minSdk 24` on, Gradle no longer produces that. The failure went unnoticed
  because in a pipeline only the exit status of the last link counts, and the
  following `sed` was happy with empty input. Now `apksigner` reads the
  fingerprint, and `set -o pipefail` no longer lets such failures slip
  through.
- **The build workflow checks the signature against an expected fingerprint**
  and aborts before anything is published if it differs. It also verifies the
  signature of the finished APK.

## [1.2.1] – 2026-10-12

### Fixed

- **The app could not be updated over the previous version.** Until now it
  was built with `assembleDebug`. Debug packages are signed with the debug
  key, which lives on the developer's machine — GitHub's machines are fresh on
  every run, so Gradle created a new random key each time. For Android the
  signature is an app's identity card; with a new identity card it is a
  foreign app, and the update fails. Every version up to and including 1.2.0
  was affected.

  It is now built with `assembleRelease` and a fixed key from the GitHub
  secrets. The fingerprint of the signature is in the build log and with every
  release.

  **Needed once:** The installed app still carries one of the old random
  identity cards. It has to be uninstalled one last time — **back up the
  collection first**, uninstalling deletes the app's storage too. From 1.2.1
  on, updates then go through normally.

## [1.2.0] – 2026-10-12

The small stuff from the walkthrough.

### Added

- **The date is written out below.** Which format the input field shows is
  decided solely by the device's system language — with an English setting
  that is `mm/dd/yyyy`. The page cannot change this (`lang` on the field has
  no effect, checked). Instead, the chosen day now appears below it written
  out, in German at the time, with the weekday: "Montag, 12.10.2026 — heute"
  (Monday, 12.10.2026 — today). That makes it irrelevant what the field itself
  shows.
- **Buttons "Today", "Yesterday" and "Clear"** at the date field. After a game
  night you usually want exactly one of them.
- **The bar is explained.** Under "Fits tonight" it says once what it means
  and why one is ochre — before, that was written nowhere. Once, not on every
  card.

## [1.1.0] – 2026-10-12

A walkthrough of the app on a phone turned up five places where it makes more
work than necessary. All five are dealt with here.

### Changed

- **The dice show their result at the top.** Before, you landed in the middle
  of a long list — the rolled game was in place 6 of 19, and why was written
  nowhere. Now it moves to the first place, gets the badge "The dice say" and
  a button "Roll again". Which game has the best fit is still shown next to
  it.
- **"Describe the group" collapses.** Collapsed, the summary stays, and the
  first suggestion moves from pixel 1065 to 489 — onto the first screen
  instead of behind it. Whether it is open or closed is remembered.
- **Only the first three hits are full cards**, the rest one line each with
  name, key figures and reason. Tapping turns it into a card. The page is thus
  3500 instead of 6600 pixels long.
- **The shelf list is half as tall.** "Change" and "Remove" stood under each
  of the 21 entries and said nothing there; they now appear at the row you
  tap.

### Added

- **The fonts are inside the file.** Before, they came from Google: without
  internet the app looked different, although it promises "no network
  needed". Now there is not a single request to the outside any more. Costs
  120 KB, license notice in `FONTS.md`.
- The page states its version at the bottom, in the footer.

### Fixed

- Jump targets landed behind the status bar band.

## [1.0.1] – 2026-10-12

### Fixed

- When scrolling, the content still ran visibly under the status bar and the
  navigation bar. 1.0.0 had only set the spacing at start — that is something
  else. At the top and at the bottom there is now a band in the page colour
  that moves along, behind which the content disappears.

## [1.0.0] – 2026-10-12

First numbered version. It sums up what has been built up to here.

### Included

- **Recommendation.** Enter player count, mood, difficulty and time; the
  collection is rated and ordered. What falls through is listed with a reason
  below instead of simply vanishing.
- **Explanation time.** On request the time for explaining is included —
  graded by difficulty, not flat.
- **Editing the collection.** Create, change, remove games; search and sort;
  maintain "last played" so that freshly played games slide down.
- **A title is enough.** In the Claude version the rest of the details fill in
  by themselves; otherwise a button leads to the search on BoardGameGeek.
- **Three storage routes.** Own server, Claude account or browser — in this
  order, the first hit wins. Which one applies is visibly shown.
- **Backup and moving.** Copy the collection as text, save it as a file and
  read it in again.
- **Android app.** The page as an installable app, without network and
  without a server.
- **Home server for Windows** (optional, for several devices): background
  service, backup copies, log, scripts for setting up, checking, restarting
  and removing.

### Fixed

- Under Android 15 the app drew underneath the status bar; the heading lay
  behind the clock. The page now keeps its distance from the status and
  navigation bars.
- The app icon was cropped by Android's round mask. Foreground and background
  now exist as separate layers.

[Unreleased]: https://github.com/Dr-Nerdlove/game-night/compare/v3.1.0...HEAD
[3.1.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v3.1.0
[3.0.1]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v3.0.1
[3.0.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v3.0.0
[2.9.2]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.9.2
[2.9.1]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.9.1
[2.9.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.9.0
[2.8.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.8.0
[2.7.2]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.7.2
[2.7.1]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.7.1
[2.7.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.7.0
[2.6.1]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.6.1
[2.6.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.6.0
[2.5.1]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.5.1
[2.5.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.5.0
[2.4.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.4.0
[2.3.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.3.0
[2.2.5]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.2.5
[2.2.4]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.2.4
[2.2.3]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.2.3
[2.2.2]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.2.2
[2.2.1]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.2.1
[2.2.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.2.0
[2.1.3]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.1.3
[2.1.2]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.1.2
[2.1.1]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.1.1
[2.1.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.1.0
[2.0.1]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.0.1
[2.0.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v2.0.0
[1.4.1]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v1.4.1
[1.4.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v1.4.0
[1.3.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v1.3.0
[1.2.2]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v1.2.2
[1.2.1]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v1.2.1
[1.2.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v1.2.0
[1.1.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v1.1.0
[1.0.1]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v1.0.1
[1.0.0]: https://github.com/Dr-Nerdlove/game-night/releases/tag/v1.0.0
