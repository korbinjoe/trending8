#!/usr/bin/env bash
# Sync GitHub repo About (description, homepage, topics).
# Requires: gh CLI logged in with repo admin (gh auth login).
set -euo pipefail

REPO="${1:-korbinzhao/github-trending-plus}"

# User-value first (GitHub About ≤350 chars): outcome before tech stack.
DESCRIPTION="Discover open-source repos gaining traction today—not yesterday's star counts. Catch early movers, filter listicles & dead repos, and scan GitHub in ~3 min. Free demo & self-hostable."

HOMEPAGE='https://github-trending-plus-web.vercel.app'

TOPICS=(
  github
  trending
  open-source
  developer-tools
  discovery
  stars
  nextjs
  postgresql
  drizzle-orm
  self-hosted
  rss
  product-hunt
  monorepo
  typescript
  i18n
)

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login  (needs repo scope on ${REPO})" >&2
  exit 1
fi

topic_args=()
for t in "${TOPICS[@]}"; do
  topic_args+=(--add-topic "$t")
done

gh repo edit "$REPO" \
  --description "$DESCRIPTION" \
  --homepage "$HOMEPAGE" \
  "${topic_args[@]}"

echo "Updated ${REPO}:"
gh repo view "$REPO" --json description,homepageUrl,repositoryTopics \
  --jq '{description, homepageUrl, topics: [.repositoryTopics[].name]}'
