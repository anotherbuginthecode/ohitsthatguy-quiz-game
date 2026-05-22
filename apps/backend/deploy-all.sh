#!/bin/bash
set -e

LAMBDAS=("get-actors" "get-rounds" "get-gameset" "store-events")
PIDS=()
LOG_DIR=$(mktemp -d)

echo "Deploying ${#LAMBDAS[@]} lambdas in parallel..."

for lambda in "${LAMBDAS[@]}"; do
  ./deploy.sh "$lambda" >"$LOG_DIR/$lambda.log" 2>&1 &
  PIDS+=($!)
  echo "  started: $lambda (pid $!)"
done

echo ""

FAILED=0
for i in "${!LAMBDAS[@]}"; do
  lambda="${LAMBDAS[$i]}"
  pid="${PIDS[$i]}"
  if wait "$pid"; then
    echo "✓  $lambda"
  else
    echo "✗  $lambda — logs:"
    sed 's/^/   /' "$LOG_DIR/$lambda.log"
    FAILED=1
  fi
done

rm -rf "$LOG_DIR"

echo ""
if [ $FAILED -eq 0 ]; then
  echo "All lambdas deployed successfully."
else
  echo "One or more deployments failed." >&2
  exit 1
fi
