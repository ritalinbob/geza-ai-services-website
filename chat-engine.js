/**
 * GezaChatEngine — Multi-Instance Grounded AI Chatbot Engine
 * Supports multiple independent n8n-backed chatbots on the same page:
 *  1) Géza's Services AI Concierge (/webhook/services-chat)
 *  2) Examples Section Live SMB Quote & FAQ Demo Bot (/webhook/example-demo-chat)
 */

(function () {
  'use strict';

  var isLocalEnv =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local') ||
    window.location.hostname.startsWith('192.168.');

  var instances = [];
  var currentLang = 'en';

  try {
    var saved = localStorage.getItem('geza_services_lang');
    if (saved && ['en', 'de', 'hu'].indexOf(saved) !== -1) {
      currentLang = saved;
    }
  } catch (e) {}

  var ARCH_MODAL_I18N = {
    en: {
      badge1: 'n8n + Local AI Architecture',
      badge2: '🔒 Grounded & Anti-Hallucination',
      heading: 'How This Live Grounded AI Chatbot Works',
      subheading: 'The exact architecture Géza builds & embeds into client websites',
      steps: [
        {
          num: 'STEP 01 · WEBSITE',
          title: 'Customer Asks a Question or Quote',
          desc: 'A visitor types a natural question or quote request into the embedded widget on your new or existing website.'
        },
        {
          num: 'STEP 02 · N8N WORKFLOW',
          title: 'Routed to Automated n8n Pipeline',
          desc: 'The inquiry hits an n8n webhook (running here live on Géza\'s Mac mini M4 server) which sanitizes input and detects language (EN/DE/HU).'
        },
        {
          num: 'STEP 03 · GROUNDING CORE',
          title: 'Reads Verified Business Context Docs',
          desc: 'n8n injects your verified price sheets, service rules & FAQs into an LLM (Ollama local or cloud API) locked against hallucination.',
          core: true
        },
        {
          num: 'STEP 04 · INSTANT DELIVERY',
          title: 'Answer or Quote Returned Live',
          desc: 'The calculated quote or factual answer streams back to the visitor\'s browser in seconds—and can trigger CRM or email lead alerts.'
        }
      ],
      takeaways: [
        {
          title: '🎯 Strictly Grounded in Your Docs',
          desc: 'The AI only uses your real pricing tables, formulas, and policies—never inventing discounts or nonexistent services.'
        },
        {
          title: '🔒 Private Local or Cloud AI',
          desc: 'Run 100% privately on dedicated hardware (zero third-party data sharing) or connect to fast cloud models.'
        },
        {
          title: '🔌 Drops Into Existing Websites',
          desc: 'Embeds cleanly into WordPress, Shopify, static sites, or custom full-stack web apps with a lightweight snippet.'
        }
      ],
      hint: 'Press Esc to close',
      done: 'Got it, close'
    },
    de: {
      badge1: 'n8n + KI-Architektur',
      badge2: '🔒 Faktenbasiert & Ohne Halluzinationen',
      heading: 'Wie dieser Live-KI-Chatbot funktioniert',
      subheading: 'Genau diese Architektur integriert Géza in Kunden-Websites',
      steps: [
        {
          num: 'SCHRITT 01 · WEBSITE',
          title: 'Kunde stellt Frage oder Preisanfrage',
          desc: 'Ein Besucher tippt eine Frage oder Kalkulationsanfrage direkt in das eingebettete Chat-Widget Ihrer Website.'
        },
        {
          num: 'SCHRITT 02 · N8N WORKFLOW',
          title: 'Sichere Übergabe an n8n-Pipeline',
          desc: 'Die Anfrage erreicht einen n8n-Webhook (hier live auf Gézas Mac mini M4), der Sprache und Parameter erkennt.'
        },
        {
          num: 'SCHRITT 03 · WISSENSBASIS',
          title: 'Abgleich mit Firmendokumenten',
          desc: 'n8n lädt Ihre verifizierten Preislisten und Leistungsdaten in das Sprachmodell — strikt ohne Halluzinationen.',
          core: true
        },
        {
          num: 'SCHRITT 04 · ANTWORT',
          title: 'Sofortige Antwort & Vorab-Angebot',
          desc: 'Die berechnete Kostenschätzung oder Fachantwort erscheint in Sekunden direkt im Chatfenster.'
        }
      ],
      takeaways: [
        {
          title: '🎯 Strikt an Ihre Preise gebunden',
          desc: 'Das Modell rechnet ausschließlich mit Ihren hinterlegten Preisen, Formeln und Geschäftsregeln.'
        },
        {
          title: '🔒 Privat gehostet oder Cloud',
          desc: 'Auf Wunsch 100 % lokal auf eigener Hardware (DSGVO-stark) oder über schnelle Cloud-KI-Schnittstellen.'
        },
        {
          title: '🔌 Für bestehende & neue Websites',
          desc: 'Lässt sich ohne Neubau in bestehende Websites ebenso wie in neue Full-Stack-Plattformen einbetten.'
        }
      ],
      hint: 'Esc zum Schließen',
      done: 'Schließen'
    },
    hu: {
      badge1: 'n8n + AI Architektúra',
      badge2: '🔒 Tényalapú & Hallucináció-mentes',
      heading: 'Hogyan működik ez az élő AI Chatbot?',
      subheading: 'Pontosan ezt az architektúrát építi be Géza az ügyfelek weboldalaiba',
      steps: [
        {
          num: '01. LÉPÉS · WEBOLDAL',
          title: 'Az érdeklődő kérdez vagy árat számoltat',
          desc: 'A látogató természetes nyelven kérdez vagy előzetes árajánlatot kér a weboldalba épített felületen.'
        },
        {
          num: '02. LÉPÉS · N8N FOLYAMAT',
          title: 'Automatizált n8n munkafolyamat',
          desc: 'A kérés befut az n8n webhookra (itt élőben Géza Mac mini M4 szerverére), amely ellenőrzi a bemenetet és a nyelvet.'
        },
        {
          num: '03. LÉPÉS · TUDÁSBÁZIS',
          title: 'Hiteles üzleti dokumentáció beolvasása',
          desc: 'Az n8n betölti a vállalkozás valódi árlistáját és szabályait az AI modellbe, kizárva a hallucinációkat.',
          core: true
        },
        {
          num: '04. LÉPÉS · AZONNALI VÁLASZ',
          title: 'Élő válasz és pontos árkalkuláció',
          desc: 'A kiszámolt árajánlat vagy válasz másodpercek alatt megjelenik a böngészőben, igény szerint lead-riasztással.'
        }
      ],
      takeaways: [
        {
          title: '🎯 Szigorúan a saját dokumentumaidból',
          desc: 'Az AI kizárólag a megadott árlistákból és szabályokból dolgozik — soha nem talál ki fiktív árakat.'
        },
        {
          title: '🔒 Privát helyi vagy felhős AI',
          desc: 'Futtatható 100%-ban saját hardveren (nulla külső adatszivárgás) vagy modern felhős API-kon keresztül.'
        },
        {
          title: '🔌 Meglévő weboldalba is beépíthető',
          desc: 'Újraépítés nélkül, könnyedén integrálható meglévő weboldalakba vagy új full-stack rendszerekbe.'
        }
      ],
      hint: 'Esc a bezáráshoz',
      done: 'Bezárás'
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cleanLatexAndFormatMarkdown(rawText) {
    if (!rawText) return '';
    // Clean common LaTeX math sequences emitted by Qwen/Llama models into readable Unicode
    var cleaned = String(rawText)
      .replace(/\\\[\s*/g, '')
      .replace(/\s*\\\]/g, '')
      .replace(/\\\(\s*/g, '')
      .replace(/\s*\\\)/g, '')
      .replace(/\\text\{([^}]*)\}/g, '$1')
      .replace(/\\textbf\{([^}]*)\}/g, '**$1**')
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\div/g, '÷')
      .replace(/\\approx/g, '≈')
      .replace(/\\,/g, ' ');

    var escaped = escapeHtml(cleaned);
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
    escaped = escaped.replace(
      /\[(.*?)\]\(((?:https?:\/\/|mailto:).*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    var lines = escaped.split('\n');
    var listType = null; // 'ul' | 'ol'
    var html = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      var ulMatch = line.match(/^[-*]\s+(.*)$/);
      var olMatch = line.match(/^\d+\.\s+(.*)$/);

      if (ulMatch) {
        if (listType !== 'ul') {
          if (listType) html.push('</' + listType + '>');
          html.push('<ul>');
          listType = 'ul';
        }
        html.push('<li>' + ulMatch[1] + '</li>');
      } else if (olMatch) {
        if (listType !== 'ol') {
          if (listType) html.push('</' + listType + '>');
          html.push('<ol>');
          listType = 'ol';
        }
        html.push('<li>' + olMatch[1] + '</li>');
      } else {
        if (listType) {
          html.push('</' + listType + '>');
          listType = null;
        }
        if (line.length > 0) {
          html.push('<p>' + line + '</p>');
        }
      }
    }
    if (listType) html.push('</' + listType + '>');
    return html.join('');
  }

  function buildEndpoints(webhookPath, proxyPath) {
    if (isLocalEnv) {
      return [
        proxyPath,
        'http://Gezas-Mac-mini.local:5678/webhook/' + webhookPath,
        'http://192.168.1.128:5678/webhook/' + webhookPath,
        'http://192.168.1.248:5678/webhook/' + webhookPath,
        'https://gezas-mac-mini.taild096ba.ts.net/webhook/' + webhookPath,
        'http://localhost:5678/webhook/' + webhookPath
      ];
    }
    return [
      proxyPath,
      'https://gezas-mac-mini.taild096ba.ts.net/webhook/' + webhookPath
    ];
  }

  function openArchModal() {
    var modal = document.getElementById('geza-ai-arch-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'geza-ai-arch-modal';
      modal.className = 'ai-modal-backdrop';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      document.body.appendChild(modal);

      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal(modal);
      });
    }

    var m = ARCH_MODAL_I18N[currentLang] || ARCH_MODAL_I18N.en;
    var stepsHtml = m.steps
      .map(function (s) {
        return (
          '<div class="ai-flow-card' + (s.core ? ' core' : '') + '">' +
            '<span class="ai-flow-step-num">' + escapeHtml(s.num) + '</span>' +
            '<h4>' + escapeHtml(s.title) + '</h4>' +
            '<p>' + escapeHtml(s.desc) + '</p>' +
          '</div>'
        );
      })
      .join('');

    var takeawaysHtml = m.takeaways
      .map(function (tk) {
        return (
          '<div class="ai-takeaway-box">' +
            '<h5>' + escapeHtml(tk.title) + '</h5>' +
            '<p>' + escapeHtml(tk.desc) + '</p>' +
          '</div>'
        );
      })
      .join('');

    modal.innerHTML =
      '<div class="ai-modal-dialog">' +
        '<div class="ai-modal-head">' +
          '<div>' +
            '<div class="ai-modal-badges">' +
              '<span class="ai-modal-pill">' + escapeHtml(m.badge1) + '</span>' +
              '<span class="ai-modal-pill accent">' + escapeHtml(m.badge2) + '</span>' +
            '</div>' +
            '<h3 class="ai-modal-title">' + escapeHtml(m.heading) + '</h3>' +
            '<p class="ai-modal-sub">' + escapeHtml(m.subheading) + '</p>' +
          '</div>' +
          '<button type="button" class="ai-modal-x" aria-label="Close">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="ai-modal-body">' +
          '<div class="ai-flow-grid">' + stepsHtml + '</div>' +
          '<div class="ai-takeaways-row">' + takeawaysHtml + '</div>' +
        '</div>' +
        '<div class="ai-modal-foot">' +
          '<span style="font-size:0.78rem;color:#525B4C;">' + escapeHtml(m.hint) + '</span>' +
          '<button type="button" class="ai-modal-done-btn">' + escapeHtml(m.done) + '</button>' +
        '</div>' +
      '</div>';

    modal.querySelector('.ai-modal-x').addEventListener('click', function () { closeModal(modal); });
    modal.querySelector('.ai-modal-done-btn').addEventListener('click', function () { closeModal(modal); });
    modal.classList.add('is-open');
  }

  function openContextDocModal(docUrl, titleText) {
    var modal = document.getElementById('geza-ai-context-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'geza-ai-context-modal';
      modal.className = 'ai-modal-backdrop';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      document.body.appendChild(modal);

      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal(modal);
      });
    }

    modal.innerHTML =
      '<div class="ai-modal-dialog">' +
        '<div class="ai-modal-head">' +
          '<div>' +
            '<div class="ai-modal-badges">' +
              '<span class="ai-modal-pill accent">📄 Grounded Source of Truth</span>' +
              '<span class="ai-modal-pill">Mac mini n8n Context File</span>' +
            '</div>' +
            '<h3 class="ai-modal-title">' + escapeHtml(titleText || 'Grounded Business Context Document') + '</h3>' +
            '<p class="ai-modal-sub">The live n8n + LLM pipeline reads strictly from this Markdown file to answer questions & calculate quotes.</p>' +
          '</div>' +
          '<button type="button" class="ai-modal-x" aria-label="Close">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="ai-modal-body">' +
          '<pre class="ai-context-pre" id="ai-context-doc-pre">Loading grounded context document...</pre>' +
        '</div>' +
        '<div class="ai-modal-foot">' +
          '<span style="font-size:0.78rem;color:#525B4C;">Zero hallucination — facts & formulas come straight from this file</span>' +
          '<button type="button" class="ai-modal-done-btn">Close Preview</button>' +
        '</div>' +
      '</div>';

    modal.querySelector('.ai-modal-x').addEventListener('click', function () { closeModal(modal); });
    modal.querySelector('.ai-modal-done-btn').addEventListener('click', function () { closeModal(modal); });
    modal.classList.add('is-open');

    fetch(docUrl)
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        var pre = modal.querySelector('#ai-context-doc-pre');
        if (pre) pre.textContent = txt;
      })
      .catch(function () {
        var pre = modal.querySelector('#ai-context-doc-pre');
        if (pre) pre.textContent = 'Could not load context preview file.';
      });
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('is-open');
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal(document.getElementById('geza-ai-arch-modal'));
      closeModal(document.getElementById('geza-ai-context-modal'));
    }
  });

  function mount(target, config) {
    var container = typeof target === 'string' ? document.querySelector(target) : target;
    if (!container) return null;

    var sessionId = (config.sessionPrefix || 'chat_') + Math.random().toString(36).substring(2, 10);
    var endpoints = buildEndpoints(config.webhookPath, config.proxyPath);
    var activeEndpoint = endpoints[0];
    var kbData = null;

    if (config.knowledgeBaseUrl) {
      fetch(config.knowledgeBaseUrl)
        .then(function (r) { return r.json(); })
        .then(function (d) { kbData = d; })
        .catch(function () {});
    }

    function getStrings() {
      return (config.i18n && (config.i18n[currentLang] || config.i18n.en)) || {};
    }

    function computeFallback(question) {
      var q = question.toLowerCase();
      var langBlock = kbData && (kbData[currentLang] || kbData.en);
      if (langBlock && Array.isArray(langBlock.faqs)) {
        for (var i = 0; i < langBlock.faqs.length; i++) {
          var item = langBlock.faqs[i];
          var matched = (item.keywords || []).some(function (kw) {
            return q.indexOf(kw.toLowerCase()) !== -1;
          });
          if (matched) return item.answer;
        }
      }
      if (langBlock && langBlock.fallback_general) {
        return langBlock.fallback_general;
      }
      return 'Please reach out to Géza directly via the Contact Me form or at [ghorvath@gmail.com](mailto:ghorvath@gmail.com).';
    }

    function querySequential(question, list, idx) {
      if (idx >= list.length) {
        return Promise.reject(new Error('All endpoints unreachable'));
      }
      var url = list[idx];
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 38000);

      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          question: question,
          language: currentLang,
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        }),
        signal: ctrl.signal
      })
        .then(function (res) {
          clearTimeout(timer);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          activeEndpoint = url;
          return data;
        })
        .catch(function () {
          clearTimeout(timer);
          return querySequential(question, list, idx + 1);
        });
    }

    function renderShell() {
      var t = getStrings();
      var themeClass = config.theme === 'demo' ? ' theme-demo' : '';
      var contextBtnHtml = config.contextDocUrl
        ? '<button type="button" class="ai-meta-link-btn" data-action="view-context">' +
            '<span>📄</span><span class="ai-ctx-btn-label">' + escapeHtml(t.contextBtn || 'View Grounded Business Docs') + '</span>' +
          '</button>'
        : '';

      container.innerHTML =
        '<div class="ai-widget-shell' + themeClass + '">' +
          '<div class="ai-widget-header">' +
            '<div class="ai-widget-titles">' +
              '<h3 class="ai-widget-title">' +
                '<span class="ai-sparkle-badge">' +
                  '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"/></svg>' +
                '</span>' +
                '<span class="ai-title-label">' + escapeHtml(t.title) + '</span>' +
              '</h3>' +
              '<p class="ai-widget-subtext">' + escapeHtml(t.subtext) + '</p>' +
            '</div>' +
            '<div class="ai-live-pill">' +
              '<span class="ai-live-dot"></span>' +
              '<span class="ai-online-label">' + escapeHtml(t.online || 'Online · n8n') + '</span>' +
            '</div>' +
          '</div>' +
          '<form class="ai-chat-form">' +
            '<input type="text" class="ai-chat-input" maxlength="280" autocomplete="off" placeholder="' + escapeHtml(t.placeholder) + '" />' +
            '<button type="submit" class="ai-chat-send" aria-label="Send question">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
            '</button>' +
          '</form>' +
          '<div class="ai-pills-row"></div>' +
          '<div class="ai-response-stage" aria-live="polite"></div>' +
          '<div class="ai-widget-actions">' +
            '<button type="button" class="ai-meta-link-btn" data-action="view-arch">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="6" height="6" rx="1.5"/><rect x="16" y="3" width="6" height="6" rx="1.5"/><rect x="9" y="15" width="6" height="6" rx="1.5"/><path d="M5 9v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"/><path d="M12 14v1"/></svg>' +
              '<span class="ai-arch-label">' + escapeHtml(t.archBtn || 'How this AI works · Architecture') + '</span>' +
            '</button>' +
            contextBtnHtml +
          '</div>' +
        '</div>';

      var form = container.querySelector('.ai-chat-form');
      var input = container.querySelector('.ai-chat-input');
      var sendBtn = container.querySelector('.ai-chat-send');
      var pillsRow = container.querySelector('.ai-pills-row');
      var stage = container.querySelector('.ai-response-stage');
      var archBtn = container.querySelector('[data-action="view-arch"]');
      var ctxBtn = container.querySelector('[data-action="view-context"]');

      if (archBtn) {
        archBtn.addEventListener('click', openArchModal);
      }
      if (ctxBtn) {
        ctxBtn.addEventListener('click', function () {
          openContextDocModal(config.contextDocUrl, getStrings().contextModalTitle);
        });
      }

      function populatePills() {
        var st = getStrings();
        pillsRow.innerHTML = '';
        (st.pills || []).forEach(function (pill) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'ai-query-pill';
          b.textContent = pill.label;
          b.addEventListener('click', function () {
            input.value = pill.query;
            submitQuestion(pill.query);
          });
          pillsRow.appendChild(b);
        });
      }

      function showThinking() {
        var st = getStrings();
        stage.className = 'ai-response-stage active';
        stage.innerHTML =
          '<div class="ai-orb-card">' +
            '<div class="ai-orb-box">' +
              '<div class="ai-orb-aura"></div>' +
              '<div class="ai-orb-sphere"></div>' +
            '</div>' +
            '<div class="ai-thinking-caption">' +
              '<span>' + escapeHtml(st.thinking || 'Thinking') + '</span>' +
              '<span class="ai-dots"><span></span><span></span><span></span></span>' +
            '</div>' +
          '</div>';
      }

      function showAnswer(qText, ansMarkdown, secStr, isLiveN8n) {
        var st = getStrings();
        stage.className = 'ai-response-stage active';
        var sourceLabel = isLiveN8n
          ? (st.groundedLive || '✓ Live Mac mini n8n + Ollama')
          : (st.groundedFallback || '✓ Grounded Dossier');
        var timeLabel = (st.answeredIn || '⚡ Answered in ') + secStr + 's';

        stage.innerHTML =
          '<div class="ai-answer-card">' +
            '<div class="ai-answer-top">' +
              '<span class="ai-asked-tag" title="' + escapeHtml(qText) + '">Q: ' + escapeHtml(qText) + '</span>' +
              '<button type="button" class="ai-close-bubble" aria-label="Close">' +
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
              '</button>' +
            '</div>' +
            '<div class="ai-answer-content">' + cleanLatexAndFormatMarkdown(ansMarkdown) + '</div>' +
            '<div class="ai-answer-meta">' +
              '<span>' + escapeHtml(timeLabel) + '</span>' +
              '<span class="ai-grounded-chip">' + escapeHtml(sourceLabel) + '</span>' +
            '</div>' +
          '</div>';

        var closeBtn = stage.querySelector('.ai-close-bubble');
        if (closeBtn) {
          closeBtn.addEventListener('click', function () {
            stage.className = 'ai-response-stage';
            stage.innerHTML = '';
          });
        }
      }

      function submitQuestion(explicitQ) {
        var q = (explicitQ || input.value || '').trim();
        if (!q) return;

        sendBtn.disabled = true;
        showThinking();

        var t0 = Date.now();
        var ordered = [activeEndpoint];
        endpoints.forEach(function (ep) {
          if (ordered.indexOf(ep) === -1) ordered.push(ep);
        });

        querySequential(q, ordered, 0)
          .then(function (data) {
            sendBtn.disabled = false;
            var elapsed = ((Date.now() - t0) / 1000).toFixed(1);
            var ans = data.answer || data.response || data.text || computeFallback(q);
            showAnswer(q, ans, elapsed, true);
          })
          .catch(function () {
            sendBtn.disabled = false;
            var fb = computeFallback(q);
            showAnswer(q, fb, '0.1', false);
          });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        submitQuestion();
      });

      populatePills();

      return {
        ask: function (questionText) {
          input.value = questionText;
          submitQuestion(questionText);
        },
        focusInput: function () {
          input.focus();
        },
        refreshLanguage: function () {
          var st = getStrings();
          var tl = container.querySelector('.ai-title-label');
          var sl = container.querySelector('.ai-widget-subtext');
          var ol = container.querySelector('.ai-online-label');
          var al = container.querySelector('.ai-arch-label');
          var cl = container.querySelector('.ai-ctx-btn-label');
          if (tl) tl.textContent = st.title;
          if (sl) sl.textContent = st.subtext;
          if (ol) ol.textContent = st.online || 'Online · n8n';
          if (input) input.setAttribute('placeholder', st.placeholder);
          if (al) al.textContent = st.archBtn || 'How this AI works · Architecture';
          if (cl && st.contextBtn) cl.textContent = st.contextBtn;
          populatePills();
        }
      };
    }

    var api = renderShell();
    instances.push(api);
    return api;
  }

  window.GezaChatEngine = {
    mount: mount,
    openArchitecture: openArchModal,
    openContextDoc: openContextDocModal,
    setLanguage: function (lang) {
      if (['en', 'de', 'hu'].indexOf(lang) !== -1) {
        currentLang = lang;
        instances.forEach(function (inst) {
          inst.refreshLanguage();
        });
      }
    },
    getLanguage: function () {
      return currentLang;
    }
  };
})();
