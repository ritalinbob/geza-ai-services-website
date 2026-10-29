#!/usr/bin/env bash
# ==============================================================================
# Deploy Geza AI Services Chatbots & Contact Alert Workflows to Mac mini M4
# Target: ssh macmini (gezahorvath@Gezas-Mac-mini.local:~/services-ai/)
# Safely coexists alongside ~/resume-ai/ and ablakszigeteles workflows!
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSH_TARGET="${SSH_TARGET:-macmini}"
DEST_DIR="~/services-ai"

echo "--------------------------------------------------------"
echo "📡 Deploying Geza AI Services Workflows to ${SSH_TARGET}..."
echo "--------------------------------------------------------"

# 1. Create remote directories
ssh "${SSH_TARGET}" "mkdir -p ${DEST_DIR} ~/.n8n-files"

# 2. Transfer workflows, grounded context markdown docs, and persistence script
scp "${SCRIPT_DIR}/services-chat-workflow.json" \
    "${SCRIPT_DIR}/example-demo-chat-workflow.json" \
    "${SCRIPT_DIR}/services-contact-workflow.json" \
    "${SCRIPT_DIR}/geza-services-context.md" \
    "${SCRIPT_DIR}/example-business-context.md" \
    "${SCRIPT_DIR}/save_service_contact.js" \
    "${SSH_TARGET}:${DEST_DIR}/"

# 3. Copy grounded context files into ~/.n8n-files/, import & activate workflows
ssh "${SSH_TARGET}" 'bash -s' << 'EOF'
  set -e
  cp ~/services-ai/geza-services-context.md ~/.n8n-files/
  cp ~/services-ai/example-business-context.md ~/.n8n-files/
  chmod +x ~/services-ai/save_service_contact.js

  # Initialize SQLite table for service inquiries
  sqlite3 ~/services-ai/contacts.sqlite 'CREATE TABLE IF NOT EXISTS service_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    service_interest TEXT,
    phone TEXT,
    message TEXT NOT NULL,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );'

  NODE_BIN="/usr/local/bin/node"
  N8N_BIN="/usr/local/bin/n8n"

  activate_workflow() {
    local wf_file="$1"
    local wf_name="$2"
    local webhook_path="$3"

    $NODE_BIN $N8N_BIN import:workflow --input="$wf_file" 2>/dev/null || true

    local wf_id
    wf_id=$(sqlite3 ~/.n8n/database.sqlite "SELECT id FROM workflow_entity WHERE name = '$wf_name' ORDER BY updatedAt DESC LIMIT 1;")

    if [ -n "$wf_id" ]; then
      echo "✅ Activating [$wf_name] (ID: $wf_id) -> /webhook/$webhook_path"
      sqlite3 ~/.n8n/database.sqlite "UPDATE workflow_entity SET active = 0 WHERE name = '$wf_name' AND id != '$wf_id';"
      sqlite3 ~/.n8n/database.sqlite "UPDATE workflow_entity SET active = 1 WHERE id = '$wf_id';"
      $NODE_BIN $N8N_BIN publish:workflow --id="$wf_id" 2>/dev/null || true
      sqlite3 ~/.n8n/database.sqlite "DELETE FROM webhook_entity WHERE webhookPath = '$webhook_path';"
      sqlite3 ~/.n8n/database.sqlite "INSERT OR REPLACE INTO webhook_entity (workflowId, webhookPath, method, node, webhookId, pathLength) VALUES ('$wf_id', '$webhook_path', 'POST', 'Webhook Trigger', '', 1);"
    else
      echo "⚠️ Could not locate imported workflow: $wf_name"
    fi
  }

  activate_workflow "/Users/gezahorvath/services-ai/services-chat-workflow.json" \
                    "AI Services Concierge (Geza Web Services)" \
                    "services-chat"

  activate_workflow "/Users/gezahorvath/services-ai/example-demo-chat-workflow.json" \
                    "AI Example Demo Chatbot (Geza Web Services)" \
                    "example-demo-chat"

  activate_workflow "/Users/gezahorvath/services-ai/services-contact-workflow.json" \
                    "Services Website Contact Alert (Geza Web Services)" \
                    "services-contact"

  export PATH=/usr/local/bin:/opt/homebrew/bin:$PATH
  pm2 restart n8n-server --update-env
  pm2 save
EOF

echo "--------------------------------------------------------"
echo "✅ All 3 Geza AI Services workflows deployed & active on ${SSH_TARGET}!"
echo "Live Webhook Endpoints:"
echo " - Services Concierge AI: http://Gezas-Mac-mini.local:5678/webhook/services-chat"
echo " - Examples Demo AI Bot:  http://Gezas-Mac-mini.local:5678/webhook/example-demo-chat"
echo " - Contact Form Alert:    http://Gezas-Mac-mini.local:5678/webhook/services-contact"
echo "--------------------------------------------------------"
