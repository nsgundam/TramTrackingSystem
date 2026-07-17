#!/bin/sh
set -e

runtime_environment="${NODE_ENV:-production}"
minimum_secret_length=32

validate_production_secret() {
  variable_name="$1"
  secret_value="$(printenv "$variable_name" || true)"

  case "$secret_value" in
    ""|"CHANGE_ME_IN_PRODUCTION"|*"TrackingJWT"*|*"LoRawan"*|*"your_"*|*"ReplaceWith"*)
      echo "level=error event=config.invalid variable=$variable_name reason=missing_or_known_default" >&2
      exit 1
      ;;
  esac

  if [ "${#secret_value}" -lt "$minimum_secret_length" ]; then
    echo "level=error event=config.invalid variable=$variable_name reason=weak_secret" >&2
    exit 1
  fi
}

if [ "$runtime_environment" != "development" ]; then
  validate_production_secret JWT_SECRET
  validate_production_secret TTN_WEBHOOK_SECRET

  jwt_secret="$(printenv JWT_SECRET || true)"
  ttn_webhook_secret="$(printenv TTN_WEBHOOK_SECRET || true)"
  if [ "$jwt_secret" = "$ttn_webhook_secret" ]; then
    echo "level=error event=config.invalid variable=JWT_SECRET,TTN_WEBHOOK_SECRET reason=secrets_must_differ" >&2
    exit 1
  fi
fi

echo "level=info event=migrations.start"
npx prisma migrate deploy
echo "level=info event=migrations.complete"

if [ "$runtime_environment" = "development" ]; then
  echo "level=info event=seed.start environment=development"
  npx prisma db seed
  echo "level=info event=seed.complete environment=development"
else
  echo "level=info event=seed.disabled environment=non_development"
fi

echo "level=info event=application.start"
exec "$@"
