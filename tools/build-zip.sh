#!/usr/bin/env bash
# Sestaví ZIP s hrou pro hraní bez internetu: dist/projektova-alchymie.zip
# Obsahuje jen soubory hry (bez nástrojů, zdrojů překladu a návrhů) a krátký návod.
# Zároveň ověří, že seznam souborů pro offline režim v sw.js odpovídá souborům hry.
# Použití: tools/build-zip.sh   (spouští se z kořene repozitáře, soubory bere z gitu)
set -euo pipefail
cd "$(dirname "$0")/.."

NAME=projektova-alchymie
# Soubory hry = verzované soubory kromě vývojových složek a souborů (a obrázků pro sdílení na sítích).
FILES=$(git ls-files | grep -v -E '^(tools/|i18n/|navrh-|\.claude/|\.gitignore$|README\.md$|img/og)')

# Kontrola sw.js: každý soubor hry (kromě sw.js a licencí písem) musí být v OFFLINE_FILES a naopak.
LISTED=$(sed -n '/^const OFFLINE_FILES = \[/,/^\];/p' sw.js | grep -o "'[^']*'" | tr -d "'" | grep -v '/$' | sort)
EXPECTED=$(echo "$FILES" | grep -v -E '^sw\.js$|^fonts/OFL-' | sort)
if [ "$LISTED" != "$EXPECTED" ]; then
  echo "Seznam OFFLINE_FILES v sw.js neodpovídá souborům hry (< chybí v sw.js, > navíc v sw.js):" >&2
  diff <(echo "$EXPECTED") <(echo "$LISTED") >&2 || true
  exit 1
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir "$TMP/$NAME"
echo "$FILES" | while read -r f; do mkdir -p "$TMP/$NAME/$(dirname "$f")"; cp "$f" "$TMP/$NAME/$f"; done
cat > "$TMP/$NAME/CTI-ME.txt" <<'TXT'
Projektová alchymie – výuková hra o řízení projektů
====================================================

Hra běží v prohlížeči i bez internetu:
1. Rozbal celý ZIP do libovolné složky.
2. Otevři soubor index.html (dvojklikem nebo přetažením do prohlížeče).
   Anglická verze je v en/index.html.

Postup se ukládá v prohlížeči, ve kterém hraješ.
Online verze: https://miroslavkrupa.github.io/games-projektova-alchymie/


Project Alchemy – an educational game about project management
==============================================================

The game runs in your browser, offline too:
1. Unzip the whole archive into any folder.
2. Open en/index.html (double-click it or drag it into your browser).

Progress is saved in the browser you play in.
Online version: https://miroslavkrupa.github.io/games-projektova-alchymie/en/
TXT
mkdir -p dist
rm -f "dist/$NAME.zip"
(cd "$TMP" && zip -qrX9 "$OLDPWD/dist/$NAME.zip" "$NAME")
echo "dist/$NAME.zip: $(echo "$FILES" | wc -l | tr -d ' ') souborů, $(du -h "dist/$NAME.zip" | cut -f1)"
