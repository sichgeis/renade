# Renade – Soli-Seite (statisch)

Barrierearme, mobilfreundliche Single-Page.
Dieses Repository enthält eine statische One-Page-Website für Solidarität & Gedenken an Renade. Inhalte kommen aus JSON-Dateien, keine Tracker, keine externen Fonts.

## Quick Start
- __Lokaler Server__: Wegen JSON-Fetch bitte mit Server starten, z. B.:
  - Python: `python3 -m http.server 8080` und dann http://localhost:8080 öffnen
  - Node: `npx serve .`
- __Bearbeiten__: Texte/Config in `data/` anpassen, Bilder in `assets/img/` ersetzen.

## Struktur
- `index.html` – Semantisches HTML, i18n-Switch, Sektionen
- `assets/css/styles.css` – Design (Systemfonts, variables, Fokus, Kontraste)
- `assets/js/main.js` – Logik: JSON laden, Rendern, i18n, Share, Mailto
- `assets/img/` – Platzhalter-Bilder, Favicon, Social-Share-Image
- `data/config.json` – Konfiguration (Ziele, Spenden-Optionen, Theme, Kontakt)
- `data/content.de.json` – Inhalte (Deutsch)
- `data/content.en.json` – Inhalte (Englisch, kurz; Fallback auf DE bei fehlenden Keys)

## Inhalte pflegen
- __Seitentitel__: `config.json > siteTitle`
- __Sprachen__: `config.json > locales` und `defaultLocale`
- __Texte__: `content.de.json` und `content.en.json`, gleiche Schlüsselstruktur
- __Sektionen ausblenden__: Wenn Listen leer/Strings leer sind, blendet JS Sektionen aus
- __Spenden-Ziele__: `config.json > donation.goalMin / goalMax`
- __Aktueller Stand__: `config.json > donation.raised` (einfachen Eurobetrag eintragen)
- __Bank/PayPal/Bar__: über `config.json > donation.*.enabled` aktivieren/deaktivieren
- __Kontakt/Impressum/Datenschutz__: `config.json > contact.*`

## Barrierefreiheit (A11y)
- __Semantik__: sinnvolle Headings, `nav`, `main`, `footer`
- __Alt-Texte__: in `content.*.json > memories.gallery[].alt`
- __Kontrast/Fokus__: hohe Kontraste, sichtbare Fokus-Styles in `styles.css`
- __Tastatur__: Buttons/Links sind tastaturbedienbar, Skip-Link vorhanden
- __Bewegung__: `prefers-reduced-motion` respektiert
- __Touch-Ziele__: ausreichend Padding bei Buttons

## Interaktionen
- __Spendenfortschritt__: Prozent = `raised / goalMax` (leerer Balken bei 0). Text zeigt Range `goalMin–goalMax`.
- __Teilen__: `navigator.share` wenn verfügbar; Fallback: Link wird in die Zwischenablage kopiert oder per Prompt angezeigt.
- __Einsendungen__: Mailto-Link mit Betreff „Erinnerung für Renade“ und Body-Template.
- __i18n__: Erkennung per `navigator.language`, Fallback auf `defaultLocale`. Umschalter DE/EN.

## Deployment (GitHub Pages)
1) Push ins Repository
2) In GitHub: Settings → Pages → Source „Deploy from a branch“
3) Branch „main“ (oder passend) und Ordner „/root“ (Repository-Root) wählen
4) Speichern. Nach wenigen Minuten ist die Seite live unter `https://<user>.github.io/<repo>/`

Tipp: Für Projektnamen mit Unterordner-Pfad funktionieren alle Assets relativ (kein Framework nötig).

## Bilder: Größen & Performance
- __Responsive__: `index.html` nutzt `srcset`/`sizes` beim Hero
- __Empfehlungen__:
  - Hero: 1200px Breite (`1@2x.jpg`), zusätzlich 600px (`1.jpg`)
  - Galerie: 1200px max längste Kante
  - Komprimierung: JPEG 70–80% Qualität, PNG nur wenn nötig, Social-Share 1200×630
- __Lazy-Loading__: Galerie-Bilder laden mit `loading="lazy"`

## Datenschutz/ Rechtliches (Kurzfassung)
- Keine Cookies, kein Tracking, keine Formulare. Keine externen Fonts. Optionales CDN wird nicht genutzt.
- E-Mail-Kontakt: Verarbeitung erfolgt beim Mail-Provider. Verantwortliche Stelle: `config.json > contact.privacy.controller`.
- Impressum-Daten in `config.json > contact.imprint` pflegen.

## Qualität/Checks
- Ziel: Lighthouse (Mobile) ≥90 für Performance/Best Practices/SEO/Accessibility
- HTML validieren (z. B. via https://validator.w3.org/)
- Kontraste WCAG AA prüfen (Farben in `config.json > theme` anpassbar)

## Häufige Anpassungen
- Farben: `config.json > theme.primary` und `theme.primarySoft` (wirken als CSS-Variablen)
- Hashtag/OG: `config.json > social.hashtag`, `assets/img/social-share.png`
- Favicon: `assets/img/favicon.png`

## Wartung des Spendenstands
Zum Aktualisieren einfach `data/config.json` öffnen und `donation.raised` in Euro anpassen. Commit + Push, die Seite liest den Wert beim Laden.

---

Bei Fragen/Korrekturen gern PR erstellen oder Issue anlegen.
