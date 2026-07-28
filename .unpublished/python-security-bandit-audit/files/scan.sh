#!/bin/sh
# Runs both scanners against the mounted project and always prints both
# reports in full, regardless of either tool's own exit code.

echo "=== Bandit — static security analysis ==="
bandit -r . -x ./tests,./vendor,./.venv 2>/dev/null
bandit_status=$?

echo
echo "=== pip-audit — dependency vulnerabilities ==="
if [ -f requirements.txt ]; then
    pip-audit -r requirements.txt
    audit_status=$?
else
    echo "No requirements.txt found — skipping dependency audit."
    audit_status=0
fi

echo
if [ "$bandit_status" -ne 0 ] || [ "$audit_status" -ne 0 ]; then
    echo "Result: issues found — see above."
    exit 1
fi

echo "Result: clean."
