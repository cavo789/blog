# ai-ci [ref] — find the most recent GitLab pipeline for the current branch
# (or a given ref), pull the log tail of every failed job through the API,
# and ask a local LLM what broke and how to fix it.
#
# Requirements:
#   - $GITLAB_TOKEN set to a personal access token with "read_api" scope
#   - Run inside a git checkout whose "origin" remote points at the GitLab project

AI_COMMANDS[ci]="ai-ci [ref]  — summarize the last failed GitLab pipeline for this repo"
AI_PARAMS[ci]="none"

# _ai_ci_gitlab_info — parse the origin remote URL and print "<host> <project/path>".
# Handles both SSH (git@host:group/project.git) and HTTPS remote formats.
_ai_ci_gitlab_info() {
  local remote_url
  remote_url=$(git config --get remote.origin.url 2>/dev/null)
  if [[ -z "$remote_url" ]]; then
    echo "ai-ci: not inside a git repository with an 'origin' remote" >&2
    return 1
  fi

  local host project_path
  if [[ "$remote_url" == git@* ]]; then
    host="${remote_url#git@}"
    host="${host%%:*}"
    project_path="${remote_url#*:}"
  else
    host="${remote_url#*://}"
    host="${host%%/*}"
    project_path="${remote_url#*://*/}"
  fi
  project_path="${project_path%.git}"

  print -- "${host} ${project_path}"
}

ai-ci() {
  if [[ -z "$GITLAB_TOKEN" ]]; then
    echo "ai-ci: \$GITLAB_TOKEN is not set (needs a personal access token with 'read_api' scope)" >&2
    return 1
  fi

  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "ai-ci: not inside a git repository" >&2
    return 1
  fi

  local gitlab_info
  gitlab_info=$(_ai_ci_gitlab_info) || return 1
  local host="${gitlab_info%% *}"
  local project_path="${gitlab_info#* }"

  local gitlab_api="https://${host}/api/v4"
  local encoded_path="${project_path//\//%2F}"
  local ref="${1:-$(git branch --show-current)}"

  local pipeline_id
  pipeline_id=$(curl --silent --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
    "${gitlab_api}/projects/${encoded_path}/pipelines?ref=${ref}&per_page=1" \
    | jq -r '.[0].id // empty')

  if [[ -z "$pipeline_id" ]]; then
    echo "ai-ci: no pipeline found for ref '${ref}' on ${project_path}" >&2
    return 1
  fi

  local failed_jobs
  failed_jobs=$(curl --silent --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
    "${gitlab_api}/projects/${encoded_path}/pipelines/${pipeline_id}/jobs" \
    | jq -r '.[] | select(.status == "failed") | "\(.id)\t\(.name)"')

  if [[ -z "$failed_jobs" ]]; then
    echo "ai-ci: pipeline #${pipeline_id} for '${ref}' has no failed jobs." >&2
    return 0
  fi

  print -- "$failed_jobs" | while IFS=$'\t' read -r job_id job_name; do
    echo >&2
    echo "→ Analyzing failed job: ${job_name} (#${job_id})" >&2

    local trace
    trace=$(curl --silent --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
      "${gitlab_api}/projects/${encoded_path}/jobs/${job_id}/trace" | tail -c 6000)

    local prompt="You are a CI/CD troubleshooting expert. The GitLab job '${job_name}' failed. Below is the tail of its log. In 2-4 sentences, explain what broke and suggest a concrete fix — reference the actual error, not generic advice.

--- JOB LOG (tail) ---
${trace}"

    echo "=== ${job_name} ==="
    _ollama_query "$prompt"
  done
}
