# ~/.zsh/fns/gwt
# git worktree navigator — select a worktree with fzf and cd into it

gwt() {
  local worktrees selected dir

  worktrees=$(git worktree list 2>/dev/null) || {
    echo "Not inside a git repository."
    return 1
  }

  if [[ -z "$1" ]]; then
    # Interactive: pick a worktree with fzf
    selected=$(echo "$worktrees" \
      | fzf --prompt="Worktree > " \
            --preview="ls -la {1}" \
            --height=40%)
    [[ -z "$selected" ]] && return 0
    dir=$(echo "$selected" | awk '{print $1}')
  else
    # Direct: create a new worktree for the given branch
    local branch="$1"
    dir="${$(git rev-parse --show-toplevel)}-${branch//\//-}"
    git worktree add -b "$branch" "$dir" main || return 1
    echo "Created worktree at $dir"
  fi

  cd "$dir"
}
