/* Back-button navigation: Android/browser Back now returns to the previous
   screen instead of closing the app. The menu, dialogs and lyrics
   sheet are closed first. Loaded last; it only hooks into MB.after (render). */
(() => {
  if (!window.MB || !MB.state || !history.pushState) return;
  const state = MB.state;
  const TAG = "mb-nav";
  const KEYS = ["page", "songId", "setId", "setIdx", "editId", "presetMedia", "linkMediaId", "media", "pdfPage"];
  let restoring = false, started = false, pendingBack = false;

  const snapshot = () => {
    const s = { tag: TAG, menuOpen: !!state.menuOpen };
    KEYS.forEach(k => { if (state[k] !== undefined) { try { s[k] = JSON.parse(JSON.stringify(state[k])); } catch { s[k] = state[k]; } } });
    return s;
  };
  const keyOf = s => [s.page, s.songId, s.setId, s.editId, s.media && s.media.id].join("|");
  const cur = () => (history.state && history.state.tag === TAG ? history.state : null);

  // ---- overlays: Back closes these first and stays on the same screen ----
  function closeOverlay() {
    const dlg = document.querySelector("#mbDialog:not(.hidden)");
    if (dlg) { document.querySelector("#mbDialogCancel")?.click(); return true; }
    const lyr = document.querySelector("#ppLyricsSheet");
    if (lyr) { (lyr.querySelector("[data-pp-lyrics-close]") || lyr).click(); lyr.remove(); return true; }
    return false;
  }

  function record() {
    if (pendingBack) return; // a history.back() is already on its way
    const s = snapshot();
    if (!started) { started = true; history.replaceState(s, ""); return; }
    const c = cur();
    if (!c) { history.pushState(s, ""); return; }
    if (c.menuOpen && !s.menuOpen) {
      // menu closed: same screen -> drop the menu entry; went to another screen -> replace it
      if (keyOf(c) === keyOf(s)) { pendingBack = true; history.back(); return; }
      history.replaceState(s, ""); return;
    }
    if (!c.menuOpen && s.menuOpen) { history.pushState(s, ""); return; }
    if (keyOf(c) === keyOf(s)) history.replaceState(s, "");
    else history.pushState(s, "");
  }

  const prevAfter = MB.after;
  MB.after = () => {
    prevAfter && prevAfter();
    if (restoring) return;
    try { record(); } catch (e) { console.error("Back navigation", e); }
  };

  window.addEventListener("popstate", e => {
    pendingBack = false;
    if (closeOverlay()) { history.pushState(snapshot(), ""); return; }
    const s = e.state && e.state.tag === TAG ? e.state : { tag: TAG, page: "dashboard" };
    restoring = true;
    try {
      KEYS.forEach(k => { state[k] = s[k]; });
      state.menuOpen = !!s.menuOpen;
      MB.render();
    } finally { restoring = false; }
  });
})();
