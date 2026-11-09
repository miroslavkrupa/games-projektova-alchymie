# Překlady Projektové alchymie

- `cs/` – kostra: všechny české texty obsahu (projekty, praktiky, vzorce, události, slovníček).
  Generuje ji `node tools/i18n-extract.mjs` z `js/data.js` a `js/data-insane.js`, ručně se needituje.
- `en/` – anglický překlad obsahu. Stejná struktura i klíče jako `cs/`, jen přeložené hodnoty.
- `tools/i18n-check.mjs en` – kontrola úplnosti (chybějící texty, id, zástupné symboly, HTML, zbytky češtiny).
- `tools/i18n-build.mjs` – sestaví z `en/*.json` soubor `js/lang/en.js`, který hra načte v angličtině.
- Texty rozhraní (tlačítka, obrazovky, pravidla) jsou ve slovníku v `js/lang/en-ui.js`.

Po změně českého obsahu: spustit extrakci (doplní kostru), přeložit nové texty v `en/`, spustit kontrolu a build.

## Terminologie (čeština → angličtina, americký pravopis)

| Česky | Anglicky |
|---|---|
| Projektová alchymie | Project Alchemy |
| prediktivně / agilně / hybridní | predictive(ly) / agile / hybrid |
| prediktivně řízené prvky | predictively managed parts |
| přístup (k řízení) | approach |
| praktika, mix praktik | practice, practice mix |
| režie řízení | management overhead |
| kotel | cauldron |
| vzorec / antivzorec | pattern / anti-pattern |
| kontext → forma → mechanismus → důsledek | context → form → mechanism → consequence |
| Rozpočet, Harmonogram, Kvalita, Spokojenost, Morálka týmu | Budget, Schedule, Quality, Satisfaction, Team morale |
| milník, integrační milník | milestone, integration milestone |
| etapa (prediktivní období) | stage |
| výluka (železnice) | track closure |
| odstávka (elektrárna) | outage |
| rezerva projektu, kritická cesta, vůle | project buffer, critical path, float |
| stage gate, kontrolní den, demo day | stage gate, checkpoint review, demo day |
| řídicí výbor, změnové řízení, změnová komise | steering committee, change control, change control board |
| sponzor, zadavatel, stakeholder | sponsor, client, stakeholder |
| provoz, linie (liniová organizace) | operations, line organization |
| položka backlogu, MoSCoW | backlog item, MoSCoW (Must / Should / Could / Won't) |
| SP, MD (člověkoden) | SP, PD (person-day) |
| Rok poté | A year later |
| únava, morálka | fatigue, morale |
| kolaudace | occupancy approval |
| Melounový reporting | Watermelon reporting |
| Sprinty v betonu | Sprints set in concrete |
| Jedna změnová komise pro všechno | One change board for everything |
