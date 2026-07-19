# Generate for a single file
node scripts/generate-eli5.mjs blog/2026-01-01-my-post/files/Dockerfile

# Regenerate after the source file changed
node scripts/generate-eli5.mjs blog/2026-01-01-my-post/files/compose.yaml --force

# Write to a custom path
node scripts/generate-eli5.mjs src/some-file.sh --output docs/files/some-file.sh.eli5.json
