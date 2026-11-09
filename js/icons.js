// ===================== Projektová alchymie – ikony =====================
// Vlastní sada systémových ikon ve stylu „Stavební deník“: mřížka 24 × 24, obrys 2 px
// v barvě textu (var(--ink)) s kulatými konci a jedna plochá výplň z palety hry.
// Sprite se vloží na začátek <body>; ikona se kreslí přes ic('id').
// Ikony projektů, praktik, vzorců a kontextů zatím zůstávají jako emoji v datech.

const ICON_SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
<symbol id="i-rozpocet" viewBox="0 0 24 24">
  <path d="M9 2.8h6l-1.6 3.6h-2.8z" style="fill:var(--pred)"/>
  <path d="M10.6 6.4C6.2 8.8 4.2 12.6 4.6 16.2 5 19.8 8 21.2 12 21.2s7-1.4 7.4-5C19.8 12.6 17.8 8.8 13.4 6.4z" style="fill:var(--caution)"/>
  <path d="M14 11.4c-.5-.7-1.2-1-2-1-1.2 0-2 .6-2 1.5 0 2.1 4 1.1 4 3.1 0 .9-.8 1.5-2 1.5-.9 0-1.6-.3-2.1-1M12 9.2v1.2M12 16.5v1.2" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-harmonogram" viewBox="0 0 24 24">
  <rect x="3" y="5" width="18" height="16" rx="2" style="fill:var(--surface)"/>
  <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3H3z" style="fill:var(--primary)"/>
  <path d="M8 3v4M16 3v4M7 14h2M11 14h2M15 14h2M7 17.5h2M11 17.5h2"/>
</symbol>
<symbol id="i-kvalita" viewBox="0 0 24 24">
  <path d="M8.6 14.6 7 21.2l3-1.4 1.4 1.6.6-5M15.4 14.6l1.6 6.6-3-1.4-1.4 1.6-.6-5" style="fill:var(--primary)"/>
  <circle cx="12" cy="9.6" r="6.6" style="fill:var(--caution)"/>
  <path d="m9.3 9.8 1.9 1.9 3.6-3.7" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-spokojenost" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" style="fill:var(--caution)"/>
  <path d="M9 9.8v.4M15 9.8v.4M7.8 13.8c1.2 1.8 2.6 2.6 4.2 2.6s3-.8 4.2-2.6" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-moralka" viewBox="0 0 24 24">
  <path d="M12 20.2s-8-4.6-8-10.4a4.3 4.3 0 0 1 8-2.2 4.3 4.3 0 0 1 8 2.2c0 5.8-8 10.4-8 10.4z" style="fill:var(--primary)"/>
  <path d="M7.6 9.6c.2-1 .9-1.8 1.9-2" style="stroke:#fff"/>
</symbol>
<symbol id="i-pred" viewBox="0 0 24 24">
  <path d="M4 20.5V4.5l16 16z" style="fill:var(--pred)"/>
  <path d="M8 16.5v-4.6l4.6 4.6z" style="fill:var(--surface)"/>
  <path d="M4 8.5h2.2M4 12h2.2"/>
</symbol>
<symbol id="i-agile" viewBox="0 0 24 24">
  <path d="M19.4 12a7.4 7.4 0 0 1-12.6 5.2M4.6 12A7.4 7.4 0 0 1 17.2 6.8" style="stroke:var(--agile);stroke-width:2.6"/>
  <path d="M17.6 3v4.2h-4.2M6.4 21v-4.2h4.2"/>
</symbol>
<symbol id="i-hybrid" viewBox="0 0 24 24">
  <path d="M10.2 16.8l-1.6 1.6a3.4 3.4 0 0 1-4.8-4.8l3-3a3.4 3.4 0 0 1 4.8 0" style="stroke:var(--pred);stroke-width:2.6"/>
  <path d="M13.8 7.2l1.6-1.6a3.4 3.4 0 0 1 4.8 4.8l-3 3a3.4 3.4 0 0 1-4.8 0" style="stroke:var(--agile);stroke-width:2.6"/>
  <path d="m9.6 14.4 4.8-4.8"/>
</symbol>
<symbol id="i-hodnota" viewBox="0 0 24 24">
  <path d="M6.5 4h11L21 9l-9 11.5L3 9z" style="fill:var(--agile)"/>
  <path d="M3 9h18M9.5 4 8 9l4 11.5L16 9l-1.5-5"/>
</symbol>
<symbol id="i-zamek" viewBox="0 0 24 24">
  <path d="M8 10.5V7.4a4 4 0 0 1 8 0v3.1"/>
  <rect x="5" y="10.5" width="14" height="10.5" rx="2" style="fill:var(--caution)"/>
  <path d="M12 14.4v2.8" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-odemceno" viewBox="0 0 24 24">
  <path d="M8 10.5V7.4a4 4 0 0 1 7.7-1.6"/>
  <rect x="5" y="10.5" width="14" height="10.5" rx="2" style="fill:var(--good)"/>
  <path d="M12 14.4v2.8" style="stroke:#fff"/>
</symbol>
<symbol id="i-best" viewBox="0 0 24 24">
  <rect x="3" y="3" width="18" height="18" rx="3" style="fill:var(--good)"/>
  <path d="m7.4 12.4 3.1 3.1 6.1-7" style="stroke:#fff;stroke-width:2.6"/>
</symbol>
<symbol id="i-ok" viewBox="0 0 24 24">
  <path d="M12 3.2 21.6 20H2.4z" style="fill:var(--caution)"/>
  <path d="M12 9.6v4.6M12 17.2v.1" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-bad" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" style="fill:var(--bad)"/>
  <path d="m8.8 8.8 6.4 6.4M15.2 8.8l-6.4 6.4" style="stroke:#fff;stroke-width:2.6"/>
</symbol>
<symbol id="i-nasivka" viewBox="0 0 48 52">
  <path d="M24 2 45 14v24L24 50 3 38V14z" style="fill:var(--patch);stroke:#2b2118;stroke-width:3"/>
  <path d="M24 5.6 42 15.9v20.2L24 46.4 6 36.1V15.9z" style="fill:none;stroke:#fbf6ea;stroke-width:1.3;stroke-dasharray:2.2 2;opacity:.85"/>
  <path d="M24 10 38 18v16l-14 8-14-8V18z" style="fill:var(--surface);stroke:#2b2118;stroke-width:2"/>
</symbol>
<symbol id="i-box" viewBox="0 0 24 24">
  <rect x="4" y="4" width="16" height="16" rx="3" style="fill:var(--surface)"/>
</symbol>
<symbol id="i-box-vybrano" viewBox="0 0 24 24">
  <rect x="4" y="4" width="16" height="16" rx="3" style="fill:var(--caution)"/>
  <path d="m8 12.4 2.8 2.8 5.4-6" style="stroke:#2b2118;stroke-width:2.6"/>
</symbol>
<symbol id="i-fajfka" viewBox="0 0 24 24">
  <path d="m4.5 12.5 4.8 4.8L19.5 7" style="stroke:var(--good);stroke-width:3"/>
</symbol>
<symbol id="i-krizek" viewBox="0 0 24 24">
  <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" style="stroke:var(--bad);stroke-width:3"/>
</symbol>
<symbol id="i-zavrit" viewBox="0 0 24 24">
  <path d="M6 6l12 12M18 6 6 18" style="stroke-width:2.6"/>
</symbol>
<symbol id="i-stop" viewBox="0 0 24 24">
  <path d="M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3z" style="fill:var(--bad)"/>
  <path d="M7.5 12h9" style="stroke:#fff;stroke-width:2.6"/>
</symbol>
<symbol id="i-vzorec" viewBox="0 0 24 24">
  <path d="M6.6 14.5h10.8l2 3.7a2 2 0 0 1-1.8 2.8H6.4a2 2 0 0 1-1.8-2.8z" style="fill:var(--agile)"/>
  <path d="M9 3h6M10 3v5.5L4.6 18.2A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.8-2.8L14 8.5V3"/>
  <path d="M10 17.5h.1M13.5 16.8h.1" style="stroke:#fff"/>
</symbol>
<symbol id="i-antivzorec" viewBox="0 0 24 24">
  <path d="M7.4 13h9.2l2.8 5.2a2 2 0 0 1-1.8 2.8H6.4a2 2 0 0 1-1.8-2.8z" style="fill:var(--bad)"/>
  <path d="M8 3h5M9 3v5.5L4.6 18.2A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.8-2.8L12 8.5V3"/>
  <path d="M14.6 7.4a2.4 2.4 0 0 1 3.4-3.6 2.2 2.2 0 0 1 3.4 1.6 1.9 1.9 0 0 1-.6 3.7h-4.8a1.8 1.8 0 0 1-1.4-1.7z" style="fill:var(--surface)"/>
  <path d="M10 17.2h.1M13.6 18.4h.1" style="stroke:#fff"/>
</symbol>
<symbol id="i-zakladni" viewBox="0 0 24 24">
  <path d="M12 21v-8.5M7 21h10"/>
  <path d="M12 13C12 8.6 9.2 6 4.5 6c0 4.4 2.8 7 7.5 7z" style="fill:var(--good)"/>
  <path d="M12 11.5c0-4 2.6-6.5 7.5-6.5 0 4-2.6 6.5-7.5 6.5z" style="fill:var(--good)"/>
</symbol>
<symbol id="i-narocna" viewBox="0 0 24 24">
  <path d="M12 21.5c-3.9 0-7-2.6-7-6.6 0-3.6 2.5-5.6 3.6-8.9.9 1.3 1.5 2.6 1.6 4 1.6-1.7 2.7-4.4 2.4-7.5 3.5 2.2 6.4 6.6 6.4 11.6 0 4.6-3.1 7.4-7 7.4z" style="fill:var(--primary)"/>
  <path d="M12 21.5c-1.7 0-3-1.2-3-3 0-1.9 1.5-2.9 2.3-4.6 1.9 1.3 3.7 2.9 3.7 4.8 0 1.7-1.3 2.8-3 2.8z" style="fill:var(--caution)"/>
</symbol>
<symbol id="i-velmiobtizna" viewBox="0 0 24 24">
  <path d="M12 2.2 14 7l4.9-1.9-1.7 4.9 4.6 2-4.6 2 1.7 4.9L14 17l-2 4.8-2-4.8-4.9 1.9 1.7-4.9-4.6-2 4.6-2-1.7-4.9L10 7z" style="fill:var(--insane)"/>
  <path d="M12 8.6v3.6M12 15v.1" style="stroke:#fff;stroke-width:2.4"/>
</symbol>
<symbol id="i-tvar-dobre" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" style="fill:var(--caution)"/>
  <path d="M9 9.8v.4M15 9.8v.4M8.6 14c1 1.4 2.1 2 3.4 2s2.4-.6 3.4-2" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-tvar-neutral" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" style="fill:var(--caution)"/>
  <path d="M9 9.8v.4M15 9.8v.4M9 15h6" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-tvar-obava" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" style="fill:var(--caution)"/>
  <path d="M9 10.2v.4M15 10.2v.4M8 7.6l2.2-.8M16 7.6l-2.2-.8M9 16.2c.8-1 1.8-1.5 3-1.5s2.2.5 3 1.5" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-tvar-zlost" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" style="fill:var(--bad)"/>
  <path d="M7.8 8.2l2.6 1.4M16.2 8.2l-2.6 1.4M9.4 11.6v.3M14.6 11.6v.3M9 16.6c.8-1 1.8-1.5 3-1.5s2.2.5 3 1.5" style="stroke:#fff"/>
</symbol>
<symbol id="i-tvar-unava" viewBox="0 0 24 24">
  <circle cx="12" cy="12.5" r="8.5" style="fill:var(--caution)"/>
  <path d="M7.8 11h2.6M13.6 11h2.6M9.5 16h5" style="stroke:#2b2118"/>
  <path d="M19.4 2.6c1 1.4 1.6 2.3 1.6 3a1.6 1.6 0 0 1-3.2 0c0-.7.6-1.6 1.6-3z" style="fill:var(--agile)"/>
</symbol>
<symbol id="i-tvar-vycerpani" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" style="fill:var(--bad)"/>
  <path d="M7.8 8.8l2.4 2.4M10.2 8.8l-2.4 2.4M13.8 8.8l2.4 2.4M16.2 8.8l-2.4 2.4M8.4 16c1-.9 1.7-.9 2.4 0s1.4.9 2.4 0 1.7-.9 2.4 0" style="stroke:#fff"/>
</symbol>
<symbol id="i-dvere" viewBox="0 0 24 24">
  <path d="M5.5 21V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v17M3 21h18"/>
  <path d="M5.5 3.5 14 5.6v15.9l-8.5-.5z" style="fill:var(--pred)"/>
  <path d="M11.4 12.2v1.6"/>
</symbol>
<symbol id="i-tym" viewBox="0 0 24 24">
  <circle cx="16" cy="8.5" r="2.7" style="fill:var(--pred)"/>
  <path d="M12.6 15c.9-.7 2.1-1.1 3.4-1.1 3 0 5 2.3 5 5.6h-6" style="fill:var(--pred)"/>
  <circle cx="9" cy="8.5" r="3.1" style="fill:var(--agile)"/>
  <path d="M3 20c0-3.6 2.6-6 6-6s6 2.4 6 6z" style="fill:var(--agile)"/>
</symbol>
<symbol id="i-zarovka" viewBox="0 0 24 24">
  <path d="M9 17.5v-1.6c0-1.4-.7-2.4-1.7-3.6A6 6 0 1 1 16.7 12.3c-1 1.2-1.7 2.2-1.7 3.6v1.6z" style="fill:var(--caution)"/>
  <path d="M9.5 20.8h5M10.6 17.5v-3.3L12 13l1.4 1.2v3.3" style="stroke:#2b2118"/>
  <path d="M9.5 20.8h5"/>
</symbol>
<symbol id="i-lupa" viewBox="0 0 24 24">
  <circle cx="10.5" cy="10.5" r="6.5" style="fill:var(--surface)"/>
  <path d="m15.3 15.3 5.2 5.2" style="stroke-width:3"/>
  <path d="M7.4 9.4a3.4 3.4 0 0 1 3-3" style="stroke:var(--agile)"/>
</symbol>
<symbol id="i-hodiny" viewBox="0 0 24 24">
  <path d="M7.5 3c0 4.5 4.5 6 4.5 9s-4.5 4.5-4.5 9h9c0-4.5-4.5-6-4.5-9s4.5-4.5 4.5-9z" style="fill:var(--surface)"/>
  <path d="M9.2 19.6c.8-1.9 1.9-2.9 2.8-3.2.9.3 2 1.3 2.8 3.2z" style="fill:var(--pred)"/>
  <path d="M6 3h12M6 21h12"/>
</symbol>
<symbol id="i-mapa" viewBox="0 0 24 24">
  <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" style="fill:var(--surface)"/>
  <path d="M9 4v13.5M15 6.5V20"/>
  <path d="M5.2 14.6 7.6 12l3.2 1.4 2.8-3.2 2.4 1 2.8-2.8" style="stroke:var(--primary);stroke-dasharray:2 2.2"/>
</symbol>
<symbol id="i-kniha" viewBox="0 0 24 24">
  <path d="M12 6.6C10 5.1 7 4.5 3 4.8v13.6c4-.3 7 .3 9 1.8z" style="fill:var(--surface)"/>
  <path d="M12 6.6c2-1.5 5-2.1 9-1.8v13.6c-4-.3-7 .3-9 1.8z" style="fill:var(--primary)"/>
</symbol>
<symbol id="i-sipka" viewBox="0 0 24 24">
  <path d="M4.5 12h14.5M13.5 6.5 19 12l-5.5 5.5" style="stroke-width:2.6"/>
</symbol>
<symbol id="i-cil" viewBox="0 0 24 24">
  <path d="M5.5 4h13.5l-2.6 4.5L19 13H5.5z" style="fill:var(--primary)"/>
  <path d="M5.5 21.5V3"/>
</symbol>
<symbol id="i-stahnout" viewBox="0 0 24 24">
  <path d="M12 3.5v11M7 10l5 5 5-5" style="stroke-width:2.6"/>
  <path d="M4 16.5v3.5h16v-3.5"/>
</symbol>
<symbol id="i-znovu" viewBox="0 0 24 24">
  <path d="M19.5 12A7.5 7.5 0 1 1 16.9 6.3" style="stroke-width:2.6"/>
  <path d="M18 2.6v4.4h-4.4"/>
</symbol>
<symbol id="i-mlha" viewBox="0 0 24 24">
  <path d="M7 14a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.3 1.6A3.2 3.2 0 0 1 17.5 14z" style="fill:var(--surface)"/>
  <path d="M3.5 17.5h11M8.5 20.5h12"/>
</symbol>
<symbol id="i-dest" viewBox="0 0 24 24">
  <path d="M7 13.5a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.3 1.6A3.2 3.2 0 0 1 17.5 13.5z" style="fill:var(--surface)"/>
  <path d="M8.5 16.5 7.5 19.5M12.5 16.5l-1 3M16.5 16.5l-1 3" style="stroke:var(--agile);stroke-width:2.4"/>
</symbol>
<symbol id="i-jiskra" viewBox="0 0 24 24">
  <path d="M10 2.8c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5C7.7 8.7 9.4 7 10 2.8z" style="fill:var(--caution)"/>
  <path d="M17.5 14c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3z" style="fill:var(--caution)"/>
</symbol>
<symbol id="i-blesk" viewBox="0 0 24 24">
  <path d="M13.5 2.5 5 13.5h6l-1.5 8 9-11.5h-6z" style="fill:var(--primary)"/>
</symbol>
<symbol id="i-spanek" viewBox="0 0 24 24">
  <path d="M3.5 10h6l-6 7.5h6M13.5 4h7l-7 8h7"/>
</symbol>
<symbol id="i-terc" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" style="fill:var(--surface)"/>
  <circle cx="12" cy="12" r="5.4" style="fill:var(--primary)"/>
  <circle cx="12" cy="12" r="1.8" style="fill:var(--surface)"/>
</symbol>
<symbol id="i-sponka" viewBox="0 0 24 24">
  <path d="M15.5 7.5 9 14a2 2 0 0 0 2.8 2.8l7-7a4 4 0 0 0-5.6-5.6L6 11.4a6 6 0 0 0 8.5 8.5l5.5-5.5"/>
</symbol>
<symbol id="i-stit" viewBox="0 0 24 24">
  <path d="M12 2.8 19.5 5.5v6c0 4.6-3.2 8-7.5 9.8-4.3-1.8-7.5-5.2-7.5-9.8v-6z" style="fill:var(--agile)"/>
  <path d="m8.8 11.8 2.3 2.3 4.3-4.6" style="stroke:#fff"/>
</symbol>
<symbol id="i-bublina" viewBox="0 0 24 24">
  <path d="M3.5 5.5A1.5 1.5 0 0 1 5 4h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 16h-8l-4.5 4v-4H5a1.5 1.5 0 0 1-1.5-1.5z" style="fill:var(--surface)"/>
  <path d="M7.5 8.5h9M7.5 12h5.5"/>
</symbol>
<symbol id="i-novy" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" style="fill:var(--caution)"/>
  <path d="M12 7.5v9M7.5 12h9" style="stroke:#2b2118;stroke-width:2.6"/>
</symbol>
<symbol id="i-oslava" viewBox="0 0 24 24">
  <path d="M3.5 20.5 8 7.5l8.5 8.5z" style="fill:var(--caution)"/>
  <path d="M6.2 12.8l5 5" style="stroke:#2b2118"/>
  <path d="M13 3.5v.1M20.5 11v.1M16.5 3l-.8 2.6M21 7.5l-2.6.8M13.5 10.5c1.6-1.6 3.4-2.2 5.5-1.6" style="stroke:var(--primary)"/>
</symbol>
<symbol id="i-medaile" viewBox="0 0 24 24">
  <path d="M7.5 2.5h3.2l2.2 6.6H9.7zM16.5 2.5h-3.2l-2.2 6.6h3.2z" style="fill:var(--agile)"/>
  <circle cx="12" cy="15" r="6" style="fill:var(--caution)"/>
  <circle cx="12" cy="15" r="2.8" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-medaile-bronz" viewBox="0 0 24 24">
  <path d="M7.5 2.5h3.2l2.2 6.6H9.7zM16.5 2.5h-3.2l-2.2 6.6h3.2z" style="fill:var(--primary)"/>
  <circle cx="12" cy="15" r="6" style="fill:var(--pred)"/>
  <circle cx="12" cy="15" r="2.8" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-pohar" viewBox="0 0 24 24">
  <path d="M7 5.5H4.5V7a3 3 0 0 0 3 3M17 5.5h2.5V7a3 3 0 0 1-3 3M12 13.5V17"/>
  <path d="M7 3.5h10v5a5 5 0 0 1-10 0z" style="fill:var(--caution)"/>
  <path d="M9 17h6l.6 3.5H8.4z" style="fill:var(--pred)"/>
</symbol>
<symbol id="i-kostka" viewBox="0 0 24 24">
  <rect x="3.5" y="3.5" width="17" height="17" rx="3" style="fill:var(--surface)"/>
  <path d="M8.2 8.2h.1M15.8 8.2h.1M12 12h.1M8.2 15.8h.1M15.8 15.8h.1" style="stroke-width:3.2"/>
</symbol>
<symbol id="i-graf-nahoru" viewBox="0 0 24 24">
  <path d="M3.5 3.5v17h17"/>
  <path d="m6.8 16 3.8-4.4 3 2.5L19 7.8" style="stroke:var(--good);stroke-width:2.6"/>
  <path d="M15.2 7.6H19v3.8"/>
</symbol>
<symbol id="i-graf-dolu" viewBox="0 0 24 24">
  <path d="M3.5 3.5v17h17"/>
  <path d="m6.8 7.8 3.8 4.4 3-2.5L19 16" style="stroke:var(--bad);stroke-width:2.6"/>
  <path d="M15.2 16.2H19v-3.8"/>
</symbol>
<symbol id="i-zkumavka" viewBox="0 0 24 24">
  <path d="M9.5 3v14a2.5 2.5 0 0 0 5 0V3" style="fill:var(--surface)"/>
  <path d="M9.5 11h5v6a2.5 2.5 0 0 1-5 0z" style="fill:var(--agile)"/>
  <path d="M8 3h8M9.5 3v14a2.5 2.5 0 0 0 5 0V3"/>
</symbol>
<symbol id="i-ozubene" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="8.2" style="stroke-width:3.6;stroke-dasharray:3.2 3.24;stroke-linecap:butt"/>
  <circle cx="12" cy="12" r="6.6" style="fill:var(--pred)"/>
  <circle cx="12" cy="12" r="2.4" style="fill:var(--surface)"/>
</symbol>
<symbol id="i-nuzky" viewBox="0 0 24 24">
  <path d="M8.8 8.6 20 18M8.8 15.4 20 6"/>
  <circle cx="6.5" cy="6.5" r="3" style="fill:var(--primary)"/>
  <circle cx="6.5" cy="17.5" r="3" style="fill:var(--primary)"/>
</symbol>
<symbol id="i-zpet" viewBox="0 0 24 24">
  <path d="M9 5.5 4.5 10 9 14.5M4.5 10h10a5 5 0 0 1 0 10H11"/>
</symbol>
<symbol id="i-zabrana" viewBox="0 0 24 24">
  <path d="M6 13v8M18 13v8M4 21h4M16 21h4"/>
  <rect x="2.5" y="6" width="19" height="7" rx="1" style="fill:var(--caution)"/>
  <path d="M7.5 6 4 13M13 6l-3.5 7M18.5 6 15 13" style="stroke:#2b2118;stroke-width:2.4"/>
  <rect x="2.5" y="6" width="19" height="7" rx="1"/>
</symbol>
<symbol id="i-otaznik" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" style="fill:var(--surface)"/>
  <path d="M9.4 9.4a2.7 2.7 0 1 1 3.8 2.5c-.8.4-1.2 1-1.2 1.8v.6M12 17v.1"/>
</symbol>
<symbol id="i-logo" viewBox="0 0 24 24">
  <path d="M10.5 3v5.9a6.5 6.5 0 1 0 3 0V3" style="fill:var(--surface)"/>
  <path d="M5.6 14h12.8a6.5 6.5 0 1 1-12.8 0z" style="fill:var(--primary)"/>
  <path d="M9 3h6M10.5 3v5.9a6.5 6.5 0 1 0 3 0V3"/>
  <path d="M10 17h.1M13.6 18.2h.1" style="stroke:#fff"/>
</symbol>
</svg>`;

// Ikony obsahu: projekty (p-), kontexty (k-), praktiky (x-, výplň podle světa) a vzorce (v-).
const ICON_SPRITE_OBSAH = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
<!-- ===== Projekty ===== -->
<symbol id="i-p-knihovna" viewBox="0 0 24 24">
  <path d="M2.8 9.2 12 4l9.2 5.2z" style="fill:var(--primary)"/>
  <path d="M4 20.5h16M3 9.2h18M6 11.5v6.5M10 11.5v6.5M14 11.5v6.5M18 11.5v6.5M4.5 18h15"/>
</symbol>
<symbol id="i-p-festival" viewBox="0 0 24 24">
  <path d="M12 5V2.2l3.2 1.2L12 4.6" style="fill:var(--primary)"/>
  <path d="M3 20 12 5l9 15z" style="fill:var(--caution)"/>
  <path d="M12 5 8.6 20M12 5l3.4 15" style="stroke:var(--primary);stroke-width:2.4"/>
  <path d="M3 20 12 5l9 15zM2 20h20"/>
  <path d="M10.2 20l1.8-3.6 1.8 3.6z" style="fill:#2b2118;stroke:#2b2118"/>
</symbol>
<symbol id="i-p-tovarna" viewBox="0 0 24 24">
  <path d="M3 20.5v-10l5 3v-3l5 3v-3l5 3V3.5h3v17z" style="fill:var(--pred)"/>
  <path d="M6.5 17h2M11 17h2M15.5 17h2" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-p-elektrarna" viewBox="0 0 24 24">
  <path d="M8.6 7.6a2.4 2.4 0 0 1 .3-4.7 3.4 3.4 0 0 1 6.3.2 2.2 2.2 0 0 1 .5 4.5" style="fill:var(--surface)"/>
  <path d="M7 8c1.6 3 1.8 6.2-1 13h12c-2.8-6.8-2.6-10-1-13z" style="fill:var(--pred)"/>
  <path d="M13 10.5 10 15h2.6l-1 4 3.4-5h-2.6z" style="fill:var(--caution)"/>
</symbol>
<symbol id="i-p-startup" viewBox="0 0 24 24">
  <path d="M10 18.5 12 22l2-3.5z" style="fill:var(--caution)"/>
  <path d="M8.2 12.6 5 15.8v3l3.8-2.2M15.8 12.6l3.2 3.2v3l-3.8-2.2" style="fill:var(--primary)"/>
  <path d="M12 2.2c3.2 2.6 4.6 6.2 4.6 10.2l-2 4.6H9.4l-2-4.6c0-4 1.4-7.6 4.6-10.2z" style="fill:var(--surface)"/>
  <circle cx="12" cy="9.4" r="1.9" style="fill:var(--agile)"/>
</symbol>
<symbol id="i-p-druzice" viewBox="0 0 24 24">
  <path d="M7 12h1M16 12h1M12 8V4.6"/>
  <rect x="2" y="9" width="5" height="6" rx=".5" style="fill:var(--agile)"/>
  <rect x="17" y="9" width="5" height="6" rx=".5" style="fill:var(--agile)"/>
  <path d="M4.5 9v6M19.5 9v6"/>
  <rect x="8" y="8" width="8" height="8" rx="1.5" style="fill:var(--caution)"/>
  <circle cx="12" cy="12" r="1.8" style="fill:var(--surface);stroke:#2b2118"/>
  <circle cx="12" cy="3.6" r="1.2" style="fill:var(--primary)"/>
</symbol>
<symbol id="i-p-nemocnice" viewBox="0 0 24 24">
  <path d="M4 21V9h16v12z" style="fill:var(--surface)"/>
  <path d="M2.5 21h19M10 21v-4h4v4M6.5 12.5h2M15.5 12.5h2M6.5 16h2M15.5 16h2"/>
  <circle cx="12" cy="6.5" r="4.2" style="fill:var(--bad)"/>
  <path d="M12 4.5v4M10 6.5h4" style="stroke:#fff;stroke-width:2.2"/>
</symbol>
<symbol id="i-p-hra" viewBox="0 0 24 24">
  <path d="M7 7.5h10a4.5 4.5 0 0 1 4.4 3.6l1 5.2a2.6 2.6 0 0 1-4.5 2.2L15.6 16H8.4l-2.3 2.5a2.6 2.6 0 0 1-4.5-2.2l1-5.2A4.5 4.5 0 0 1 7 7.5z" style="fill:var(--agile)"/>
  <path d="M7.5 10.2v3.6M5.7 12h3.6" style="stroke:#fff"/>
  <path d="M15.5 11h.1M17.8 13h.1" style="stroke:#fff;stroke-width:2.8"/>
</symbol>
<symbol id="i-p-most" viewBox="0 0 24 24">
  <path d="M3 12.5Q12 1 21 12.5z" style="fill:var(--pred)"/>
  <path d="M7.5 8.6v3.9M12 6.8v5.7M16.5 8.6v3.9"/>
  <path d="M2 12.5h20V15H2z" style="fill:var(--surface)"/>
  <path d="M6 15v3.5M18 15v3.5"/>
  <path d="M2 20.5c1.3-.8 2.7-.8 4 0s2.7.8 4 0 2.7-.8 4 0 2.7.8 4 0 2.7-.8 4 0" style="stroke:var(--agile)"/>
</symbol>
<symbol id="i-p-zachrana" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="8.6" style="fill:var(--surface)"/>
  <circle cx="12" cy="12" r="6.6" style="stroke:var(--bad);stroke-width:4;stroke-dasharray:5.18 5.18;stroke-linecap:butt"/>
  <circle cx="12" cy="12" r="8.6"/>
  <circle cx="12" cy="12" r="4.6"/>
</symbol>
<symbol id="i-p-fuze" viewBox="0 0 24 24">
  <circle cx="9" cy="12" r="6" style="fill:var(--pred)"/>
  <circle cx="15" cy="12" r="6" style="fill:var(--agile)"/>
  <path d="M12 6.8a6 6 0 0 1 0 10.4 6 6 0 0 1 0-10.4z" style="fill:var(--both)"/>
  <circle cx="9" cy="12" r="6"/>
  <circle cx="15" cy="12" r="6"/>
</symbol>
<symbol id="i-p-promena" viewBox="0 0 24 24">
  <path d="M11.5 9C9 4.5 3.5 4 3.5 8s3.5 4.5 8 4z" style="fill:var(--pred)"/>
  <path d="M11.5 12.5c-4 0-6.5 1.5-6 4s3.5 3 6-1.5z" style="fill:var(--caution)"/>
  <path d="M12.5 9C15 4.5 20.5 4 20.5 8s-3.5 4.5-8 4z" style="fill:var(--agile)"/>
  <path d="M12.5 12.5c4 0 6.5 1.5 6 4s-3.5 3-6-1.5z" style="fill:var(--agile)"/>
  <path d="M12 7.5v10M12 7.5 10.4 4M12 7.5l1.6-3.5" style="stroke-width:2.4"/>
</symbol>
<!-- ===== Kontexty ===== -->
<symbol id="i-k-zavislost" viewBox="0 0 24 24">
  <path d="M9.5 6.5h3a2 2 0 0 1 2 2V10M6 9v7"/>
  <rect x="2.5" y="4" width="7" height="5" rx="1" style="fill:var(--pred)"/>
  <rect x="14.5" y="10" width="7" height="5" rx="1" style="fill:var(--agile)"/>
  <rect x="3" y="16" width="7" height="5" rx="1" style="fill:var(--surface)"/>
  <path d="M10 18.5h5.5a2 2 0 0 0 2-2V15"/>
</symbol>
<symbol id="i-k-regulace" viewBox="0 0 24 24">
  <path d="M5 6.5 2.5 13.5M5 6.5l2.5 7M19 6.5l-2.5 7M19 6.5l2.5 7"/>
  <path d="M2 13.5h6a3 3 0 0 1-6 0zM16 13.5h6a3 3 0 0 1-6 0z" style="fill:var(--caution)"/>
  <path d="M12 4v16M7.5 20.5h9M5 6.5h14"/>
  <circle cx="12" cy="3.4" r="1.4" style="fill:var(--primary)"/>
</symbol>
<symbol id="i-k-verejny" viewBox="0 0 24 24">
  <path d="M2.8 9 11 4.4 19.2 9z" style="fill:var(--primary)"/>
  <path d="M3.5 9h15M5.5 11v7M9 11v7M12.5 11v3M3.5 19.5h8"/>
  <circle cx="17.5" cy="17" r="4.5" style="fill:var(--caution)"/>
  <path d="M17.5 15v4" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-k-pevny_termin" viewBox="0 0 24 24">
  <path d="M5 3.5 2.5 6M19 3.5 21.5 6M7 20l-1.5 1.5M17 20l1.5 1.5"/>
  <circle cx="12" cy="12.5" r="7.5" style="fill:var(--caution)"/>
  <path d="M12 8.5v4.2l2.8 1.8" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-k-nejistota_trhu" viewBox="0 0 24 24">
  <rect x="4" y="4" width="16" height="16" rx="3" transform="rotate(12 12 12)" style="fill:var(--agile)"/>
  <path d="M8.8 8.2h.1M12 12h.1M15.2 15.8h.1" style="stroke:#fff;stroke-width:3.2"/>
</symbol>
<symbol id="i-k-bezpecnost" viewBox="0 0 24 24">
  <path d="M4 16.5a8 8 0 0 1 16 0z" style="fill:var(--caution)"/>
  <rect x="2.5" y="16.5" width="19" height="2.8" rx="1" style="fill:var(--caution)"/>
  <path d="M10.5 8.8V7h3v1.8M12 9.5v7" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-k-zmena_u_lidi" viewBox="0 0 24 24">
  <path d="M20.5 9a9 9 0 0 0-14.8-4.4M3.5 15a9 9 0 0 0 14.8 4.4M5.4 1.8l.3 2.8 2.8-.3M18.6 22.2l-.3-2.8-2.8.3" style="stroke:var(--agile)"/>
  <circle cx="12" cy="9" r="2.8" style="fill:var(--pred)"/>
  <path d="M7.2 18.5c0-3 2.2-5 4.8-5s4.8 2 4.8 5z" style="fill:var(--pred)"/>
</symbol>
<symbol id="i-k-pevne_okno" viewBox="0 0 24 24">
  <rect x="4" y="3.5" width="16" height="15" rx="1" style="fill:var(--agile)"/>
  <path d="M12 3.5v15M4 11h16" style="stroke:#fff"/>
  <rect x="4" y="3.5" width="16" height="15" rx="1"/>
  <rect x="2.5" y="18.5" width="19" height="2.5" rx=".8" style="fill:var(--pred)"/>
</symbol>
<symbol id="i-k-jasne_zadani" viewBox="0 0 24 24">
  <path d="M5.5 2.5h9l4 4v15h-13z" style="fill:var(--surface)"/>
  <path d="M14.5 2.5v4h4M8 7h4"/>
  <path d="m8 11 1.2 1.2 2.3-2.2M13.5 11.2h2.5M8 15.5l1.2 1.2 2.3-2.2M13.5 15.7h2.5" style="stroke:var(--agile)"/>
</symbol>
<symbol id="i-k-omezene_zdroje" viewBox="0 0 24 24">
  <path d="M3 7.5 15 3.5l1.5 4"/>
  <path d="M3 7.5h15.5a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" style="fill:var(--pred)"/>
  <path d="M14.5 12.5h6v4h-6a2 2 0 0 1 0-4z" style="fill:var(--surface)"/>
  <path d="M16.4 14.5h.1" style="stroke-width:2.6"/>
</symbol>
<symbol id="i-k-rychla_zpetna_vazba" viewBox="0 0 24 24">
  <path d="M10 15.5a1.5 1.5 0 0 1 1.5-1.5H20a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 20 21h-.5v2l-3-2h-5a1.5 1.5 0 0 1-1.5-1.5z" style="fill:var(--caution)"/>
  <path d="M2.5 4.5A1.5 1.5 0 0 1 4 3h9a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 13 12H8l-3.5 3v-3H4a1.5 1.5 0 0 1-1.5-1.5z" style="fill:var(--agile)"/>
  <path d="M9.6 4.8 7.4 7.8h2.8l-1.6 2.6" style="stroke:#fff"/>
</symbol>
<symbol id="i-k-komunita" viewBox="0 0 24 24">
  <path d="M6.5 14l1.2 5h2.3l-1-5"/>
  <path d="M3.5 10v4h3l8 5V5l-8 5z" style="fill:var(--primary)"/>
  <path d="M17.5 9.5c.8.8.8 4.2 0 5M19.8 7.2c2 2.2 2 7.4 0 9.6"/>
</symbol>
<!-- ===== Praktiky ===== -->
<symbol id="i-x-plan" viewBox="0 0 24 24">
  <rect x="3" y="3.5" width="18" height="17" rx="2" style="fill:var(--surface)"/>
  <rect x="5.5" y="6.5" width="7" height="3" rx="1" style="fill:var(--pred)"/>
  <rect x="9.5" y="11" width="6.5" height="3" rx="1" style="fill:var(--pred)"/>
  <path d="M5.5 17.5h6"/>
  <path d="M17 14.3l2.3 2.3-2.3 2.3-2.3-2.3z" style="fill:var(--primary)"/>
</symbol>
<symbol id="i-x-ccb" viewBox="0 0 24 24">
  <path d="M4.5 2.5h10l4 4v15h-14z" style="fill:var(--surface)"/>
  <path d="M14.5 2.5v4h4M7.5 9h7M7.5 12h4"/>
  <circle cx="13.5" cy="17" r="3.6" style="fill:var(--pred)"/>
  <path d="m11.9 17 1.1 1.1 2.1-2.2" style="stroke:#fff"/>
</symbol>
<symbol id="i-x-risk" viewBox="0 0 24 24">
  <path d="M10 7V4.5h2.5V7M12.5 5h3.5l2.2-1.6M16 5l1.2 3.6"/>
  <path d="M9 7h4.5a2 2 0 0 1 2 2v10.5a1.5 1.5 0 0 1-1.5 1.5H8.5A1.5 1.5 0 0 1 7 19.5V9a2 2 0 0 1 2-2z" style="fill:var(--bad)"/>
  <path d="M7 13h8.5" style="stroke:#fff"/>
</symbol>
<symbol id="i-x-detailgantt" viewBox="0 0 24 24">
  <rect x="3" y="3.5" width="18" height="17" rx="2" style="fill:var(--surface)"/>
  <path d="M3 8h18M8 3.5v17M8 2v3M16 2v3"/>
  <path d="M10.2 10.6h3M12 13.2h4.2M15 15.8h3.6M10.2 18.3h5" style="stroke:var(--pred);stroke-width:2.4"/>
  <path d="M4.8 10.6h1.4M4.8 13.2h1.4M4.8 15.8h1.4M4.8 18.3h1.4" style="stroke-width:1.6"/>
</symbol>
<symbol id="i-x-ccball" viewBox="0 0 24 24">
  <path d="M11.5 8.5 19.5 16.5" style="stroke-width:2.8"/>
  <rect x="5" y="4" width="9" height="5" rx="1" transform="rotate(-45 9.5 6.5)" style="fill:var(--pred)"/>
  <rect x="3" y="18.5" width="9.5" height="2.8" rx="1" style="fill:var(--both)"/>
</symbol>
<symbol id="i-x-cpm" viewBox="0 0 24 24">
  <path d="M6.2 13.4 9.4 16.6M12.6 17l5.2-3.6" style="stroke-dasharray:2 2.4"/>
  <path d="M6.2 10.6 9.3 7.4M12.7 7.2l5.1 3.4" style="stroke:var(--primary);stroke-width:2.8"/>
  <circle cx="4.5" cy="12" r="2.3" style="fill:var(--pred)"/>
  <circle cx="11" cy="6" r="2.3" style="fill:var(--pred)"/>
  <circle cx="11" cy="18" r="2.3" style="fill:var(--surface)"/>
  <circle cx="19.5" cy="12" r="2.3" style="fill:var(--pred)"/>
</symbol>
<symbol id="i-x-evm" viewBox="0 0 24 24">
  <path d="M3.5 3.5v17h17"/>
  <path d="M6.5 17c4 0 6-9 12.5-10" style="stroke:var(--pred);stroke-width:2.4;stroke-dasharray:3 2.6"/>
  <path d="M6.5 17c4 0 6-5 9.5-6" style="stroke:var(--agile);stroke-width:2.6"/>
  <circle cx="16.2" cy="11" r="1.7" style="fill:var(--agile)"/>
</symbol>
<symbol id="i-x-sync" viewBox="0 0 24 24">
  <circle cx="8.5" cy="9" r="5.3" style="stroke-width:3;stroke-dasharray:2.4 2.36;stroke-linecap:butt"/>
  <circle cx="8.5" cy="9" r="4.2" style="fill:var(--pred)"/>
  <circle cx="8.5" cy="9" r="1.4" style="fill:var(--surface)"/>
  <circle cx="16" cy="15.8" r="4.6" style="stroke-width:3;stroke-dasharray:2.2 2.34;stroke-linecap:butt"/>
  <circle cx="16" cy="15.8" r="3.6" style="fill:var(--agile)"/>
  <circle cx="16" cy="15.8" r="1.2" style="fill:var(--surface)"/>
</symbol>
<symbol id="i-x-integrace" viewBox="0 0 24 24">
  <path d="M2.5 6.5c4 0 6 5.5 9 5.5" style="stroke:var(--pred);stroke-width:2.6"/>
  <path d="M2.5 17.5c4 0 6-5.5 9-5.5" style="stroke:var(--agile);stroke-width:2.6"/>
  <path d="M16.5 7.2 21.3 12l-4.8 4.8L11.7 12z" style="fill:var(--caution)"/>
</symbol>
<symbol id="i-x-dashboard" viewBox="0 0 24 24">
  <path d="M9 21h6M12 16.5V21"/>
  <rect x="2.5" y="3.5" width="19" height="13" rx="1.5" style="fill:var(--surface)"/>
  <path d="M6.5 13.5v-3M10 13.5v-6M13.5 13.5V9M17 13.5v-7" style="stroke:var(--both);stroke-width:2.6"/>
</symbol>
<symbol id="i-x-gate" viewBox="0 0 24 24">
  <path d="M7.5 7H5M7.5 12H5M19 7h-2.5M19 12h-2.5"/>
  <rect x="7.5" y="2.5" width="9" height="19" rx="3" style="fill:var(--both)"/>
  <circle cx="12" cy="7" r="2" style="fill:var(--bad)"/>
  <circle cx="12" cy="12" r="2" style="fill:var(--caution)"/>
  <circle cx="12" cy="17" r="2" style="fill:var(--good)"/>
</symbol>
<symbol id="i-x-znalosti" viewBox="0 0 24 24">
  <path d="M12 1.2v.8M6.6 3.2l.6.6M17.4 3.2l-.6.6"/>
  <circle cx="12" cy="7" r="3.3" style="fill:var(--caution)"/>
  <path d="M12 13.5c-2-1.4-5-2-8.5-1.7v8c3.5-.3 6.5.3 8.5 1.7 2-1.4 5-2 8.5-1.7v-8c-3.5-.3-6.5.3-8.5 1.7z" style="fill:var(--both)"/>
  <path d="M12 13.5v8" style="stroke:#fff"/>
</symbol>
<symbol id="i-x-prescasy" viewBox="0 0 24 24">
  <path d="M14 3.5a8.5 8.5 0 1 0 6.5 13.6A7.2 7.2 0 0 1 14 3.5z" style="fill:var(--caution)"/>
  <circle cx="17.5" cy="7.5" r="3.8" style="fill:var(--surface)"/>
  <path d="M17.5 5.8v1.9l1.2.8"/>
</symbol>
<symbol id="i-x-scrum" viewBox="0 0 24 24">
  <path d="M2.5 7.5h5M2.5 12h5M2.5 16.5h5"/>
  <path d="M20.5 12a5 5 0 1 1-1.5-3.6" style="stroke:var(--agile);stroke-width:2.8"/>
  <path d="M19.6 5.6v3h-3"/>
  <path d="M15.5 12h.1" style="stroke-width:3.4"/>
</symbol>
<symbol id="i-x-kanban" viewBox="0 0 24 24">
  <rect x="2.5" y="3.5" width="19" height="17" rx="2" style="fill:var(--surface)"/>
  <path d="M8.8 3.5v17M15.2 3.5v17"/>
  <g style="stroke:none">
    <rect x="4" y="6" width="3.4" height="3" rx=".6" style="fill:var(--agile)"/>
    <rect x="4" y="10.5" width="3.4" height="3" rx=".6" style="fill:var(--agile)"/>
    <rect x="4" y="15" width="3.4" height="3" rx=".6" style="fill:var(--agile)"/>
    <rect x="10.3" y="6" width="3.4" height="3" rx=".6" style="fill:var(--caution)"/>
    <rect x="16.6" y="6" width="3.4" height="3" rx=".6" style="fill:var(--good)"/>
    <rect x="16.6" y="10.5" width="3.4" height="3" rx=".6" style="fill:var(--good)"/>
  </g>
</symbol>
<symbol id="i-x-po" viewBox="0 0 24 24">
  <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5z" style="fill:var(--caution)"/>
  <rect x="5" y="18" width="14" height="3" rx="1" style="fill:var(--agile)"/>
  <path d="M12 13.6v.1" style="stroke:#2b2118;stroke-width:2.8"/>
</symbol>
<symbol id="i-x-retro" viewBox="0 0 24 24">
  <path d="M3.5 5A1.5 1.5 0 0 1 5 3.5h14A1.5 1.5 0 0 1 20.5 5v10a1.5 1.5 0 0 1-1.5 1.5h-8l-4.5 4v-4H5A1.5 1.5 0 0 1 3.5 15z" style="fill:var(--agile)"/>
  <path d="M15.4 10a3.4 3.4 0 1 1-1.1-2.5M14.8 5.4v2.3h-2.3" style="stroke:#fff"/>
</symbol>
<symbol id="i-x-dod" viewBox="0 0 24 24">
  <rect x="4.5" y="4" width="15" height="17.5" rx="2" style="fill:var(--agile)"/>
  <rect x="7" y="6.5" width="10" height="12.5" rx="1" style="fill:var(--surface)"/>
  <path d="M9 2.8h6V6H9z" style="fill:var(--surface)"/>
  <path d="m8.8 10.6 1 1 1.8-2M13 10.6h2.4M8.8 15l1 1 1.8-2M13 15h2.4"/>
</symbol>
<symbol id="i-x-lean" viewBox="0 0 24 24">
  <path d="M7 9h3v6.5a1.5 1.5 0 0 1-3 0z" style="fill:var(--agile)"/>
  <path d="M14 12h3v3.5a1.5 1.5 0 0 1-3 0z" style="fill:var(--caution)"/>
  <path d="M7 3v12.5a1.5 1.5 0 0 0 3 0V3M14 3v12.5a1.5 1.5 0 0 0 3 0V3M6 3h5M13 3h5M3.5 13h17M5 13v8M19 13v8M3.5 21h17"/>
</symbol>
<!-- ===== Vzorce a antivzorce ===== -->
<symbol id="i-v-ucici_se_tym" viewBox="0 0 24 24">
  <path d="M12 14.5V9"/>
  <path d="M12 10.5C12 7 9.8 5 6 5c0 3.5 2.2 5.5 6 5.5z" style="fill:var(--good)"/>
  <path d="M12 9c0-3.3 2-5.5 5.5-5.5 0 3.3-2 5.5-5.5 5.5z" style="fill:var(--good)"/>
  <path d="M7 14.5h10l-1.4 6.5H8.4z" style="fill:var(--pred)"/>
  <path d="M6 14.5h12"/>
</symbol>
<symbol id="i-v-dvourychlostni" viewBox="0 0 24 24">
  <path d="M3 8h13" style="stroke:var(--agile);stroke-width:3"/>
  <path d="M14.6 4.8 17.8 8l-3.2 3.2M18.2 4.8 21.4 8l-3.2 3.2"/>
  <path d="M3 16.5h7.5" style="stroke:var(--pred);stroke-width:3"/>
  <path d="M10 13.3l3.2 3.2-3.2 3.2"/>
</symbol>
<symbol id="i-v-transparentni_gate" viewBox="0 0 24 24">
  <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" style="fill:var(--surface)"/>
  <circle cx="12" cy="12" r="3.6" style="fill:var(--agile)"/>
  <circle cx="12" cy="12" r="1.2" style="fill:#2b2118;stroke:#2b2118"/>
</symbol>
<symbol id="i-v-water_scrum_fall" viewBox="0 0 24 24">
  <rect x="3" y="3" width="18" height="18" rx="2" style="fill:var(--line)"/>
  <path d="M16.5 12a4.5 4.5 0 1 1-1.3-3.2" style="stroke:var(--agile);stroke-width:2.8"/>
  <path d="M15.6 6.2V9h-2.8"/>
  <path d="M5.6 6h.1M18.2 18.4h.1M6 18h.1M18.3 5.8h.1" style="stroke-width:2.2"/>
</symbol>
<symbol id="i-v-zamrzly_backlog" viewBox="0 0 24 24">
  <rect x="3" y="3" width="12" height="15" rx="1.5" style="fill:var(--surface)"/>
  <path d="M5.5 7h7M5.5 10.5h7M5.5 14h4"/>
  <circle cx="16.5" cy="16" r="5.5" style="fill:var(--agile)"/>
  <path d="M16.5 12.5v7M13.5 14.2l6 3.6M19.5 14.2l-6 3.6" style="stroke:#fff;stroke-width:1.8"/>
</symbol>
<symbol id="i-v-byrokraticky_hybrid" viewBox="0 0 24 24">
  <rect x="3.5" y="5" width="4.5" height="15.5" rx="1" style="fill:var(--pred)"/>
  <rect x="9.5" y="3.5" width="4.5" height="17" rx="1" style="fill:var(--primary)"/>
  <rect x="15.5" y="6.5" width="4.5" height="14" rx="1" style="fill:var(--both)"/>
  <path d="M4.8 9h1.9M10.8 7.5h1.9M16.8 10.5h1.9" style="stroke:#fff"/>
  <path d="M2 20.5h20"/>
</symbol>
<symbol id="i-v-chaos" viewBox="0 0 24 24">
  <path d="M3 4.5h18M7.5 12.5h9M11 20.5h2" style="stroke-width:2.4"/>
  <path d="M5 8.5h13M9 16.5h5.5" style="stroke:var(--primary);stroke-width:2.6"/>
</symbol>
<symbol id="i-v-bez_vlastnika" viewBox="0 0 24 24">
  <circle cx="11" cy="7.5" r="3.5" style="stroke-dasharray:2.2 2"/>
  <path d="M4 20.5c0-4 3-6.5 7-6.5 1.4 0 2.6.3 3.6.8" style="stroke-dasharray:2.2 2"/>
  <circle cx="18" cy="16" r="4.4" style="fill:var(--primary)"/>
  <path d="M16.6 14.8a1.5 1.5 0 1 1 2.2 1.4c-.5.2-.8.6-.8 1.1M18 19.1v.1" style="stroke:#fff"/>
</symbol>
<symbol id="i-v-bez_zpetne_vazby" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" style="fill:var(--caution)"/>
  <rect x="2.5" y="8.5" width="19" height="4.5" rx="1" style="fill:var(--primary)"/>
  <path d="M21.5 10.8 23 9M21.5 11l1.5 2.2"/>
  <path d="M9.5 16.5h5" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-v-slepy_plan" viewBox="0 0 24 24">
  <rect x="3" y="3.5" width="18" height="17" rx="2" style="fill:var(--surface)"/>
  <path d="M3 8h18M8 3.5v17"/>
  <path d="M12.6 12.2a2 2 0 1 1 2.8 1.8c-.6.3-.9.8-.9 1.4v.4M14.5 18.3v.1" style="stroke:var(--primary);stroke-width:2.4"/>
</symbol>
<symbol id="i-v-melounovy_reporting" viewBox="0 0 24 24">
  <path d="M2.5 8.5h19a9.5 9.5 0 0 1-19 0z" style="fill:var(--good)"/>
  <path d="M5 8.5h14a7 7 0 0 1-14 0z" style="fill:var(--bad)"/>
  <path d="M9 11.5v.1M12 13.8v.1M15 11.5v.1" style="stroke:#2b2118;stroke-width:2.4"/>
</symbol>
<symbol id="i-v-hrdinske_tempo" viewBox="0 0 24 24">
  <rect x="2.5" y="8" width="16" height="10" rx="2" style="fill:var(--surface)"/>
  <path d="M18.5 11.5h2v3h-2"/>
  <rect x="4.6" y="10" width="3" height="6" rx=".5" style="fill:var(--bad);stroke:none"/>
  <path d="M13 2.5c1.6 1.2 2.4 2.5 2.4 3.6a2.4 2.4 0 0 1-4.8 0c0-.7.4-1.5 1-2 .2.6.5 1 1 1.2.2-1 .2-1.8.4-2.8z" style="fill:var(--primary)"/>
</symbol>
<symbol id="i-v-ostrov_znalosti" viewBox="0 0 24 24">
  <path d="M5 18c1.5-3 4.5-4 7-4s5.5 1 7 4z" style="fill:var(--caution)"/>
  <path d="M12 14.5c.3-3.5-.2-6-1.5-8.5"/>
  <path d="M10.5 6C8.5 4 5.5 4 4 6.5c2.5-.6 4.6 0 6.5-.5zM10.5 6c1.5-2.5 4.5-3 7-1.5-2.5.5-4.6 1.2-7 1.5zM10.5 6c2.6-.5 5 .8 6 3.2-2-1-4-1.6-6-3.2z" style="fill:var(--good)"/>
  <path d="M2 20.5c1.3-.8 2.7-.8 4 0s2.7.8 4 0 2.7-.8 4 0 2.7.8 4 0 2.7-.8 4 0" style="stroke:var(--agile)"/>
</symbol>
<symbol id="i-v-agilni_divadlo" viewBox="0 0 24 24">
  <path d="M10 3.5h10.5V10a5.25 5.25 0 0 1-10.5 0z" style="fill:var(--primary)"/>
  <path d="M12.8 7h1M16.6 7h1M13 12.2c.9-.8 2.9-.8 3.8 0" style="stroke:#fff"/>
  <path d="M3.5 9h10.5v6.5a5.25 5.25 0 0 1-10.5 0z" style="fill:var(--caution)"/>
  <path d="M6.3 12.4h1M10.2 12.4h1M6.5 15.6c.9.9 2.9.9 3.8 0" style="stroke:#2b2118"/>
</symbol>
<symbol id="i-v-bduf" viewBox="0 0 24 24">
  <g transform="rotate(-25 9 14.5)">
    <rect x="1.5" y="12" width="15" height="5" rx="1" style="fill:var(--caution)"/>
    <path d="M4.5 12v2M7.5 12v2.6M10.5 12v2M13.5 12v2.6" style="stroke:#2b2118"/>
  </g>
  <path d="M14 11a3 3 0 0 1 .3-6 4.2 4.2 0 0 1 7.9 1.2A2.4 2.4 0 0 1 21.8 11z" style="fill:var(--surface)"/>
  <path d="M15.5 13.6h6M17.5 16.4h4"/>
</symbol>
<symbol id="i-v-hybrid_za_kazdou_cenu" viewBox="0 0 24 24">
  <path d="M3.5 9h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4h-12z" style="fill:var(--primary)"/>
  <path d="M21.8 2.2 17.8 6.2" style="stroke-width:2.4"/>
  <rect x="14.5" y="3.4" width="5.5" height="3" rx=".6" transform="rotate(45 17.25 4.9)" style="fill:var(--pred)"/>
  <path d="M13.2 2.6l.6 1.4M11.4 4.6l1.5.3"/>
</symbol>
<symbol id="i-v-vodopad_kde_sedi" viewBox="0 0 24 24">
  <path d="M3 5h6v5h6v5h6v5.5H3z" style="fill:var(--pred)"/>
  <path d="M3.5 5h5.5c.8 0 1 2.5 1 5h5c.8 0 1 2.5 1 5h4.5" style="stroke:var(--agile);stroke-width:2.6"/>
</symbol>
<symbol id="i-v-build_measure_learn" viewBox="0 0 24 24">
  <path d="M14.2 6.6l3.6 6.6M16.6 18.5H7.4M6.2 13.2l3.6-6.6"/>
  <path d="M15.6 12.4l2.2.8.3-2.4M9.4 16.8 7.4 18.5l2 1.7M7.5 7.5l2.3-.9.3 2.4"/>
  <circle cx="12" cy="4.5" r="2.8" style="fill:var(--caution)"/>
  <circle cx="19.5" cy="17" r="2.8" style="fill:var(--agile)"/>
  <circle cx="4.5" cy="17" r="2.8" style="fill:var(--good)"/>
</symbol>
<symbol id="i-v-tovarna_na_funkce" viewBox="0 0 24 24">
  <path d="M4 4.5h14M15.5 2.3 18 4.5l-2.5 2.2"/>
  <rect x="3.5" y="8.5" width="4.6" height="5.5" rx=".5" style="fill:var(--primary)"/>
  <rect x="9.7" y="8.5" width="4.6" height="5.5" rx=".5" style="fill:var(--primary)"/>
  <rect x="15.9" y="8.5" width="4.6" height="5.5" rx=".5" style="fill:var(--primary)"/>
  <rect x="2.5" y="14" width="19" height="5" rx="2.5" style="fill:var(--surface)"/>
  <path d="M6 16.5h.1M12 16.5h.1M18 16.5h.1" style="stroke-width:2.6"/>
</symbol>
<symbol id="i-v-adaptivni_rizeni" viewBox="0 0 24 24">
  <path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M18.7 5.3 5.3 18.7"/>
  <circle cx="12" cy="12" r="6.4" style="stroke:var(--agile);stroke-width:3.4"/>
  <circle cx="12" cy="12" r="2.4" style="fill:var(--pred)"/>
</symbol>
<symbol id="i-v-strnula_metodika" viewBox="0 0 24 24">
  <rect x="2.5" y="4" width="19" height="16" rx="1" style="fill:var(--primary)"/>
  <path d="M2.5 9.3h19M2.5 14.7h19M8 4v5.3M16 4v5.3M12 9.3v5.4M5 14.7V20M19 14.7V20" style="stroke:var(--surface);stroke-width:1.6"/>
  <rect x="2.5" y="4" width="19" height="16" rx="1"/>
</symbol>
<symbol id="i-v-zametene_pod_koberec" viewBox="0 0 24 24">
  <path d="M21.5 2.5 15 12"/>
  <path d="M15 12l-2.6 1 1.8 3.2 2.8-1.8z" style="fill:var(--caution)"/>
  <path d="M2 20.5h15c0-2-1.5-4.5-4-4.5s-3 1.6-4 1.6S6 16.2 4 16.8 2 18.6 2 20.5z" style="fill:var(--primary)"/>
  <path d="M18.8 19.5h.1M20.8 17.6h.1" style="stroke-width:2.4"/>
</symbol>
<symbol id="i-v-investice_se_vraci" viewBox="0 0 24 24">
  <path d="M12 21v-7.5M12 16.5l-2.5-2M7 21h10"/>
  <circle cx="12" cy="9" r="6.5" style="fill:var(--good)"/>
  <g style="fill:var(--caution);stroke:#2b2118;stroke-width:1.3">
    <circle cx="9.5" cy="7.6" r="1.5"/><circle cx="14.4" cy="10" r="1.5"/><circle cx="11" cy="11.6" r="1.5"/>
  </g>
</symbol>
</svg>`;

document.body.insertAdjacentHTML('afterbegin', ICON_SPRITE + ICON_SPRITE_OBSAH);

/** Ikona ze spritu. cls: 'sm' (menší), 'lg' (větší), případně další třídy. */
const ic = (id, cls = '') => `<svg class="ic ${cls}" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;

// Systémové ikony v datech nahradíme kresbou (emoji v datech zůstávají jako záloha pro texty).
for (const m of METRICS) m.icon = ic(m.id);
for (const k of Object.keys(APPROACHES)) APPROACHES[k].icon = ic(k === 'hybrid' ? 'hybrid' : k);

// ---------- Monogramy lidí (stakeholdeři a tým) ----------
const MONO_COLORS = ['pred', 'agile', 'primary', 'both', 'insane', 'good'];
const MONO_SKIP = new Set(['a', 'i', 'v', 'z', 's', 'na', 'pro', 'obou', 'do', 'of', 'the', 'and', 'for', 'both', 'from']);
function initials(name) {
  const words = name.split(/\s+/).filter(w => w && !MONO_SKIP.has(w.toLowerCase()));
  if (/^[A-ZÁ-Ž]{2,3}$/.test(words[0])) return words[0];
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
/** Barevný kroužek s iniciálami. idx = pořadí osoby v seznamu (určuje barvu). */
const mono = (person, idx = 0, cls = '') =>
  `<span class="mono ${cls}" style="--c:var(--${MONO_COLORS[idx % MONO_COLORS.length]})" aria-hidden="true">${initials(person.name)}</span>`;

// Text popisku zůstává z dat (i přeložený), jen se emoji na začátku nahradí ikonou.
for (const k of ['pred', 'hybrid', 'agile']) WORLD_LABEL[k] = `${ic(k)} ${WORLD_LABEL[k].replace(/^\S+\s/, '')}`;

// ---------- Ikony obsahu: projekty, kontexty, praktiky, vzorce ----------
// Vzorce, které přímo vznikají z jedné praktiky, sdílejí její ikonu.
const PATTERN_ICON_SHARED = { integracni_milnik: 'x-integrace', pripravena_rezerva: 'x-risk', sdilene_knowhow: 'x-znalosti', hotovo_je_hotovo: 'x-dod', kriticka_cesta: 'x-cpm' };
const hasIcon = id => ICON_SPRITE_OBSAH.includes(`id="i-${id}"`);
const useIcon = (obj, id) => { if (hasIcon(id)) obj.icon = ic(id); };
for (const s of SCENARIOS) useIcon(s, `p-${s.id}`);
for (const [k, t] of Object.entries(CONTEXT_TAGS)) useIcon(t, `k-${k}`);
for (const p of PRACTICES) useIcon(p, `x-${p.id}`);
for (const p of PATTERNS) useIcon(p, PATTERN_ICON_SHARED[p.id] || `v-${p.id}`);

// Emoji ukazatelů v popisech mechanismů praktik nahradíme stejnými ikonami jako v ukazatelích.
const TEXT_ICONS = { '📅': 'harmonogram', '💰': 'rozpocet', '😊': 'spokojenost', '⭐': 'kvalita', '💪': 'moralka', '🔗': 'hybrid' };
const iconizeText = s => s.replace(/📅|💰|😊|⭐|💪|🔗/gu, e => ic(TEXT_ICONS[e], 'sm'));
for (const p of PRACTICES) if (p.mech) p.mech = iconizeText(p.mech);
