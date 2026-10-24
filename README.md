# Für Renade — Erinnerungsseite

Die Spendenaktion ist abgeschlossen. Diese historische Seite bedankt sich bei
allen Unterstützerinnen und Unterstützern und bewahrt die öffentliche Geschichte
und die Fotogalerie. Es gibt keine Spenden-, Zahlungs-, Kontakt- oder
Einsendefunktion mehr.

## Lokal ansehen

```sh
python3 scripts/build_site.py
python3 -m http.server 8765 --directory _site
```

Die Website benötigt keine zusätzlichen Pakete. Inhalte liegen in
`data/content.de.json` und `data/content.en.json`; allgemeine UI-Texte in
`assets/js/main.js`. Fotos, Alternativtexte und Bildunterschriften bleiben Teil
der bewusst veröffentlichten Erinnerungen.

## Veröffentlichung

GitHub Pages veröffentlicht ausschließlich den von `scripts/build_site.py`
erstellten Ordner `_site`. Die feste Dateiauswahl umfasst HTML, CSS, JavaScript,
die beiden öffentlichen Inhaltsdateien und Bilddateien. Repository-Notizen,
Konfiguration, Tabellen und andere Arbeitsdateien werden nicht hochgeladen.
Die bestehende Pages-Domain bleibt unverändert.

## Bereinigte Historie

Private Arbeitsnotizen, Zahlungsdaten, Kontaktangaben und interne
Bildredaktionstabellen wurden aus der erreichbaren Git-Historie entfernt.
Git-Autoren-E-Mails verwenden die GitHub-noreply-Adresse. Öffentliche
Erinnerungen, Fotos und die Autorenzuordnung bleiben erhalten.

Nach der Bereinigung frisch klonen. Alte Klone oder Branches nicht
zurückmischen oder pushen: Sie können die entfernten Daten erneut einführen.
GitHub-interne PR-Verweise und zwischengespeicherte alte Commits können eine
separate serverseitige Bereinigung erfordern.
