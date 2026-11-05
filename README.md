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
