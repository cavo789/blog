# ~/.zsh/fns/stun.zsh
# Interactive SSH tunnel manager
# Usage: stun            → fzf picker
#        stun db-staging → open tunnel by name directly

# ─── Tunnel registry — add your own entries ───────────────────────────────────
typeset -gA TUNNELS
TUNNELS=(
    "db-staging"    "bastion -L 5433:db-staging.internal:5432"
    "db-production" "bastion -L 5434:db-prod.internal:5432"
    "redis-staging" "bastion -L 6380:redis.internal:6379"
    "webapp-dev"    "bastion -L 8081:webapp.internal:80"
)

stun() {
    local selection

    if [[ -n "$1" ]]; then
        selection="$1"
    else
        # Show tunnel names with their forward rule in the preview
        selection=$(
            printf '%s\n' "${(@k)TUNNELS}" | sort \
            | fzf --prompt="Tunnel > " \
                  --height=40% \
                  --preview='echo "ssh -N ${TUNNELS[{}]}"' \
                  --preview-window=bottom:2
        )
    fi

    [[ -z "$selection" ]] && return 0

    local cmd="${TUNNELS[$selection]}"
    if [[ -z "$cmd" ]]; then
        print -P "%F{red}Unknown tunnel: $selection%f"
        return 1
    fi

    print -P "%F{green}Opening tunnel:%f $selection"
    print -P "%F{yellow}  ssh -N $cmd%f"
    print "  (Ctrl+C to close)"
    ssh -N $=cmd
}
