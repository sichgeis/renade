(() => {
  "use strict";
  const copy = {
    de: {
      title: "Für Renade", pageTitle: "Für Renade – Danke für eure Solidarität", skip: "Zum Inhalt springen",
      status: "Spendenaktion abgeschlossen", heading: "Danke für eure Solidarität.",
      thanks: "Danke an alle, die gespendet, mitgeholfen oder die Aktion geteilt haben. Eure Unterstützung hat viel bedeutet.",
      archive: "Diese Seite bleibt als Erinnerung und Rückblick online. Es werden keine weiteren Spenden gesammelt.",
      memoryLink: "Erinnerungen ansehen ↓", storyLabel: "In Erinnerung", about: "Über Renade", tributes: "Erinnerungen in Worten", memories: "Erinnerungen", memoriesNote: "Bilder, die bleiben.",
      footer: "Danke für eure Unterstützung. Sie bleibt in Erinnerung.", footerNote: "Historischer Rückblick · Die Spendenaktion ist abgeschlossen.",
      imageAlt: "Porträtfoto von Renade", gallery: "Bildergalerie", photo: "Bild", close: "Bild schließen", previous: "Vorheriges Bild", next: "Nächstes Bild",
      error: "Die Erinnerungen konnten gerade nicht geladen werden. Bitte versucht es später noch einmal.", toggle: "Switch to English"
    },
    en: {
      title: "For Renade", pageTitle: "For Renade – Thank you for your solidarity", skip: "Skip to content",
      status: "Fundraiser completed", heading: "Thank you for your solidarity.",
      thanks: "Thank you to everyone who donated, helped out or shared the fundraiser. Your support has meant so much.",
      archive: "This page remains online as a place of remembrance and reflection. We are no longer collecting donations.",
      memoryLink: "View memories ↓", storyLabel: "In remembrance", about: "About Renade", tributes: "Words of remembrance", memories: "Memories", memoriesNote: "Pictures to remember.",
      footer: "Thank you for your support. It will be remembered.", footerNote: "A historical reflection · The fundraiser is complete.",
      imageAlt: "Portrait of Renade", gallery: "Photo gallery", photo: "Photo", close: "Close photo", previous: "Previous photo", next: "Next photo",
      error: "The memories could not be loaded just now. Please try again later.", toggle: "Zu Deutsch wechseln"
    }
  };
  const $ = id => document.getElementById(id);
  const dialog = $("photo-dialog");
  const cache = new Map();
  let locale = "de";
  let gallery = [];
  let photoIndex = 0;
  let renderVersion = 0;
  let photoTrigger = null;

  function safeImagePath(value) {
    const path = String(value || "");
    if (!/^assets\/img\/[\w.-]+\.(?:jpe?g|png|webp|svg)$/i.test(path)) throw new Error("Invalid image path");
    return `${path}?v=archive-20261024`;
  }

  function textList(element, items) {
    element.replaceChildren();
    for (const item of items || []) {
      const li = document.createElement("li");
      li.textContent = typeof item === "string" ? item : [item.text || item.quote, item.author || item.name].filter(Boolean).join(" — ");
      element.append(li);
    }
    element.hidden = element.children.length === 0;
  }

  function updatePhoto() {
    const item = gallery[photoIndex];
    if (!item) return;
    $("photo-full").src = safeImagePath(item.src);
    $("photo-full").alt = item.alt || item.caption || `${copy[locale].photo} ${photoIndex + 1}`;
    $("photo-caption").textContent = item.caption || item.alt || `${copy[locale].photo} ${photoIndex + 1}`;
    $("photo-count").textContent = `${photoIndex + 1} / ${gallery.length}`;
  }

  function openPhoto(index, trigger) {
    photoIndex = index;
    photoTrigger = trigger;
    updatePhoto();
    dialog.showModal();
  }

  function nextPhoto(offset) {
    if (!gallery.length) return;
    photoIndex = (photoIndex + offset + gallery.length) % gallery.length;
    updatePhoto();
  }

  async function render(language) {
    const version = ++renderVersion;
    if (!cache.has(language)) {
      const response = await fetch(`data/content.${language}.json?v=archive-20261024`, { cache: "no-cache" });
      if (!response.ok) throw new Error("Content unavailable");
      cache.set(language, await response.json());
    }
    if (version !== renderVersion) return;
    const content = cache.get(language);
    const words = copy[language];
    locale = language;
    document.documentElement.lang = locale;
    document.title = words.pageTitle;
    const labels = {
      "site-title": words.title, "skip-link": words.skip, "campaign-status": words.status,
      "thanks-title": words.heading, "thanks-body": words.thanks, "archive-note": words.archive,
      "memory-link": words.memoryLink, "story-label": words.storyLabel, "about-title": words.about,
      "memories-title": words.memories, "memories-note": words.memoriesNote, "tributes-title": words.tributes,
      "footer-thanks": words.footer, "footer-note": words.footerNote,
      "hero-name": content.hero.name, "hero-lifespan": content.hero.lifespan || ""
    };
    for (const [id, text] of Object.entries(labels)) $(id).textContent = text;
    $("lang-toggle").textContent = locale === "de" ? "EN" : "DE";
    $("lang-toggle").setAttribute("aria-label", words.toggle);
    $("hero-image").alt = words.imageAlt;
    $("gallery").setAttribute("aria-label", words.gallery);
    $("photo-close").setAttribute("aria-label", words.close);
    $("photo-prev").setAttribute("aria-label", words.previous);
    $("photo-next").setAttribute("aria-label", words.next);
    $("about-text").replaceChildren();
    for (const paragraph of String(content.about.text || "").split(/\n\s*\n/).filter(Boolean)) {
      const p = document.createElement("p");
      p.textContent = paragraph;
      $("about-text").append(p);
    }
    textList($("about-quotes"), content.about.quotes);
    $("tributes").hidden = $("about-quotes").hidden;
    textList($("testimonials"), content.memories.testimonials);
    gallery = content.memories.gallery || [];
    $("gallery").replaceChildren();
    gallery.forEach((item, index) => {
      const figure = document.createElement("figure");
      const button = document.createElement("button");
      const image = document.createElement("img");
      const description = item.alt || item.caption || `${words.photo} ${index + 1}`;
      button.type = "button";
      button.setAttribute("aria-label", description);
      image.src = safeImagePath(item.src);
      image.alt = description;
      image.loading = "lazy";
      image.decoding = "async";
      button.append(image);
      button.addEventListener("click", () => openPhoto(index, button));
      figure.append(button);
      if (item.caption) {
        const caption = document.createElement("figcaption");
        caption.textContent = item.caption;
        figure.append(caption);
      }
      $("gallery").append(figure);
    });
    $("load-error").hidden = true;
    if (dialog.open) updatePhoto();
  }

  function showError() {
    $("load-error").textContent = copy[locale].error;
    $("load-error").hidden = false;
  }

  $("lang-toggle").addEventListener("click", async () => {
    const language = locale === "de" ? "en" : "de";
    try {
      await render(language);
      try { localStorage.setItem("renade-language", language); } catch {}
    } catch { showError(); }
  });
  $("photo-close").addEventListener("click", () => dialog.close());
  $("photo-prev").addEventListener("click", () => nextPhoto(-1));
  $("photo-next").addEventListener("click", () => nextPhoto(1));
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => photoTrigger?.focus());
  dialog.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") { event.preventDefault(); nextPhoto(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); nextPhoto(1); }
  });
  let language = new URLSearchParams(location.search).get("lang");
  if (!copy[language]) {
    try { language = localStorage.getItem("renade-language"); } catch {}
  }
  render(copy[language] ? language : "de").catch(showError);
})();
