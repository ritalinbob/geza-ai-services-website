#!/usr/bin/env bash
# ==============================================================================
# Deploy Geza AI Services Website to Static VPS (217.144.53.66)
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_USER="${SERVER_USER:-hambrus}"
SERVER_HOST="${SERVER_HOST:-217.144.53.66}"
DEST_DIR="/home/${SERVER_USER}/geza-ai-services-website"
PORT="${PORT:-3040}"

echo "--------------------------------------------------------"
echo "🚀 Deploying geza-ai-services-website to ${SERVER_USER}@${SERVER_HOST}:${DEST_DIR}..."
echo "--------------------------------------------------------"

ssh "${SERVER_USER}@${SERVER_HOST}" "mkdir -p ${DEST_DIR}"

rsync -avz --delete \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude '*.sqlite' \
  --exclude '*.jsonl' \
  "${SCRIPT_DIR}/" \
  "${SERVER_USER}@${SERVER_HOST}:${DEST_DIR}/"

ssh "${SERVER_USER}@${SERVER_HOST}" "chmod +x ${DEST_DIR}/server.py"

ssh "${SERVER_USER}@${SERVER_HOST}" "PORT=${PORT} bash -s" << 'EOF'
  set -e
  export PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:$PATH

  if pm2 describe geza-ai-services > /dev/null 2>&1; then
    echo "🔄 Restarting geza-ai-services PM2 process..."
    pm2 restart geza-ai-services
  else
    echo "▶️ Starting geza-ai-services PM2 process on port ${PORT:-3040}..."
    cd ~/geza-ai-services-website
    PORT=${PORT:-3040} pm2 start server.py --name "geza-ai-services" --interpreter python3
    pm2 save
  fi

  pm2 list
EOF

echo "--------------------------------------------------------"
echo "✅ Deployment complete!"
echo "--------------------------------------------------------"
