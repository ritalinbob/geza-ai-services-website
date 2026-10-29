# Mac mini n8n Workflows & Grounded Context Docs

This folder contains the n8n workflows and grounded Markdown knowledge bases running on `macmini` (`Gezas-Mac-mini.local:5678`) for **`geza-ai-services-website`**.

All resources are isolated inside `~/services-ai/` and `~/.n8n-files/` on the Mac mini so they coexist cleanly alongside `geza-cv-website` (`~/resume-ai/`) and `ablakszigeteles.hu`.

## Workflows & Endpoints

| Workflow File | n8n Webhook Path | Purpose |
|---|---|---|
| `services-chat-workflow.json` | `POST /webhook/services-chat` | **Site-wide Services AI Concierge** — answers visitor questions about Géza and his 4 developer services using `geza-services-context.md`. |
| `example-demo-chat-workflow.json` | `POST /webhook/example-demo-chat` | **Examples Section Live SMB Demo Chatbot** — demonstrates grounded Q&A and step-by-step quote calculations using `example-business-context.md`. |
| `services-contact-workflow.json` | `POST /webhook/services-contact` | **Contact Form Alert Pipeline** — stores inquiries in `~/services-ai/contacts.sqlite` + `contacts.jsonl` and sends an instant HTML email alert via SMTP to `ghorvath@gmail.com`. |

## Updating Grounded Context Docs

1. Edit `n8n/geza-services-context.md` (your personal services & pricing philosophy) or `n8n/example-business-context.md` (the demo business pricing/quote sheet).
2. Run:
   ```bash
   ./n8n/deploy-macmini.sh
   ```
   Because n8n reads `~/.n8n-files/*.md` dynamically on every incoming question, updates take effect immediately.
