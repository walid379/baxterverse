#!/usr/bin/env bash
set -euo pipefail

# Run this script on the Linux host as your normal sudo-enabled user.
# Requires Caddy installed (https://caddyserver.com/docs/install).
if ! command -v caddy >/dev/null; then
  echo 'Caddy absent. Installe Caddy avant de relancer : https://caddyserver.com/docs/install' >&2
  exit 1
fi
if ! command -v tailscale >/dev/null; then
  echo 'Tailscale absent. Installe et connecte Tailscale avant de relancer.' >&2
  exit 1
fi

sudo mkdir -p /opt/baxterverse/webui /opt/baxterverse/config/guide-images
sudo chown -R "$(id -u):$(id -g)" /opt/baxterverse
sudo cp "$(dirname "$0")/Caddyfile" /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl enable --now caddy
sudo systemctl reload caddy

echo 'Répertoires créés, Caddy activé sur http://127.0.0.1:8088.'
echo 'Transfère maintenant dist/ et deployment/config/ depuis Windows.'
echo 'Puis vérifie les pages localement et bascule Tailscale Serve vers le port 8088 :'
echo '  curl -I http://127.0.0.1:8088/'
echo '  curl -I http://127.0.0.1:8088/reading-guides.json'
echo '  sudo tailscale serve status; sudo tailscale funnel status'
echo '  sudo tailscale serve --bg 8088   # privé ; OU'
echo '  sudo tailscale funnel --bg 8088  # public'
