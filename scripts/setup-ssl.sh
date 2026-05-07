#!/bin/bash
# Studio Architect SSL Auto-Provisioning Script

# Extract domain from NEXT_PUBLIC_SITE_URL
# Supports formats like https://example.com or example.com
DOMAIN=$(echo $NEXT_PUBLIC_SITE_URL | sed -e 's|^[^/]*//||' -e 's|/.*$||')

if [ -z "$DOMAIN" ] || [ "$DOMAIN" == "localhost" ]; then
  echo "[SSL]: NEXT_PUBLIC_SITE_URL is not set or is localhost. Skipping SSL installation."
  exit 0
fi

if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo "[SSL]: Certificate for $DOMAIN already exists. Skipping installation."
  exit 0
fi

echo "[SSL]: Initiating SSL certificate request for $DOMAIN..."

# Install certbot if not present (safety check)
if ! command -v certbot &> /dev/null; then
    echo "[SSL]: Certbot not found. Please ensure it's installed in the Dockerfile."
    exit 1
fi

# Attempt to get certificate using webroot mode
# This requires Nginx to be running and configured to serve /var/www/certbot
certbot certonly --webroot \
    -w /var/www/certbot \
    --non-interactive \
    --agree-tos \
    --email "admin@$DOMAIN" \
    -d "$DOMAIN"

if [ $? -eq 0 ]; then
    echo "[SSL]: Successfully installed certificate for $DOMAIN."
else
    echo "[SSL]: Failed to obtain certificate. Ensure Nginx is running and exposes port 80."
fi
