# Géza.ai — Web, Automation & AI Developer Services Website

Personal developer & AI studio website offering pragmatic digital transformation services for Small & Medium Businesses (SMBs) and organizations of any size:

1. **Intelligent Grounded AI Chatbots & Quote Calculators** — built and embedded into existing or new websites, answering customer questions and calculating estimates/quotes strictly from verified business documentation.
2. **Business Intelligence, Backend & Marketing Automations** — end-to-end operational and marketing workflows powered by n8n, REST APIs, webhooks, and databases.
3. **Full-Stack Dynamic Websites & Customizations** — dynamic websites built from scratch (databases, forms, email acknowledgements, campaigns, workflows) or targeted upgrades to existing websites.
4. **Personal AI Assistants** — private AI assistants designed to improve business productivity and personal work-life balance.

## Design & Color Scheme

- **Layout & Visual Inspiration:** [eddie.eco](https://eddie.eco) (super-rounded bento cards, pill navigation & badges, neo-grotesque typography, smooth collapsible FAQ accordions, and modular conversion sections).
- **ColorHunt Palette:** [`#A4B885` · `#D46D25` · `#FDC086` · `#FFF6A1`](https://colorhunt.co/palette/a4b885d46d25fdc086fff6a1)

## Live Architecture (Dual n8n Chatbots + Automated Email Alerts)

This prototype connects to **three dedicated n8n workflows** hosted on `macmini` (`Gezas-Mac-mini.local:5678`, isolated in `~/services-ai/` and `~/.n8n-files/`):

1. **Géza's Site-Wide Services AI Concierge** (`POST /webhook/services-chat`, proxied via `/api/services-chat`)
   - Mounted in the Hero card **and** in the floating bottom-right `"Ask Géza's AI"` drawer.
   - Grounded strictly in `n8n/geza-services-context.md`.
2. **Examples Section Live SMB Demo Chatbot** (`POST /webhook/example-demo-chat`, proxied via `/api/example-chat`)
   - Separate embedded demo chatbot inside the `#examples` section alongside the live production showcase [`www.ablakszigeteles.hu`](https://www.ablakszigeteles.hu).
   - Grounded strictly in `n8n/example-business-context.md` to demonstrate real-time quote calculations (per-meter rates, window perimeter defaults, >25m 10% volume discount).
3. **Contact Form Email Alert Pipeline** (`POST /webhook/services-contact`, proxied via `/api/services-contact`)
   - Persists inquiries to `~/services-ai/contacts.sqlite` & `contacts.jsonl` on `macmini` and sends an instant HTML email alert via SMTP to `ghorvath@gmail.com`.

## Running Locally

```bash
chmod +x server.py
python3 server.py
```

Then open **http://localhost:3040** in your browser.

## Updating Text, Context Docs & Deploying

- **Website Copy & FAQs (EN / DE / HU):** Edit `translations.js` (and/or `index.html`).
- **Sync Grounded AI Context Docs & Workflows to Mac mini:**
  ```bash
  ./n8n/deploy-macmini.sh
  ```
- **Deploy to Static VPS (when ready for production):**
  ```bash
  ./deploy-vps.sh
  ```
