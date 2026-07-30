# ai-fix — explain and suggest a fix for your last failed command. Re-runs it
# to capture the output (the shell itself never stores a previous command's
# stderr anywhere), so it asks for confirmation first on anything that looks
# like it could have a side effect.

AI_COMMANDS[fix]="ai-fix  — explain and suggest a fix for your last failed command"
AI_PARAMS[fix]="none"

ai-fix() {
  local last_cmd
  last_cmd=$(fc -ln -1 | sed 's/^[[:space:]]*//')

  if [[ -z "$last_cmd" ]]; then
    echo "ai-fix: no previous command found in history" >&2
    return 1
  fi

  if [[ "$last_cmd" == ai-fix* || "$last_cmd" == "ai fix"* ]]; then
    echo "ai-fix: refusing to re-run itself — run the failing command first, then call ai-fix" >&2
    return 1
  fi

  local -a risky_patterns=(
    "rm " "mv " "dd " "shred " "truncate " "mkfs"
    "git push" "git reset --hard" "git clean"
    "docker rm" "docker system prune" "docker volume rm"
    "kubectl delete" "DROP " "DELETE " "TRUNCATE "
  )
  local pattern is_risky=0
  for pattern in "${risky_patterns[@]}"; do
    [[ "$last_cmd" == *"$pattern"* ]] && is_risky=1
  done

  if (( is_risky )); then
    print -n "ai-fix: '$last_cmd' looks like it could have side effects — re-run it to capture the error? [y/N] "
    local confirm
    read -k1 confirm
    echo
    [[ "$confirm" != [yY] ]] && { echo "ai-fix: aborted, nothing re-run."; return 1; }
  fi

  echo "→ Re-running to capture the error: $last_cmd" >&2
  local output status
  output=$(eval "$last_cmd" 2>&1)
  status=$?

  if (( status == 0 )); then
    echo "ai-fix: '$last_cmd' succeeded this time — nothing to fix." >&2
    return 0
  fi

  local prompt="You are a Linux/zsh troubleshooting expert. The command below failed with exit code $status. In one short sentence explain what went wrong, then on its own line output the corrected command prefixed with 'Fix: '. Be concise, no long explanations.

--- COMMAND ---
$last_cmd

--- OUTPUT (stdout+stderr) ---
$output"

  _ollama_query "$prompt"
}
