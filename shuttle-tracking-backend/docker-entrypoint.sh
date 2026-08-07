#!/bin/sh
set -e

runtime_environment="${NODE_ENV:-production}"

case "$runtime_environment" in
  development|production) ;;
  *)
    echo "level=error event=config.invalid variable=NODE_ENV reason=unsupported_environment" >&2
    exit 1
    ;;
esac

export NODE_ENV="$runtime_environment"

if [ "$runtime_environment" = "production" ]; then
  echo "level=info event=config.validation_start"
  node dist/config/validate-runtime.js
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
