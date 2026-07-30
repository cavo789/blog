# ai-standup [days] — summarize your git activity across multiple repos into
# a short standup update.
#
# One-time setup in ~/.zshrc:
#   AI_STANDUP_REPOS=(~/code/project-a ~/code/project-b ~/code/blog)
#   AI_STANDUP_DAYS=7   # optional; default is 1 (daily standup)
#
# Usage:
#   ai-standup        → uses $AI_STANDUP_DAYS, or 1 if not set
#   ai-standup 7      → override for this run only
#   ai-standup 14     → coming back from vacation

AI_COMMANDS[standup]="ai-standup [days]  — summarize your git activity for standup"
AI_PARAMS[standup]="number"

ai-standup() {
  local days="${1:-${AI_STANDUP_DAYS:-1}}"

  if [[ ! "$days" =~ ^[1-9][0-9]*$ ]]; then
    echo "Usage: ai-standup [days]   (a positive integer, e.g. 'ai-standup 7' for a weekly recap)" >&2
    return 1
  fi

  if (( ${#AI_STANDUP_REPOS} == 0 )); then
    echo "ai-standup: \$AI_STANDUP_REPOS is not set. Add this to your ~/.zshrc:" >&2
    echo '  AI_STANDUP_REPOS=(~/code/project-a ~/code/project-b)' >&2
    return 1
  fi

  local email
  email=$(git config --global user.email 2>/dev/null)
  if [[ -z "$email" ]]; then
    echo "ai-standup: git global user.email is not configured" >&2
    return 1
  fi

  local all_commits="" repo repo_name commits
  for repo in "${AI_STANDUP_REPOS[@]}"; do
    [[ -d "${repo}/.git" ]] || continue
    repo_name="${repo:t}"
    commits=$(git -C "$repo" log \
      --since="${days} days ago" \
      --author="$email" \
      --all \
      --pretty=format:"- %s" 2>/dev/null)
    [[ -n "$commits" ]] && all_commits+="

### ${repo_name}
${commits}"
  done

  if [[ -z "$all_commits" ]]; then
    echo "ai-standup: no commits found in the last ${days} day(s) across \$AI_STANDUP_REPOS" >&2
    return 1
  fi

  local prompt="You write concise standup updates. Below are git commit messages grouped by repository, from the last ${days} day(s). Summarize them into 3-6 short bullet points describing what was accomplished. Group related commits together, skip trivial ones (typo fixes, merge commits), write in the past tense, first person. Output only the bullet points, nothing else.
${all_commits}"

  _ollama_query "$prompt"
}
