#!/bin/bash
set -e

# Run SSL setup if requested
if [ "$INSTALL_SSL" = "true" ]; then
    bash /app/scripts/setup-ssl.sh
fi

# Hand over to the main application
echo "[Entrypoint]: Starting Studio Architect..."
exec "$@"
