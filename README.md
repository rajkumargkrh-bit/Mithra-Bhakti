# Mithra Bhakti

Mobile-first devotional PWA starter built with HTML, CSS and JavaScript.

## Features
- **Songs & lyrics book (v1.1):** add/edit/delete Tamil songs, deity and category tags, favourites, search, lyrics reader with font size and spacing controls, optional linked audio/video, included in JSON backup
- **Reader tools (v1.2):** auto-scroll with speed control, screen wake lock, Tanglish search (type `murugan`, `kanda sasti` to find Tamil songs), bhajan setlists with reorder and Prev/Next play mode
- Animated Mithra Bhakti splash screen and lettermark
- Royal Purple + Gold default theme; White, Blue and Lavender themes
- Bottom navigation: Home, Calendar, Books, Music, More
- More menu: Storage, Files, Videos, Settings, About
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
