# MITHRA – Your Daily Spiritual Companion

Premium Temple edition: Maroon + antique Gold, mobile-first, Tamil-friendly UI.

## File structure
- `index.html` — page structure only
- `style.css` — all visual styles
- `app.js` — app behavior and LocalStorage logic
- `manifest.json` — PWA metadata
- `sw.js` — app-shell service worker

## Included
- Home dashboard with today's date, events, reading continuation and favourites
- Tamil devotional book library with search, category filters, reader font sizing and auto-scroll
- YouTube devotional video library with URL validation and embedded playback
- Calendar for festivals, vratham days and personal reminders
- Light / dark / automatic theme
- LocalStorage data persistence
- JSON backup download and restore
- Responsive mobile bottom navigation and desktop sidebar layout
- GitHub Pages-compatible static files and a basic offline app-shell cache

## Run locally
Open `index.html` in a browser. For PWA/service-worker behavior, use a local static server or GitHub Pages (service workers do not run from `file://`).

## Publish with GitHub Pages
1. Create a GitHub repository.
2. Upload `index.html`, `style.css`, `app.js`, `manifest.json`, and `sw.js` to the repository root.
3. In repository Settings → Pages, choose the branch and root folder.
4. Open the published Pages URL.

## Data and privacy
This Stage 1 build stores books, videos, calendar events and preferences in the browser's LocalStorage. Data is not synced between devices. Use **More → Download backup** before clearing browser data or changing devices.

## Notes / limitations
- Calendar entries are manually added; no automatic Tamil Panchangam or festival-date engine is included.
- Starter devotional content is a short sample. Add or verify complete texts before relying on them.
- YouTube thumbnails and embedded playback need an internet connection.
- The service worker caches the local app shell; external fonts and YouTube resources remain online dependencies.
- Browser validation performed: JavaScript syntax check and ZIP integrity check. A full device/browser usability test is still recommended.


## Storage folder structure

```text
storage/
├── books/
│   └── README.md
├── music/
│   └── README.md
└── video/
    └── README.md
```

These folders are prepared for organizing project content. Current user-created app entries remain in browser LocalStorage; automatic import from these folders is a future enhancement.
