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

document.body.insertAdjacentHTML('afterbegin', ICON_SPRITE);

/** Ikona ze spritu. cls: 'sm' (menší), 'lg' (větší), případně další třídy. */
const ic = (id, cls = '') => `<svg class="ic ${cls}" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;

// Systémové ikony v datech nahradíme kresbou (emoji v datech zůstávají jako záloha pro texty).
for (const m of METRICS) m.icon = ic(m.id);
for (const k of Object.keys(APPROACHES)) APPROACHES[k].icon = ic(k === 'hybrid' ? 'hybrid' : k);

// ---------- Monogramy lidí (stakeholdeři a tým) ----------
const MONO_COLORS = ['pred', 'agile', 'primary', 'both', 'insane', 'good'];
const MONO_SKIP = new Set(['a', 'i', 'v', 'z', 's', 'na', 'pro', 'obou', 'do']);
function initials(name) {
  const words = name.split(/\s+/).filter(w => w && !MONO_SKIP.has(w.toLowerCase()));
  if (/^[A-ZÁ-Ž]{2,3}$/.test(words[0])) return words[0];
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
/** Barevný kroužek s iniciálami. idx = pořadí osoby v seznamu (určuje barvu). */
const mono = (person, idx = 0, cls = '') =>
  `<span class="mono ${cls}" style="--c:var(--${MONO_COLORS[idx % MONO_COLORS.length]})" aria-hidden="true">${initials(person.name)}</span>`;

WORLD_LABEL.pred = `${ic('pred')} Prediktivní praktiky`;
WORLD_LABEL.hybrid = `${ic('hybrid')} Propojovací a společné praktiky`;
WORLD_LABEL.agile = `${ic('agile')} Agilní praktiky`;
