/**
 * Main UI & Dual n8n Chatbot Orchestration for Geza.ai Services Website
 * - Mounts TWO separate live Mac mini n8n AI Chatbots:
 *    1) Géza's Services AI Concierge (Hero + Floating Drawer -> /webhook/services-chat)
 *    2) Examples Section Live SMB Quote & FAQ Demo Bot (-> /webhook/example-demo-chat)
 * - Multilingual switcher (EN / DE / HU)
 * - Scroll-reveal animations & sticky header elevation (IntegratedBio / Eddie.eco feel)
 * - Smooth FAQ Accordion
 * - Contact Form with Mac mini n8n instant email alert & multi-endpoint fallback
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var currentLang = 'en';
  try {
    var stored = localStorage.getItem('geza_services_lang');
    if (stored && ['en', 'de', 'hu'].indexOf(stored) !== -1) {
      currentLang = stored;
    }
  } catch (e) {}

  function t(key, lang) {
    var l = lang || currentLang;
    var dict = window.SITE_TRANSLATIONS || {};
    if (dict[l] && dict[l][key]) return dict[l][key];
    if (dict.en && dict.en[key]) return dict.en[key];
    return key;
  }

  // =========================================================================
  // 1. Mount BOTH Separate Live n8n Chatbots via GezaChatEngine
  // =========================================================================

  var SERVICES_CONCIERGE_CONFIG = {
    sessionPrefix: 'srv_',
    webhookPath: 'services-chat',
    proxyPath: '/api/services-chat',
    knowledgeBaseUrl: 'knowledge-services.json',
    contextDocUrl: 'n8n/geza-services-context.md',
    theme: 'concierge',
    i18n: {
      en: {
        title: "Géza's AI Services Concierge",
        subtext: 'Ask anything about my 4 services, architecture & process',
        placeholder: 'Ask about AI chatbots, automations, websites...',
        online: 'Online · n8n',
        thinking: 'Consulting grounded services dossier',
        answeredIn: 'Answered in ',
        groundedLive: '✓ Live Mac mini n8n',
        groundedFallback: '✓ Grounded Dossier',
        archBtn: 'Architecture',
        contextBtn: 'Context Doc',
        contextModalTitle: 'Grounded Context: Géza Services Dossier (geza-services-context.md)',
        pills: [
          { label: 'AI Quote Chatbots', query: 'How do your AI chatbots answer questions and calculate quotes from business docs?' },
          { label: 'n8n Automations', query: 'What backend and marketing automations can you build for an SMB?' },
          { label: 'Full-Stack Websites', query: 'Can you build a dynamic website from scratch or customize my existing website?' }
        ]
      },
      de: {
        title: 'Gézas KI-Serviceberater',
        subtext: 'Fragen Sie alles zu Gézas 4 Leistungen & Ablauf',
        placeholder: 'Frage zu KI-Chatbots, Automation, Websites...',
        online: 'Online · n8n',
        thinking: 'Prüft Leistungs-Dossier',
        answeredIn: 'Beantwortet in ',
        groundedLive: '✓ Live Mac mini n8n',
        groundedFallback: '✓ Verifiziertes Dossier',
        archBtn: 'Architektur',
        contextBtn: 'Kontext-Dokument',
        contextModalTitle: 'Grounded Context: Géza Leistungs-Dossier (geza-services-context.md)',
        pills: [
          { label: 'KI-Angebotsbots', query: 'Wie berechnen Ihre KI-Chatbots Angebote aus Firmendokumenten?' },
          { label: 'n8n Automatisierung', query: 'Welche Backend- und Marketing-Automatisierungen bauen Sie für KMU?' },
          { label: 'Full-Stack Websites', query: 'Bauen Sie neue dynamische Websites oder passen bestehende Seiten an?' }
        ]
      },
      hu: {
        title: 'Géza AI Szolgáltatási Tanácsadója',
        subtext: 'Kérdezz bátran a 4 szolgáltatásról és a megvalósításról',
        placeholder: 'Kérdezz az AI chatbotokról, automatizációról...',
        online: 'Elérhető · n8n',
        thinking: 'Szolgáltatási dosszié elemzése',
        answeredIn: 'Válaszolva ',
        groundedLive: '✓ Élő Mac mini n8n',
        groundedFallback: '✓ Hitelesített Dosszié',
        archBtn: 'Architektúra',
        contextBtn: 'Kontextus Dokumentum',
        contextModalTitle: 'Hitelesített Kontextus: Géza Szolgáltatási Dosszié (geza-services-context.md)',
        pills: [
          { label: 'AI Árkalkulátor Botok', query: 'Hogyan válaszolnak és számolnak árajánlatot az AI chatbotjaid a céges dokumentumokból?' },
          { label: 'n8n Automatizáció', query: 'Milyen backend és marketing automatizációkat építesz KKV-knak?' },
          { label: 'Full-Stack Weboldalak', query: 'Teljesen új dinamikus weboldalt és meglévő oldal továbbfejlesztést is vállalsz?' }
        ]
      }
    }
  };

  var EXAMPLE_DEMO_BOT_CONFIG = {
    sessionPrefix: 'demo_',
    webhookPath: 'example-demo-chat',
    proxyPath: '/api/example-chat',
    knowledgeBaseUrl: 'knowledge-example-demo.json',
    contextDocUrl: 'n8n/example-business-context.md',
    theme: 'demo',
    i18n: {
      en: {
        title: 'NordicSeal Quote & Service AI',
        subtext: 'Ask service questions or request a live window insulation quote',
        placeholder: 'e.g. Quote for 6 windows, or 30m + 4 sashes...',
        online: 'Live Demo · n8n',
        thinking: 'Calculating from grounded price list',
        answeredIn: 'Calculated in ',
        groundedLive: '✓ Live n8n Quote Engine',
        groundedFallback: '✓ Grounded Price Sheet',
        archBtn: 'Architecture',
        contextBtn: 'Grounded Price Doc',
        contextModalTitle: 'Demo SMB Grounded Context & Price Rules (example-business-context.md)',
        pills: [
          { label: 'Quote for 6 Windows', query: 'Can you calculate an estimated quote for insulating 6 standard single wooden windows in Budapest?' },
          { label: '30m + 5 Sash Adjustments', query: 'How much would 30 linear meters of Swedish groove insulation plus hardware adjustment on 5 sashes cost?' },
          { label: 'Dust, Winter & Warranty', query: 'Is the routing dusty, can it be done in winter, and what warranty do you offer?' }
        ]
      },
      de: {
        title: 'NordicSeal Angebots-KI',
        subtext: 'Stellen Sie Fachfragen oder lassen Sie live ein Angebot berechnen',
        placeholder: 'z. B. Angebot für 6 Fenster oder 30m Dichtung...',
        online: 'Live-Demo · n8n',
        thinking: 'Berechnet anhand der Preisliste',
        answeredIn: 'Berechnet in ',
        groundedLive: '✓ Live n8n Kalkulator',
        groundedFallback: '✓ Verifizierte Preisliste',
        archBtn: 'Architektur',
        contextBtn: 'Preisliste ansehen',
        contextModalTitle: 'Demo-KMU Preisliste & Regeln (example-business-context.md)',
        pills: [
          { label: 'Angebot für 6 Fenster', query: 'Bitte berechne ein Angebot für die Isolierung von 6 Standard-Holzfenstern in Zone A.' },
          { label: '30m + 5 Beschläge', query: 'Was kosten 30 Laufmeter Silikondichtung plus Beschlageinstellung an 5 Flügeln?' },
          { label: 'Winter, Staub & Garantie', query: 'Ist das Einfräsen staubfrei, auch im Winter möglich und welche Garantie gibt es?' }
        ]
      },
      hu: {
        title: 'NordicSeal Árkalkulátor AI',
        subtext: 'Kérdezz a technológiáról vagy kérj azonnali élő árkalkulációt',
        placeholder: 'pl. Mennyibe kerül 6 normál faablak szigetelése Budapesten?',
        online: 'Élő Demó · n8n',
        thinking: 'Számítás a hiteles árlista alapján',
        answeredIn: 'Kiszámolva ',
        groundedLive: '✓ Élő n8n Kalkulátor',
        groundedFallback: '✓ Hitelesített Árlista',
        archBtn: 'Architektúra',
        contextBtn: 'Üzleti Árlista Dokumentum',
        contextModalTitle: 'Demó KKV Tényalapú Árlista és Szabályok (example-business-context.md)',
        pills: [
          { label: 'Árajánlat 6 ablakra', query: 'Kérlek számolj előzetes árajánlatot 6 darab normál egyrétegű faablak szigetelésére Budapesten!' },
          { label: '30 fm + 5 szárny beállítás', query: 'Mennyibe kerül 30 folyóméter svéd bemarásos szigetelés és 5 ablakszárny vasalatbeállítása?' },
          { label: 'Pormentesség, Tél & Garancia', query: 'Mennyi ideig tart a munka, jár-e porral, télen is végezhető, és mennyi a garancia?' }
        ]
      }
    }
  };

  var floatingConciergeChat = null;
  if (window.GezaChatEngine) {
    window.GezaChatEngine.mount('#hero-services-chat', SERVICES_CONCIERGE_CONFIG);
    floatingConciergeChat = window.GezaChatEngine.mount(
      '#floating-services-chat',
      Object.assign({}, SERVICES_CONCIERGE_CONFIG, { contextDocUrl: null })
    );
    window.GezaChatEngine.mount('#example-live-demo-chat', EXAMPLE_DEMO_BOT_CONFIG);
  }

  // =========================================================================
  // 2. Language Application (EN / DE / HU)
  // =========================================================================
  function applyLanguage(lang) {
    if (['en', 'de', 'hu'].indexOf(lang) === -1) return;
    currentLang = lang;
    try {
      localStorage.setItem('geza_services_lang', lang);
    } catch (e) {}

    document.documentElement.lang = lang;
    document.title = t('page_title', lang);

    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('meta_desc', lang));

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var val = t(k, lang);
      if (val) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html');
      var val = t(k, lang);
      if (val) el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var specs = el.getAttribute('data-i18n-attr').split('|');
      specs.forEach(function (sp) {
        var parts = sp.split(':');
        if (parts.length === 2) {
          el.setAttribute(parts[0].trim(), t(parts[1].trim(), lang));
        }
      });
    });

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });

    if (window.GezaChatEngine) {
      window.GezaChatEngine.setLanguage(lang);
    }
  }

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLanguage(btn.getAttribute('data-lang'));
    });
  });

  applyLanguage(currentLang);

  // =========================================================================
  // 3. Scroll Reveal Animations & Sticky Header Elevation
  // =========================================================================
  var headerWrap = document.getElementById('site-header-wrap');
  function updateHeaderOnScroll() {
    if (!headerWrap) return;
    headerWrap.classList.toggle('is-scrolled', window.scrollY > 18);
  }
  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
  updateHeaderOnScroll();

  var revealEls = document.querySelectorAll('.reveal-up');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
            if (delay > 0) {
              setTimeout(function () {
                el.classList.add('is-visible');
              }, delay);
            } else {
              el.classList.add('is-visible');
            }
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // =========================================================================
  // 4. Mobile Menu, Scroll Spy & Service Pre-Selection Links
  // =========================================================================
  var mobileBtn = document.getElementById('mobile-menu-btn');
  var mainNav = document.getElementById('main-nav');
  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      mobileBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var navLinks = document.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (l) {
              l.classList.toggle('active', l.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  var serviceSelect = document.getElementById('c-service');
  document.querySelectorAll('[data-select-service]').forEach(function (link) {
    link.addEventListener('click', function () {
      var targetVal = link.getAttribute('data-select-service');
      if (serviceSelect && targetVal) {
        serviceSelect.value = targetVal;
      }
    });
  });

  // =========================================================================
  // 5. Floating Bottom-Right Services AI Concierge Drawer
  // =========================================================================
  var floatBtn = document.getElementById('floating-concierge-btn');
  var floatDrawer = document.getElementById('floating-concierge-drawer');
  var floatClose = document.getElementById('floating-drawer-close');
  var faqOpenAiBtn = document.getElementById('faq-open-concierge-btn');

  function toggleConciergeDrawer(forceOpen) {
    if (!floatDrawer || !floatBtn) return;
    var willOpen = typeof forceOpen === 'boolean' ? forceOpen : !floatDrawer.classList.contains('is-open');
    floatDrawer.classList.toggle('is-open', willOpen);
    floatBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    if (willOpen && floatingConciergeChat) {
      setTimeout(function () { floatingConciergeChat.focusInput(); }, 80);
    }
  }

  if (floatBtn) floatBtn.addEventListener('click', function () { toggleConciergeDrawer(); });
  if (floatClose) floatClose.addEventListener('click', function () { toggleConciergeDrawer(false); });
  if (faqOpenAiBtn) faqOpenAiBtn.addEventListener('click', function () { toggleConciergeDrawer(true); });

  // =========================================================================
  // 6. FAQ Smooth Collapsible Accordion
  // =========================================================================
  var faqItems = document.querySelectorAll('#faq-accordion .faq-item');
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-question-btn');
    var wrap = item.querySelector('.faq-answer-wrap');
    if (!btn || !wrap) return;

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      faqItems.forEach(function (other) {
        other.classList.remove('is-open');
        var ob = other.querySelector('.faq-question-btn');
        var ow = other.querySelector('.faq-answer-wrap');
        if (ob) ob.setAttribute('aria-expanded', 'false');
        if (ow) ow.style.maxHeight = '0px';
      });

      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        wrap.style.maxHeight = wrap.scrollHeight + 24 + 'px';
      }
    });
  });

  // =========================================================================
  // 7. Copy Email Toast
  // =========================================================================
  var toastEl = document.getElementById('toast-msg');
  var toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('visible');
    }, 2400);
  }

  var copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', function () {
      var msg = t('toast_copied').replace('{label}', 'ghorvath@gmail.com');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('ghorvath@gmail.com').then(function () {
          showToast(msg);
        });
      } else {
        showToast('ghorvath@gmail.com');
      }
    });
  }

  // =========================================================================
  // 8. Contact Me Form -> Mac mini n8n Instant Email Alert
  // =========================================================================
  var contactForm = document.getElementById('services-contact-form');
  if (contactForm) {
    var isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.local') ||
      window.location.hostname.startsWith('192.168.');

    var CONTACT_ENDPOINTS = isLocal
      ? [
          '/api/services-contact',
          'http://Gezas-Mac-mini.local:5678/webhook/services-contact',
          'http://192.168.1.128:5678/webhook/services-contact',
          'http://192.168.1.248:5678/webhook/services-contact',
          'https://gezas-mac-mini.taild096ba.ts.net/webhook/services-contact',
          'http://localhost:5678/webhook/services-contact'
        ]
      : [
          '/api/services-contact',
          'https://gezas-mac-mini.taild096ba.ts.net/webhook/services-contact'
        ];

    var nameInp = document.getElementById('c-name');
    var emailInp = document.getElementById('c-email');
    var compInp = document.getElementById('c-company');
    var phoneInp = document.getElementById('c-phone');
    var msgInp = document.getElementById('c-message');
    var submitBtn = document.getElementById('c-submit-btn');
    var submitLbl = submitBtn ? submitBtn.querySelector('.submit-btn-label') : null;
    var statusBanner = document.getElementById('c-status-banner');

    var errName = document.getElementById('err-c-name');
    var errEmail = document.getElementById('err-c-email');
    var errMsg = document.getElementById('err-c-message');

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function postSequential(payload, list, idx) {
      if (idx >= list.length) {
        return Promise.reject(new Error('All contact endpoints unreachable'));
      }
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 15000);

      return fetch(list[idx], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: ctrl.signal
      })
        .then(function (res) {
          clearTimeout(timer);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .catch(function () {
          clearTimeout(timer);
          return postSequential(payload, list, idx + 1);
        });
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      [nameInp, emailInp, msgInp].forEach(function (i) { if (i) i.classList.remove('is-invalid'); });
      [errName, errEmail, errMsg].forEach(function (el) {
        if (el) {
          el.textContent = '';
          el.classList.remove('visible');
        }
      });
      if (statusBanner) {
        statusBanner.className = 'contact-status-banner';
        statusBanner.innerHTML = '';
      }

      var nameVal = (nameInp.value || '').trim();
      var emailVal = (emailInp.value || '').trim();
      var msgVal = (msgInp.value || '').trim();
      var bad = false;

      if (!nameVal) {
        nameInp.classList.add('is-invalid');
        errName.textContent = t('err_name');
        errName.classList.add('visible');
        bad = true;
      }
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        emailInp.classList.add('is-invalid');
        errEmail.textContent = t('err_email');
        errEmail.classList.add('visible');
        bad = true;
      }
      if (!msgVal || msgVal.length < 5) {
        msgInp.classList.add('is-invalid');
        errMsg.textContent = t('err_message');
        errMsg.classList.add('visible');
        bad = true;
      }
      if (bad) return;

      var payload = {
        name: nameVal,
        email: emailVal,
        company: (compInp.value || '').trim(),
        phone: (phoneInp.value || '').trim(),
        serviceInterest: serviceSelect ? serviceSelect.value : 'General Inquiry',
        message: msgVal,
        language: currentLang,
        source: window.location.href,
        timestamp: new Date().toISOString()
      };

      submitBtn.disabled = true;
      if (submitLbl) submitLbl.textContent = t('form_submitting');

      postSequential(payload, CONTACT_ENDPOINTS, 0)
        .then(function (data) {
          submitBtn.disabled = false;
          if (submitLbl) submitLbl.textContent = t('form_submit_btn');
          contactForm.reset();

          var ref = data && data.submissionId ? ' (Ref: ' + escapeHtml(data.submissionId) + ')' : '';
          statusBanner.className = 'contact-status-banner success';
          statusBanner.innerHTML = '✓ <strong>' + escapeHtml(payload.name) + '</strong> — ' + escapeHtml(t('status_ok')) + ref;
        })
        .catch(function () {
          submitBtn.disabled = false;
          if (submitLbl) submitLbl.textContent = t('form_submit_btn');
          var subj = encodeURIComponent('Project Inquiry: ' + payload.serviceInterest + ' — ' + payload.name);
          var body = encodeURIComponent(
            'Hi Géza,\n\n' +
              payload.message +
              '\n\n---\nName: ' + payload.name +
              '\nBusiness: ' + payload.company +
              '\nEmail: ' + payload.email +
              '\nPhone: ' + payload.phone
          );
          statusBanner.className = 'contact-status-banner error';
          statusBanner.innerHTML =
            '<div>' + escapeHtml(t('status_err')) + '</div>' +
            '<div style="margin-top:10px;"><a class="btn btn-primary btn-sm" href="mailto:ghorvath@gmail.com?subject=' +
            subj +
            '&body=' +
            body +
            '">Open Pre-Filled Email →</a></div>';
        });
    });
  }
});
