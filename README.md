# Renade – Soli-Seite (statisch)

Barrierearme, mobilfreundliche Single-Page ohne Frameworks. Inhalte kommen aus JSON.

## Schnellstart

- Variante A (ohne Node):
  - Mit Python: `python3 -m http.server 8080` und `http://localhost:8080` öffnen.
- Variante B (Node, optional):
  - `npm i` und `npm run start` (nutzt http-server). Aufruf: `http://localhost:8080`

Die Seite ist rein statisch und kann auf Netlify, GitHub Pages, Uberspace o.ä. gehostet werden.

## Struktur

```
/index.html
/css/styles.css
/js/app.js
/data/content.de.json
/data/content.en.json
/assets/hero.jpg
/assets/og-image.png
/assets/galerie-platzhalter-1.jpg ...
/README.md
/LICENSE
```

## Inhalte bearbeiten

- Texte, Zitate, Galerie, Termine, FAQ, Kontakt: in `data/content.de.json` (und optional `data/content.en.json`).
- Spendenstand: Feld `donations.currentRaised` anpassen. Ziele via `goalMin`, `goalMax`, Währung via `currency`.
- Spendenoptionen: `donations.bank`, `donations.paypal`, `donations.cash`.
- Bilder: Dateien in `assets/` ersetzen. Dateinamen in `gallery[].src` anpassen. Achte auf sinnvolle `alt`-Texte und kurze `caption`s.
- Open-Graph: `assets/og-image.png` ersetzen (1200×630 empfohlen) und ggf. `index.html`-Metas anpassen.

Änderungen speichern, Seite neu laden.

## Sprache (i18n)

- Standard: Deutsch (`content.de.json`).
- Englisch optional (`content.en.json`).
- Umschalten per Buttons oben rechts. Auswahl wird in `?lang=` in der URL und in `localStorage` gespeichert (keine Cookies).
- Fallback: Falls `content.en.json` fehlt oder inkomplett ist, werden deutsche Inhalte geladen.

## Fortschrittsbalken-Logik

Konfiguration in JSON unter `donations`:

```json
{
  "currentRaised": 0,
  "goalMin": 4000,
  "goalMax": 5000,
  "currency": "€"
}
```

Visualisierung:
- current <= goalMin: Füllung bis `current/goalMin`.
- goalMin < current < goalMax: "innerer Korridor" (Annäherung an Zielbereich) via `current/goalMax`.
- current >= goalMax: Balken voll + "Ziel erreicht".

Der Text unter dem Balken wird als Live-Region aktualisiert und ist screenreader-freundlich.

## Barrierefreiheit

- Semantische Überschriften-Hierarchie und Landmark-Rollen.
- Sichtbarer Skip-Link.
- Tastaturbedienbare Tabs (Spendenoptionen).
- ARIA `role=progressbar` mit `aria-valuemin/max/now` und Live-Region.
- Deutliche Fokuszustände, hohe Kontraste, ausreichend Weißraum.

## DSGVO & Datenschutz

- Keine Cookies, kein Tracking, kein externes Font-Loading.
- E-Mail-Kontakt via `mailto:`.
- Externe Zahlungslinks öffnen in neuem Tab mit `rel="noopener"`.

## Assets/Platzhalter

- Platzhalter-Bilder (`hero.jpg`, `galerie-platzhalter-*.jpg`, `og-image.png`, `favicon.ico`) sind leer. Bitte durch echte Dateien ersetzen.
- Empfohlen: sinnvolle Dateigrößen, `loading="lazy"` ist bereits aktiviert.

## Deployment-Hinweise

- Statischer Upload des Ordners genügt. Kein Build nötig.
- Setze `Cache-Control` kurz für JSON, falls möglich (damit Spendenstand schnell aktualisiert wird).

## Lizenz

MIT – siehe `LICENSE`.
