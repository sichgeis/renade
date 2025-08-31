/* Main logic: load JSON config + content, render sections, i18n, share, mailto. */
(function () {
  const state = {
    config: null,
    content: null,
    locale: 'de'
  };

  const els = {
    siteTitle: document.getElementById('siteTitle'),
    heroName: document.getElementById('hero-name'),
    heroLifespan: document.getElementById('hero-lifespan'),
    heroTagline: document.getElementById('hero-tagline'),
    progress: document.querySelector('.progress'),
    progressBar: document.getElementById('progress-bar'),
    progressLabel: document.getElementById('progress-label'),
    aboutText: document.getElementById('about-text'),
    aboutQuotes: document.getElementById('about-quotes'),
    gallery: document.getElementById('gallery'),
    testimonials: document.getElementById('testimonials'),
    submitMail: document.getElementById('submit-mail'),
    donateTransparency: document.getElementById('donate-transparency'),
    donateBreakdown: document.getElementById('donate-breakdown'),
    bank: document.getElementById('bank'),
    bankAccountName: document.getElementById('bank-accountName'),
    bankIban: document.getElementById('bank-iban'),
    bankBic: document.getElementById('bank-bic'),
    bankReference: document.getElementById('bank-reference'),
    paypal: document.getElementById('paypal'),
    paypalUrl: document.getElementById('paypal-url'),
    paypalNote: document.getElementById('paypal-note'),
    cash: document.getElementById('cashDrop'),
    cashDesc: document.getElementById('cash-desc'),
    cashAddress: document.getElementById('cash-address'),
    eventsList: document.getElementById('events-list'),
    faqList: document.getElementById('faq-list'),
    contactNote: document.getElementById('contact-note'),
    footerCredits: document.getElementById('footer-credits'),
    footerHashtag: document.getElementById('footer-hashtag'),
    imprint: document.getElementById('imprint'),
    privacy: document.getElementById('privacy'),
    langDe: document.getElementById('lang-de'),
    langEn: document.getElementById('lang-en'),
    shareBtn: document.getElementById('share-btn')
  };

  // i18n: detect preferred locale, constrain to available locales
  function detectLocale(locales, fallback) {
    const nav = navigator.language || navigator.userLanguage || '';
    const short = nav.toLowerCase().slice(0,2);
    return locales.includes(short) ? short : fallback;
  }

  async function loadJSON(path) {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load ' + path);
    return res.json();
  }

  function setTheme(theme) {
    if (!theme) return;
    const root = document.documentElement;
    if (theme.primary) root.style.setProperty('--color-primary', theme.primary);
    if (theme.primarySoft) root.style.setProperty('--color-primary-soft', theme.primarySoft);
    // Rainbow accent bar optional
    if (theme.accentRainbow) {
      let bar = document.querySelector('.accent-rainbow');
      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'accent-rainbow';
        document.querySelector('.site-header')?.appendChild(bar);
      }
    }
  }

  function formatCurrency(euro) {
    return new Intl.NumberFormat(state.locale === 'en' ? 'en-DE' : 'de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(euro);
  }

  function renderHero() {
    const { hero } = state.content;
    els.heroName.textContent = hero?.name || '';
    els.heroLifespan.textContent = hero?.lifespan || '';
    els.heroTagline.textContent = hero?.tagline || '';
  }

  function renderProgress() {
    const { donation } = state.config;
    const ratio = donation.goalMax > 0 ? Math.max(0, Math.min(1, (donation.raised || 0) / donation.goalMax)) : 0;
    const percent = Math.round(ratio * 100);
    els.progressBar.style.width = percent + '%';
    els.progress.setAttribute('aria-valuenow', String(percent));
    const rangeText = `${formatCurrency(donation.goalMin)}–${formatCurrency(donation.goalMax)}`;
    const labelStart = (donation.raised || 0) > 0 ? `${formatCurrency(donation.raised)} von ${rangeText}` : `Start: 0 € von ${rangeText}`;
    els.progressLabel.textContent = labelStart;
  }

  function renderAbout() {
    const about = state.content?.about;
    const hasText = about?.text && about.text.trim().length > 0;
    document.getElementById('about').hidden = !hasText && !(about?.quotes?.length);
    if (hasText) els.aboutText.textContent = about.text;

    els.aboutQuotes.innerHTML = '';
    (about?.quotes || []).forEach(q => {
      const li = document.createElement('li');
      li.innerHTML = `<blockquote>“${q.text}”</blockquote><div class="muted">${q.author || ''}</div>`;
      els.aboutQuotes.appendChild(li);
    });
  }

  function renderMemories() {
    const mem = state.content?.memories;
    const gallery = mem?.gallery || [];
    const testimonials = mem?.testimonials || [];
    document.getElementById('memories').hidden = gallery.length === 0 && testimonials.length === 0;

    els.gallery.innerHTML = '';
    gallery.forEach(item => {
      const fig = document.createElement('figure');
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      fig.appendChild(img);
      if (item.caption) {
        const cap = document.createElement('figcaption');
        cap.textContent = item.caption;
        fig.appendChild(cap);
      }
      els.gallery.appendChild(fig);
    });

    els.testimonials.innerHTML = '';
    testimonials.forEach(t => {
      const li = document.createElement('li');
      li.innerHTML = `<p>${t.text}</p><div class="muted">${t.name || ''}</div>`;
      els.testimonials.appendChild(li);
    });

    // mailto for submissions
    const subject = state.locale === 'en' ? 'Memory for Renade' : 'Erinnerung für Renade';
    const body = state.locale === 'en'
      ? 'Hello,\n\nI would like to share a memory for Renade.\nName: ...\nShort text: ...\nPhotos: (optional)\n\nThank you.'
      : 'Hallo,\n\nich möchte eine Erinnerung für Renade teilen.\nName: ...\nKurztext: ...\nFotos: (optional)\n\nDanke.';
    const mail = state.config?.contact?.email || '';
    els.submitMail.href = `mailto:${encodeURIComponent(mail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    els.submitMail.textContent = state.content?.memories?.submissionNote || (state.locale === 'en' ? 'Send a memory' : 'Erinnerung senden');
  }

  function renderDonate() {
    const donate = state.content?.donate;
    const cfg = state.config?.donation;
    const donateSection = document.getElementById('donate');
    donateSection.hidden = !donate && !cfg;

    els.donateTransparency.textContent = donate?.transparency || '';

    els.donateBreakdown.innerHTML = '';
    (donate?.costBreakdown || []).forEach(row => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${row.item}</span><span>${row.amount}</span>`;
      els.donateBreakdown.appendChild(li);
    });

    // bank
    if (cfg?.bank?.enabled) {
      els.bank.hidden = false;
      els.bankAccountName.textContent = cfg.bank.accountName || '';
      els.bankIban.textContent = cfg.bank.iban || '';
      els.bankBic.textContent = cfg.bank.bic || '';
      els.bankReference.textContent = cfg.bank.reference || '';
    } else {
      els.bank.hidden = true;
    }

    // paypal
    if (cfg?.paypal?.enabled) {
      els.paypal.hidden = false;
      els.paypalUrl.href = cfg.paypal.url || '#';
      els.paypalNote.textContent = cfg.paypal.note || '';
    } else {
      els.paypal.hidden = true;
    }

    // cash
    if (cfg?.cashDrop?.enabled) {
      els.cash.hidden = false;
      els.cashDesc.textContent = cfg.cashDrop.description || '';
      els.cashAddress.textContent = cfg.cashDrop.address || '';
    } else {
      els.cash.hidden = true;
    }
  }

  function renderEvents() {
    const events = state.content?.events || [];
    const section = document.getElementById('events');
    section.hidden = events.length === 0;
    els.eventsList.innerHTML = '';
    events.forEach(ev => {
      const li = document.createElement('li');
      const date = ev.date ? `<div><strong>${ev.date}</strong></div>` : '';
      const loc = ev.location ? `<div>${ev.location}</div>` : '';
      const details = ev.details ? `<div>${ev.details}</div>` : '';
      const link = ev.link ? `<div><a href="${ev.link}" target="_blank" rel="noopener">Mehr</a></div>` : '';
      li.innerHTML = `<h3>${ev.title || ''}</h3>${date}${loc}${details}${link}`;
      els.eventsList.appendChild(li);
    });
  }

  function renderFaq() {
    const faq = state.content?.faq || [];
    const section = document.getElementById('faq');
    section.hidden = faq.length === 0;
    els.faqList.innerHTML = '';
    faq.forEach(item => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = item.q || '';
      const p = document.createElement('p');
      p.textContent = item.a || '';
      details.appendChild(summary);
      details.appendChild(p);
      els.faqList.appendChild(details);
    });
  }

  function renderContactAndFooter() {
    els.contactNote.textContent = state.content?.contact?.note || '';
    const credits = state.content?.footer?.credits || '';
    const hashtag = state.content?.footer?.hashtag || state.config?.social?.hashtag || '';
    els.footerCredits.textContent = credits;
    els.footerHashtag.textContent = hashtag;

    const imp = state.config?.contact?.imprint;
    if (imp) {
      els.imprint.innerHTML = `
        <p><strong>${imp.name || ''}</strong></p>
        <p>${(imp.address || '').replace(/\n/g,'<br>')}</p>
        <p><a href="mailto:${imp.email}">${imp.email}</a></p>
      `;
    }

    const priv = state.config?.contact?.privacy;
    if (priv) {
      els.privacy.innerHTML = `
        <p>Es werden keine personenbezogenen Daten erhoben, keine Cookies gesetzt, kein Tracking verwendet. Keine externen Fonts. Optionales CDN wird nicht genutzt.</p>
        <p>Verantwortliche Stelle: ${priv.controller || ''}.</p>
        <p>Bei Kontakt per E-Mail werden die Daten durch den Mail-Provider verarbeitet.</p>
      `;
    }
  }

  function updateLangButtons() {
    els.langDe.setAttribute('aria-pressed', String(state.locale === 'de'));
    els.langEn.setAttribute('aria-pressed', String(state.locale === 'en'));
  }

  async function loadContentForLocale(locale) {
    try {
      const path = `data/content.${locale}.json`;
      state.content = await loadJSON(path);
    } catch (e) {
      // fallback to de if missing
      if (locale !== 'de') {
        state.content = await loadJSON('data/content.de.json');
      } else {
        throw e;
      }
    }
  }

  function attachInteractions() {
    // language switching
    [els.langDe, els.langEn].forEach(btn => btn.addEventListener('click', async (e) => {
      const lang = e.currentTarget.getAttribute('data-lang');
      if (state.locale === lang) return;
      state.locale = lang;
      localStorage.setItem('locale', state.locale);
      await loadContentForLocale(state.locale);
      renderAll();
      updateLangButtons();
      document.documentElement.lang = state.locale;
    }));

    // share functionality
    els.shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: state.config?.siteTitle || document.title,
        text: state.content?.hero?.tagline || '',
        url: location.href
      };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch {}
      } else {
        try {
          await navigator.clipboard.writeText(location.href);
          els.shareBtn.textContent = state.locale === 'en' ? 'Link copied' : 'Link kopiert';
          setTimeout(() => { els.shareBtn.textContent = state.locale === 'en' ? 'Share' : 'Teilen'; }, 2000);
        } catch {
          window.prompt('URL kopieren:', location.href);
        }
      }
    });
  }

  function renderAll() {
    document.title = state.config?.siteTitle || document.title;
    setTheme(state.config?.theme);
    renderHero();
    renderProgress();
    renderAbout();
    renderMemories();
    renderDonate();
    renderEvents();
    renderFaq();
    renderContactAndFooter();
  }

  async function init() {
    try {
      state.config = await loadJSON('data/config.json');
      // locale detection order: saved -> navigator -> default
      state.locale = localStorage.getItem('locale') || detectLocale(state.config.locales || ['de','en'], state.config.defaultLocale || 'de');
      document.documentElement.lang = state.locale;
      await loadContentForLocale(state.locale);

      // set site title from config
      if (state.config.siteTitle) {
        els.siteTitle.textContent = state.config.siteTitle;
      }

      attachInteractions();
      renderAll();
    } catch (err) {
      console.error(err);
    }
  }

  // Kickoff
  init();
})();
