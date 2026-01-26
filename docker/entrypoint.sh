#!/bin/sh

echo "Generating runtime environment file..."

cat <<EOF > /usr/share/nginx/html/assets/env.json
{
  "devMode": ${APP_DEV_MODE:-false},
  "environmentName": "${APP_ENV_NAME:-docker runtime}",
  "environmentCode": "${APP_ENV_CODE:-docker}",

  "czidloApiServiceBaseUrl": "${APP_CZIDLO_API_SERVICE_URL}",
  "czidloPublicApiBaseUrl": "${APP_CZIDLO_PUBLIC_API_URL}",
  "esBaseUrl": "${APP_ES_BASE_URL}",
  "esLogin": "${APP_ES_LOGIN}",
  "esPassword": "${APP_ES_PASSWORD}",
  "esIndexSearch": "${APP_ES_INDEX_SEARCH}",
  "esIndexAssign": "${APP_ES_INDEX_ASSIGN}",
  "esIndexResolve": "${APP_ES_INDEX_RESOLVE}"
}
EOF

echo "✔️  env.json generated."

exec nginx -g "daemon off;"
