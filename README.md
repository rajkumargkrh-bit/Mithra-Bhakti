# Mithra Bhakti

Mobile-first devotional PWA starter built with HTML, CSS and JavaScript.

## Features
- **Songs & lyrics book (v1.1):** add/edit/delete Tamil songs, deity and category tags, favourites, search, lyrics reader with font size and spacing controls, optional linked audio/video, included in JSON backup
- **Reader tools (v1.2):** auto-scroll with speed control, screen wake lock, Tanglish search (type `murugan`, `kanda sasti` to find Tamil songs), bhajan setlists with reorder and Prev/Next play mode
- **Player Plus (v1.4):** seek/progress bar, sleep timer (15/30/60 min), favourites list, loop count (3/11/21/108×), per-track lyrics view (auto-uses linked Songs & Lyrics)
- Animated Mithra Bhakti splash screen and lettermark
- Royal Purple + Gold default theme; White, Blue and Lavender themes
- Bottom navigation: Home, Calendar, Player, Menu (Songs and Music Library remain available in Menu)
- Menu: Songs & Lyrics, Setlists, Music, Videos, Books, Calendar, Files, Storage, Settings, About
- Calendar event add/delete
- Import local PDF books, audio, videos and general files
- IndexedDB binary file storage; LocalStorage for preferences and events
- Backup/restore for events and preferences
- Service worker for offline app shell

## Run locally
Use a local web server (for example VS Code Live Server). Service workers and PWA install require HTTPS or localhost.

## Publish on GitHub Pages
1. Create a GitHub repository named `mithra-bhakti`.
2. Upload all files and folders from this project to the repository root.
3. Open Settings → Pages.
4. Choose Deploy from a branch, select `main` and `/ (root)`, then Save.
5. Open the published HTTPS URL in Android Chrome and choose Add to Home Screen.

## Important storage notes
- LocalStorage stores small preferences and calendar events.
- IndexedDB stores imported file blobs.
- Data belongs to this browser on this device; it does not sync between devices.
- Clearing browser/site data can erase app data. Export backups regularly.
- JSON backup currently includes calendar events and preferences; imported media files are not included.
- Browser storage quotas vary by device. Large media imports may fail if space is limited.
- This is a PWA website, not a Play Store APK.

## Next improvements
- Dedicated calendar event editor and reminder notifications
- PDF reader inside app
- Playlist management and media queue
- File folders, search, sort and multi-select
- Backup including media (with quota-aware warnings)
- Accessibility and Android device testing


## Phase 2 — Festival Calendar & Reminders
- Adds a 2026 Bengaluru festival list to the existing Calendar page.
- Festival dates are highlighted in the monthly calendar.
- You can enable or disable a reminder for each festival.
- Browser notifications are requested only when you choose to enable them.
- Reminders are checked when the app is open (including when returning to the app). This offline/local version cannot send reliable notifications while the browser/app is fully closed; that requires a push-notification backend.
- Festival dates may differ by local panchangam and tradition. Check locally before planning rituals.
- Existing pages, styles, files, and stored app data are retained.

Festival date references used for the Bengaluru 2026 list: Nidarshana Vedh Bengaluru festival calendar and official Bengaluru institutional holiday calendars.


## Phase 3 — PDF Reader & Bookmarks
- PDF books open in an embedded reader inside the Books page when supported by the browser.
- Page navigation lets you enter a page number and jump to it.
- Save named bookmarks for a PDF and reopen or remove them later.
- Bookmarks are stored locally per imported PDF and included in JSON backup/restore.
- Imported PDF files remain in IndexedDB; JSON backups include bookmark metadata, not the PDF bytes.
- Some mobile browsers do not display embedded PDFs. Use the "Open PDF in browser" fallback in that case.
- Existing app pages, styles, features, and stored data are retained.


## Phase 4 — Music lyrics (v1.4)
- Every audio file on the Music page now has a **Lyrics** button.
  - `♪ Lyrics` opens the Now Playing screen: sticky audio/video player with the Tamil lyrics below it.
  - `+ Lyrics` lets you link the audio to an existing song, or create a new song with that audio already attached.
- Now Playing has font size, spacing, auto-scroll with speed control and screen-on (wake lock), same as the lyrics reader.
- Leaving the Now Playing screen stops playback (the player lives on that page).
- Linking uses the song's existing "Linked audio / video" field, so you can also change it from the song editor.
- Backup stores the song-to-audio link, but not the audio file itself. After restoring on a new device, re-import the audio and link it again.
- Next: synced (karaoke-style) lyrics with tap-to-sync timestamps.

## Menu (v1.4.1)
- The bottom bar is now Home, Songs, Music and Menu, so it no longer feels crowded.
- Menu lists everything, grouped as Library, Plan, Manage and App, with counts (songs, setlists, audio, videos, books).
- Calendar and Books moved into the Menu; Menu stays highlighted while you are on them.
- Fixed: the bottom bar highlight no longer disappears on the lyrics reader and Now Playing pages.


## Additive devotional tools (v1.5)
- Japam Counter: per-day mantra counts and 108-count mala tracking, stored locally.
- Daily Reminder: configurable morning/evening reminders. Notifications are checked while the app is open; reliable closed-app scheduling requires native Android scheduling or a push service.
- Festival Special: a separate upcoming-festival view; dates should be verified against the user's local panchangam.
- Advanced Music Player: local audio queue, shuffle, repeat and favourites; background playback depends on browser/device support.
- Smart Backup: exports app localStorage data plus IndexedDB media into one JSON file; restore merges data and skips media duplicates.

These are additions. Existing pages, libraries, original backup/restore, calendar, and imported files are retained.


## Bottom navigation update
- Replaced duplicate-feeling Songs and Music bottom shortcuts with Calendar and the dedicated Advanced Music Player.
- Songs & Lyrics and the full Music Library remain available from the Menu; the Player also links to the Music Library for importing audio.
- Existing dashboard, theme, stored files, calendar events and other features are unchanged.


## Bhakti Plus (v1.6) — additive
- **Japam history:** streak, last-7-days bars, month total, best day and a daily mala goal, shown under the Japam Counter.
- **Special Days (Menu → Devotional Tools):** Ekadashi, Pradosham, Sankashti, Vinayagar Chaturthi, Shashti, Karthigai, Pournami, Amavasai computed from the built-in panchangam, with optional reminders (day before + same day) and a short 2027 festival list. Verify dates with your local panchangam.
- **Synced lyrics:** open Player → Lyrics → "Sync lyrics", play and tap at the start of each line; lines then highlight and scroll with the audio. Timings are stored per track and included in Smart Backup.
- **Install icons:** added PWA icons (192/512/maskable) and an Apple touch icon.
- New files only: `js/bhakti-plus.js`, `css/bhakti-plus.css`, `icons/`. Small hooks: two tags in `index.html`, icons in `manifest.json`, cache bump in `service-worker.js`.


## Phase 3 — Festival Calendar Plus (additive)

- Added a separate Festival Calendar Plus page with Tamil Nadu reference festival dates for 2027 and 2028.
- Added festival countdown, per-festival one-day-before reminders, and user-created special days.
- Added a Monthly Bhakti Report based on the existing Daily Bhakti Tracker checklist and notes.
- New data is isolated under `mb_fp*` Local Storage keys; existing data keys are not migrated or overwritten.
- New files: `js/festival-plus.js` and `css/festival-plus.css`.
- Festival dates are a Chennai/Tamil Nadu reference and can vary by locality or temple panchangam. Reference: Drik Panchang 2027 and 2028 Tamil calendars.

## Phase 5 — Dashboard Plus (additive)
- Added a home dashboard devotional overview with daily checklist completion, japam count, current streak, monthly activity and active days in the last 30 days.
- Added editable personal goals for daily checklist activities and japam count.
- Added quick access shortcuts to Daily Bhakti, Japam Counter, Special Days and Festival Plus.
- Reads existing `bkDailyChecks` and `japamCounts` data without modifying those records; new goal preferences use the isolated `mb_dashboardPlus` key.
- New files: `js/dashboard-plus.js` and `css/dashboard-plus.css`; linked additively from `index.html` and included in the service-worker cache.


## Bhakti Extras (v1.7) — additive
- **Stotram Library (Menu → Devotional Tools):** short Tamil verses and mantras with Tanglish and meaning; one tap adds them to Songs & Lyrics. Long texts are intentionally not bundled; paste them from a trusted book.
- **Home card:** Tamil date (month and year, approximate), today's worship deity with matching songs from your library, and a daily Thirukkural (Kadavul Vazhthu).
- **Japam:** mantra chips (add your own), vibration on each count and at every 108, lifetime tally per mantra, and a share card.
- **Share cards:** today's card, greeting card and japam card as an image (Share sheet, or download as fallback).
- **Calendar:** Tamil date for the selected day above the panchangam.
- **Viratham Tracker (Menu):** log the days you keep viratham, with month/year totals and history.
- **Read aloud:** button on the lyrics reader and the library (uses the browser's Tamil voice if the device has one).
- **Install shortcuts:** long-press the home-screen icon for Japam, Player and Panchangam (Android Chrome).
- **Backup reminder:** a Home banner after 7 days without a backup (snooze 3 days).
- New files: `js/bhakti-extras.js`, `css/bhakti-extras.css`. Small hooks: one link and one script tag in `index.html`, two files added to the cache list and cache bump to v26 in `service-worker.js`, `shortcuts` in `manifest.json`. Data keys use the `mb_` prefix so Smart Backup includes them.
- Tamil month dates are approximate (sankranti can shift by a day). Verify with your local panchangam.


## Bhakti Studio (v1.8) — additive
- **Pooja Mode:** full-screen deepam with animated flame, synthesized temple bell, deity mantra, and lyrics from your Songs library with auto-scroll, font size and screen-on. Optional switch ticks "lamp" and "morning prayer" in Daily Bhakti when you finish (off by default).
- **Prayer Journal:** daily gratitude, prarthanai and mood; month view, edit/delete for any past day.
- **Likhita Japam:** type the mantra (Tamil or Tanglish) or tap to count; 108-dot page grid, goals up to 1 crore, last-7-days bars, custom mantras.
- **Temple Log:** visited list with date, notes and photo, wishlist, starter Bengaluru list, Google Maps link. Photos are stored in their own IndexedDB (`mb_studio`) and are not included in JSON backup.
- **Padal Learning:** practise songs with hidden lines (first word / alternate lines / all hidden, tap to reveal), mark learned, spaced revision (1/3/7/14/30/60 days), optional weekly reminder when the app is opened.
- **Insights & Badges:** streak, best streak, totals and 17 badges (incl. 48-day Mandalam); share card as image.
- Entry points: Menu → BHAKTI STUDIO group, and a Home card under Today's Thought.
- New files: `js/bhakti-studio.js`, `css/bhakti-studio.css`. Hooks: one link + one script tag in `index.html`, two cache entries and cache bump to v28 in `service-worker.js`. Data keys use the `bs*` names under the `mb_` prefix, so Smart Backup includes them.
