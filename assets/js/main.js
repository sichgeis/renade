/* Main logic: load JSON config + content, render sections, i18n, share, mailto. */
(function () {
  const state = {
    config: null,
    content: null,
    locale: "de",
    galleryData: [],
    lightbox: {
      el: null,
      idx: 0,
      lastFocus: null,
    },
  };

  const els = {
    siteTitle: document.getElementById("siteTitle"),
    skipLink: document.getElementById("skip-link"),
    langNav: document.getElementById("lang-nav"),
    heroName: document.getElementById("hero-name"),
    heroLifespan: document.getElementById("hero-lifespan"),
    heroTagline: document.getElementById("hero-tagline"),
    donateCta: document.getElementById("donate-cta"),
    aboutTitle: document.getElementById("about-title"),
    aboutText: document.getElementById("about-text"),
    aboutQuotes: document.getElementById("about-quotes"),
    gallery: document.getElementById("gallery"),
    testimonials: document.getElementById("testimonials"),
    submitMail: document.getElementById("submit-mail"),
    memoriesTitle: document.getElementById("memories-title"),
    donateTitle: document.getElementById("donate-title"),
    donateTransparency: document.getElementById("donate-transparency"),
    donateBreakdown: document.getElementById("donate-breakdown"),
    bank: document.getElementById("bank"),
    bankTitle: document.getElementById("bank-title"),
    bankAccountHolderLabel: document.getElementById("bank-accountHolderLabel"),
    bankAccountName: document.getElementById("bank-accountName"),
    bankIban: document.getElementById("bank-iban"),
    bankReference: document.getElementById("bank-reference"),
    paypal: document.getElementById("paypal"),
    paypalTitle: document.getElementById("paypal-title"),
    paypalUrl: document.getElementById("paypal-url"),
    paypalNote: document.getElementById("paypal-note"),
    cash: document.getElementById("cashDrop"),
    cashTitle: document.getElementById("cash-title"),
    cashDesc: document.getElementById("cash-desc"),
    cashAddress: document.getElementById("cash-address"),
    eventsTitle: document.getElementById("events-title"),
    eventsList: document.getElementById("events-list"),
    faqTitle: document.getElementById("faq-title"),
    faqList: document.getElementById("faq-list"),
    contactTitle: document.getElementById("contact-title"),
    contactNote: document.getElementById("contact-note"),
    footerCredits: document.getElementById("footer-credits"),
    footerHashtag: document.getElementById("footer-hashtag"),
    imprint: document.getElementById("imprint"),
    privacy: document.getElementById("privacy"),
    imprintSummary: document.getElementById("imprint-summary"),
    privacySummary: document.getElementById("privacy-summary"),
    langToggle: document.getElementById("lang-toggle"),
    shareBtn: document.getElementById("share-btn"),
  };

  // i18n: detect preferred locale, constrain to available locales
  function detectLocale(locales, fallback) {
    const nav = navigator.language || navigator.userLanguage || "";
    const short = nav.toLowerCase().slice(0, 2);
    return locales.includes(short) ? short : fallback;
  }

  async function loadJSON(path) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to load " + path);
    return res.json();
  }

  function setTheme(theme) {
    if (!theme) return;
    const root = document.documentElement;
    if (theme.primary) root.style.setProperty("--color-primary", theme.primary);
    if (theme.primarySoft)
      root.style.setProperty("--color-primary-soft", theme.primarySoft);
    // Rainbow accent bar optional
    if (theme.accentRainbow) {
      let bar = document.querySelector(".accent-rainbow");
      if (!bar) {
        bar = document.createElement("div");
        bar.className = "accent-rainbow";
        document.querySelector(".site-header")?.appendChild(bar);
      }
    }
  }

  function formatCurrency(euro) {
    return new Intl.NumberFormat(state.locale === "en" ? "en-DE" : "de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(euro);
  }

  function renderHero() {
    const { hero } = state.content;
    els.heroName.textContent = hero?.name || "";
    els.heroLifespan.textContent = hero?.lifespan || "";
    els.heroTagline.textContent = hero?.tagline || "";
    if (els.donateCta)
      els.donateCta.textContent =
        state.content?.ui?.donateCta || els.donateCta.textContent;
    // update alt text if provided
    const heroImg = document.getElementById("hero-image");
    if (heroImg && state.content?.ui?.heroImageAlt)
      heroImg.alt = state.content.ui.heroImageAlt;
  }

  function renderAbout() {
    const about = state.content?.about;
    const hasText = about?.text && about.text.trim().length > 0;
    document.getElementById("about").hidden =
      !hasText && !about?.quotes?.length;
    if (hasText) els.aboutText.textContent = about.text;

    els.aboutQuotes.innerHTML = "";
    (about?.quotes || []).forEach((q) => {
      const li = document.createElement("li");
      const block = document.createElement("blockquote");
      // Use textContent to avoid HTML injection and rely on CSS to preserve newlines
      block.textContent = q.text || "";
      const author = document.createElement("div");
      author.className = "muted";
      author.textContent = q.author || "";
      li.appendChild(block);
      li.appendChild(author);
      els.aboutQuotes.appendChild(li);
    });
  }

  function renderMemories() {
    const mem = state.content?.memories;
    const gallery = mem?.gallery || [];
    const testimonials = mem?.testimonials || [];
    document.getElementById("memories").hidden =
      gallery.length === 0 && testimonials.length === 0;

    // keep a copy for lightbox navigation
    state.galleryData = gallery;

    // render clickable items for lightbox
    els.gallery.innerHTML = "";
    gallery.forEach((item, i) => {
      const fig = document.createElement("figure");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-item-btn";
      btn.dataset.index = String(i);
      btn.style.cursor = "zoom-in";
      btn.setAttribute("aria-label", (item.alt || "") + "; open image");
      btn.addEventListener("click", () => openLightbox(i));

      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || "";
      img.loading = "lazy";
      img.decoding = "async";
      btn.appendChild(img);
      fig.appendChild(btn);
      if (item.caption) {
        const cap = document.createElement("figcaption");
        cap.textContent = item.caption;
        fig.appendChild(cap);
      }
      els.gallery.appendChild(fig);
    });

    // Event delegation as a safety net (in case button listeners are disrupted)
    if (!els.gallery.dataset.delegateAttached) {
      els.gallery.addEventListener(
        "click",
        (e) => {
          const target = e.target;
          if (!(target instanceof Element)) return;
          // if click on img inside a button
          const btn = target.closest(".gallery-item-btn");
          if (btn && btn instanceof HTMLElement && btn.dataset.index) {
            const idx = parseInt(btn.dataset.index, 10);
            if (!Number.isNaN(idx)) openLightbox(idx);
          }
        },
        { passive: true }
      );
      els.gallery.dataset.delegateAttached = "true";
    }

    els.testimonials.innerHTML = "";
    testimonials.forEach((t) => {
      const li = document.createElement("li");
      li.innerHTML = `<p>${t.text}</p><div class="muted">${t.name || ""}</div>`;
      els.testimonials.appendChild(li);
    });

    // mailto for submissions
    const subject = mem?.mailtoSubject || "";
    const body = mem?.mailtoBody || "";
    const mail = state.config?.contact?.email || "";
    els.submitMail.href = `mailto:${encodeURIComponent(
      mail
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    els.submitMail.textContent = state.content?.memories?.submissionNote || "";
  }

  // --- Lightbox implementation ---
  function ensureLightbox() {
    if (state.lightbox.el) return state.lightbox.el;
    const overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.cursor = "zoom-out";

    const dialog = document.createElement("div");
    dialog.className = "lightbox__dialog";
    dialog.setAttribute("tabindex", "-1");

    const closeBtn = document.createElement("button");
    closeBtn.className = "lightbox__close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "✕";
    closeBtn.addEventListener("click", closeLightbox);

    const prevBtn = document.createElement("button");
    prevBtn.className = "lightbox__nav lightbox__nav--prev";
    prevBtn.type = "button";
    prevBtn.setAttribute("aria-label", "Previous image");
    prevBtn.textContent = "‹";
    prevBtn.addEventListener("click", showPrev);

    const nextBtn = document.createElement("button");
    nextBtn.className = "lightbox__nav lightbox__nav--next";
    nextBtn.type = "button";
    nextBtn.setAttribute("aria-label", "Next image");
    nextBtn.textContent = "›";
    nextBtn.addEventListener("click", showNext);

    const img = document.createElement("img");
    img.className = "lightbox__img";
    img.alt = "";

    const caption = document.createElement("div");
    caption.className = "lightbox__caption";

    dialog.appendChild(closeBtn);
    dialog.appendChild(prevBtn);
    dialog.appendChild(nextBtn);
    dialog.appendChild(img);
    dialog.appendChild(caption);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // click outside dialog closes
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeLightbox();
    });

    state.lightbox.el = overlay;
    return overlay;
  }

  function updateLightbox() {
    const idx = state.lightbox.idx;
    const item = state.galleryData[idx];
    if (!item) return;
    const overlay = ensureLightbox();
    const img = overlay.querySelector(".lightbox__img");
    const cap = overlay.querySelector(".lightbox__caption");
    img.src = item.src;
    img.alt = item.alt || "";
    cap.textContent = item.caption || "";
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      showPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      showNext();
    }
  }

  function openLightbox(index) {
    if (!state.galleryData.length) return;
    const overlay = ensureLightbox();
    state.lightbox.idx = index;
    state.lightbox.lastFocus = document.activeElement;
    try {
      console.debug("Lightbox open", { index, item: state.galleryData[index] });
    } catch {}
    updateLightbox();
    overlay.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", onKeydown);
    // lock background scroll (simpler & robust)
    document.documentElement.classList.add("no-scroll");
    // focus the dialog for screen readers and to capture keys
    overlay.querySelector(".lightbox__dialog").focus();
  }

  function closeLightbox() {
    if (!state.lightbox.el) return;
    state.lightbox.el.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKeydown);
    if (
      state.lightbox.lastFocus &&
      typeof state.lightbox.lastFocus.focus === "function"
    ) {
      state.lightbox.lastFocus.focus();
    }
    // restore background scroll
    document.documentElement.classList.remove("no-scroll");
  }

  function showPrev() {
    if (!state.galleryData.length) return;
    state.lightbox.idx =
      (state.lightbox.idx - 1 + state.galleryData.length) %
      state.galleryData.length;
    updateLightbox();
  }

  function showNext() {
    if (!state.galleryData.length) return;
    state.lightbox.idx = (state.lightbox.idx + 1) % state.galleryData.length;
    updateLightbox();
  }

  function renderDonate() {
    const donateSection = document.getElementById("donate");
    if (!donateSection) return;

    const donate = state.content?.donate;
    const cfg = state.config?.donation;
    donateSection.hidden = !donate && !cfg;

    if (els.donateTitle && state.content?.ui?.titles?.donate)
      els.donateTitle.textContent = state.content.ui.titles.donate;
    els.donateTransparency.textContent = donate?.transparency || "";

    els.donateBreakdown.innerHTML = "";
    (donate?.costBreakdown || []).forEach((row) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${row.item}</span><span>${row.amount}</span>`;
      els.donateBreakdown.appendChild(li);
    });

    // bank
    if (cfg?.bank?.enabled) {
      els.bank.hidden = false;
      if (els.bankTitle && state.content?.ui?.donate?.bankTitle)
        els.bankTitle.textContent = state.content.ui.donate.bankTitle;
      if (
        els.bankAccountHolderLabel &&
        state.content?.ui?.donate?.bankAccountHolderLabel
      )
        els.bankAccountHolderLabel.textContent =
          state.content.ui.donate.bankAccountHolderLabel + " ";
      if (state.content?.ui?.donate?.bankIbanLabel)
        document.getElementById("bank-ibanLabel").textContent =
          state.content.ui.donate.bankIbanLabel + " ";
      if (state.content?.ui?.donate?.bankReferenceLabel)
        document.getElementById("bank-referenceLabel").textContent =
          state.content.ui.donate.bankReferenceLabel + " ";
      els.bankAccountName.textContent = cfg.bank.accountName || "";
      els.bankIban.textContent = cfg.bank.iban || "";
      els.bankReference.textContent = cfg.bank.reference || "";
    } else {
      els.bank.hidden = true;
    }

    // paypal
    if (cfg?.paypal?.enabled) {
      els.paypal.hidden = false;
      if (els.paypalTitle && state.content?.ui?.donate?.paypalTitle)
        els.paypalTitle.textContent = state.content.ui.donate.paypalTitle;
      els.paypalUrl.href = cfg.paypal.url || "#";
      if (state.content?.ui?.donate?.paypalCta)
        els.paypalUrl.textContent = state.content.ui.donate.paypalCta;
      els.paypalNote.textContent =
        state.content?.donate?.paypalNote || cfg.paypal.note || "";
    } else {
      els.paypal.hidden = true;
    }

    // cash
    if (cfg?.cashDrop?.enabled) {
      els.cash.hidden = false;
      if (els.cashTitle && state.content?.ui?.donate?.cashTitle)
        els.cashTitle.textContent = state.content.ui.donate.cashTitle;
      els.cashDesc.textContent =
        state.content?.donate?.cashDescription ||
        cfg.cashDrop.description ||
        "";
      els.cashAddress.textContent = cfg.cashDrop.address || "";
    } else {
      els.cash.hidden = true;
    }
  }

  function renderEvents() {
    const events = state.content?.events || [];
    const section = document.getElementById("events");
    section.hidden = events.length === 0;
    if (els.eventsTitle && state.content?.ui?.titles?.events)
      els.eventsTitle.textContent = state.content.ui.titles.events;
    els.eventsList.innerHTML = "";
    events.forEach((ev) => {
      const li = document.createElement("li");
      const date = ev.date ? `<div><strong>${ev.date}</strong></div>` : "";
      const loc = ev.location ? `<div>${ev.location}</div>` : "";
      const details = ev.details ? `<div>${ev.details}</div>` : "";
      const more = state.content?.ui?.eventsMore || "Mehr";
      const link = ev.link
        ? `<div><a href="${ev.link}" target="_blank" rel="noopener">${more}</a></div>`
        : "";
      li.innerHTML = `<h3>${ev.title || ""}</h3>${date}${loc}${details}${link}`;
      els.eventsList.appendChild(li);
    });
  }

  function renderFaq() {
    const faq = state.content?.faq || [];
    const section = document.getElementById("faq");
    section.hidden = faq.length === 0;
    if (els.faqTitle && state.content?.ui?.titles?.faq)
      els.faqTitle.textContent = state.content.ui.titles.faq;
    els.faqList.innerHTML = "";
    faq.forEach((item) => {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = item.q || "";
      const p = document.createElement("p");
      p.textContent = item.a || "";
      details.appendChild(summary);
      details.appendChild(p);
      els.faqList.appendChild(details);
    });
  }

  function renderContactAndFooter() {
    if (els.contactTitle && state.content?.ui?.titles?.contact)
      els.contactTitle.textContent = state.content.ui.titles.contact;
    els.contactNote.textContent = state.content?.contact?.note || "";
    const credits = state.content?.footer?.credits || "";
    const hashtag =
      state.content?.footer?.hashtag || state.config?.social?.hashtag || "";
    els.footerCredits.textContent = credits;
    els.footerHashtag.textContent = hashtag;

    const imp = state.config?.contact?.imprint;
    if (imp) {
      els.imprint.innerHTML = `
        <p><strong>${imp.name || ""}</strong></p>
        <p>${(imp.address || "").replace(/\n/g, "<br>")}</p>
        <p><a href="mailto:${imp.email}">${imp.email}</a></p>
      `;
    }

    const priv = state.config?.contact?.privacy;
    if (priv) {
      const p = state.content?.ui?.privacy || {};
      const controller = priv.controller || "";
      const lines = (p.lines || []).map((line) =>
        line.replace("{controller}", controller)
      );
      els.privacy.innerHTML = lines.map((txt) => `<p>${txt}</p>`).join("");
    }

    // Summaries
    if (els.imprintSummary && state.content?.ui?.imprintSummary)
      els.imprintSummary.textContent = state.content.ui.imprintSummary;
    if (els.privacySummary && state.content?.ui?.privacySummary)
      els.privacySummary.textContent = state.content.ui.privacySummary;
  }

  function updateLangToggle() {
    if (!els.langToggle) return;
    const toggleText =
      state.locale === "en"
        ? "Sprache auf Deutsch ändern"
        : "Change the language to english";
    els.langToggle.textContent = toggleText;
    els.langToggle.setAttribute(
      "aria-label",
      state.content?.ui
        ? state.content.ui.langToggleAria ||
            (state.locale === "en" ? "Switch language" : "Sprache wechseln")
        : state.locale === "en"
        ? "Switch language"
        : "Sprache wechseln"
    );
  }

  function applyUIStrings() {
    const ui = state.content?.ui || {};
    // document title and site header title
    const siteTitle = ui.siteTitle || state.config?.siteTitle;
    if (siteTitle) {
      document.title = siteTitle;
      if (els.siteTitle) els.siteTitle.textContent = siteTitle;
      const ogt = document.querySelector('meta[property="og:title"]');
      if (ogt) ogt.setAttribute("content", siteTitle);
    }
    if (ui.metaDescription) {
      const md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute("content", ui.metaDescription);
      const ogd = document.querySelector('meta[property="og:description"]');
      if (ogd) ogd.setAttribute("content", ui.metaDescription);
    }
    if (els.skipLink && ui.skipLink) els.skipLink.textContent = ui.skipLink;
    if (els.langNav && ui.langNavLabel)
      els.langNav.setAttribute("aria-label", ui.langNavLabel);
    if (els.aboutTitle && ui.titles?.about)
      els.aboutTitle.textContent = ui.titles.about;
    if (els.memoriesTitle && ui.titles?.memories)
      els.memoriesTitle.textContent = ui.titles.memories;
    if (els.shareBtn && ui.share) els.shareBtn.textContent = ui.share;
    // aria labels
    if (ui.aria) {
      const aq = document.getElementById("about-quotes");
      if (aq && ui.aria.aboutQuotes)
        aq.setAttribute("aria-label", ui.aria.aboutQuotes);
      if (els.gallery && ui.aria.gallery)
        els.gallery.setAttribute("aria-label", ui.aria.gallery);
      if (els.testimonials && ui.aria.testimonials)
        els.testimonials.setAttribute("aria-label", ui.aria.testimonials);
    }
    // ensure language toggle reflects current locale
    updateLangToggle();
  }

  async function loadContentForLocale(locale) {
    try {
      const path = `data/content.${locale}.json`;
      state.content = await loadJSON(path);
    } catch (e) {
      // fallback to de if missing
      if (locale !== "de") {
        state.content = await loadJSON("data/content.de.json");
      } else {
        throw e;
      }
    }
  }

  function attachInteractions() {
    // language toggle
    if (els.langToggle) {
      els.langToggle.addEventListener("click", async () => {
        const next = state.locale === "de" ? "en" : "de";
        if (state.locale === next) return;
        state.locale = next;
        document.documentElement.lang = state.locale;
        await loadContentForLocale(state.locale);
        renderAll();
        updateLangToggle();
      });
    }

    // share functionality
    els.shareBtn.addEventListener("click", async () => {
      const shareData = {
        title:
          state.content?.ui?.siteTitle ||
          state.config?.siteTitle ||
          document.title,
        text: state.content?.hero?.tagline || "",
        url: location.href,
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch {}
      } else {
        try {
          await navigator.clipboard.writeText(location.href);
          const ui = state.content?.ui || {};
          const copied = ui.shareCopied || "Link copied";
          const label = ui.share || "Share";
          els.shareBtn.textContent = copied;
          setTimeout(() => {
            els.shareBtn.textContent = label;
          }, 2000);
        } catch {
          window.prompt(
            state.content?.ui?.copyUrlPrompt || "Copy URL:",
            location.href
          );
        }
      }
    });
  }

  function renderAll() {
    // titles and meta from content.ui if present
    applyUIStrings();
    setTheme(state.config?.theme);
    renderHero();
    renderAbout();
    renderMemories();
    renderDonate();
    renderEvents();
    renderFaq();
    renderContactAndFooter();
  }

  async function init() {
    try {
      state.config = await loadJSON("data/config.json");
      // Always start in German regardless of previous selection or browser settings
      state.locale = "de";
      document.documentElement.lang = state.locale;
      await loadContentForLocale(state.locale);

      // set site title from config
      // prefer content.ui.siteTitle; fallback to config handled in applyUIStrings

      attachInteractions();
      renderAll();
    } catch (err) {
      console.error(err);
    }
  }

  // Kickoff
  init();
})();
