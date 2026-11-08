# ------------------------------------------------------------------------------
# FUNCTION: sshf_actions
# DESCRIPTION: Internal router for specific host actions
# ------------------------------------------------------------------------------
sshf_actions() {
    local action_key=$1
    local target=$2
    [[ -z "$target" ]] && return

    case "$action_key" in
        ctrl-a)
            local cmd=$(echo -e "Ping\nCopy-ID\nEdit-Config" | fzf --reverse --header="Action for $target")
            case "$cmd" in
                Ping) ping $(ssh -G "$target" | awk '/^hostname / {print $2}') ;;
                Copy-ID) ssh-copy-id "$target" ;;
                Edit-Config) ${EDITOR:-vim} ~/.ssh/config ;;
            esac
            ;;
        ctrl-h)
            clear
            printf "\e[1;34m>> Raw configuration for: %s\e[0m\n" "$target"
            ssh -G "$target"
            printf "\n\e[1;30mPress any key to return to list...\e[0m"
            read -k 1 -s
            sshf ""
            ;;
    esac
}

# ------------------------------------------------------------------------------
# FUNCTION: sshf
#
# DESCRIPTION:
#   An interactive SSH launcher using fzf and Perl. It parses SSH configuration
#   files (~/.ssh/config and ~/.ssh/conf.d/*.conf) to present a searchable
#   list of aliases. It supports multi-line comments and rich-text
#   formatting (colors, backgrounds) in the preview pane.
#
# FEATURES:
#   - Deep search: Filters by Alias, HostName, or any word in the comments.
#   - ANSI Support: Supports tags like <red>, <bg-red>, <bold>, etc.
#   - Non-cluttered UI: Keeps the list clean while showing full docs on the right.
#   - Robust Parsing: Handles complex multi-line SSH comment blocks.
#   - Shortcuts: CTRL-A for Actions, CTRL-H for Details.
#
# INSTALLATION (zsh and bash, same code):
#   1. Save this file as ~/.zsh/fns/sshf.zsh (zsh) or ~/.bash/fns/sshf.sh (bash)
#   2. Load that folder from ~/.zshrc or ~/.bashrc with a "for fn_file ..." loop
#      (see https://www.avonture.be/blog/ssh-with-fuzzy-finder)
#   3. Open a new terminal
#
# USAGE:
#   $ sshf             # Opens interactive list
#   $ sshf query       # Opens interactive list pre-filtered by "query"
#
# DOCUMENTATION TAGS (Use in SSH config comments):
#   <red>text</red>, <green>text</green>, <yellow>text</yellow>, <blue>text</blue>
#   <bg-red>highlight</bg-red>, <bg-yellow>warning</bg-yellow>, <bold>important</bold>
# ------------------------------------------------------------------------------
sshf() {
    local out
    # Step 1: Data extraction with Perl
    # Aggregates comments and attaches them to the subsequent Host definition.
    out=$(cat ~/.ssh/config ~/.ssh/conf.d/*.conf 2>/dev/null | perl -ne '
        BEGIN { $sep = " ;; "; }
        s/\r//g; chomp;

        # Capture comment lines
        if (/^\s*#/) {
            s/^\s*#\s?//;
            s/\|/-/;
            $buf .= ($buf eq "" ? "" : $sep) . $_;
            next;
        }

        # Match Host alias (ignoring wildcards)
        if (/^\s*Host\s+([^*\s]+)/i) {
            $new_h = $1;
            if ($h) { print_line($h, $ip, $d); }
            $h = $new_h; $d = $buf; $buf = ""; $ip = "N/A";
            next;
        }

        # Capture HostName/IP
        if (/^\s*HostName\s+(.+)/i) { $ip = $1; }

        # Flush the last entry
        END { if ($h) { print_line($h, $ip, $d); } }

        sub print_line {
            my ($h, $i, $d) = @_;
            $d = "No description" unless $d;
            # 150-space padding prevents description spillover in the main list
            my $padding = " " x 150;
            printf "%-20s | %-15s %s ##### %s\n", $h, $i, $padding, $d;
        }
    ' | \
    fzf --query="$1" \
        --reverse \
        --delimiter="#####" \
        --no-hscroll \
        --exact \
        --ansi \
        --header="──────────────────────────────────────────────────────────────
ENTER  : Connect to host
CTRL-A : Open actions menu (Ping, MTR, etc.)
CTRL-H : Display raw SSH configuration
──────────────────────────────────────────────────────────────
ALIAS                | HOSTNAME" \
        --prompt="Search > " \
        --expect="ctrl-a,ctrl-h" \
        --preview-window="right:70%:wrap" \
        --preview="echo {2} | perl -pe '
            s/ ;; /\n/g;
            s/<red>/\e[31m/g;           s/<\/red>/\e[0m/g;
            s/<green>/\e[32m/g;         s/<\/green>/\e[0m/g;
            s/<yellow>/\e[33m/g;        s/<\/yellow>/\e[0m/g;
            s/<bg-red>/\e[41;37m/g;     s/<\/bg-red>/\e[0m/g;
            s/<bg-yellow>/\e[43;30m/g;  s/<\/bg-yellow>/\e[0m/g;
            s/<bold>/\e[1m/g;           s/<\/bold>/\e[0m/g;
        '")

    # fzf with --expect returns the key on the first line and the selection on the second
    local key=$(head -n1 <<< "$out")
    local selected_line=$(sed -n '2p' <<< "$out")
    local selected=$(echo "$selected_line" | awk '{print $1}')

    if [ -n "$key" ]; then
        # A shortcut was pressed
        sshf_actions "$key" "$selected"
    elif [ -n "$selected" ]; then
        # Step 2: Establish SSH Connection (Default Enter)
        local ssh_info=$(ssh -G "$selected")
        local real_user=$(echo "$ssh_info" | awk '/^user / {print $2}')
        local real_host=$(echo "$ssh_info" | awk '/^hostname / {print $2}')
        local real_key=$(echo "$ssh_info" | awk '/^identityfile / {print $2}' | head -n 1)

        printf "\n\e[1;36m>> Executing: ssh -i %s %s@%s\e[0m\n\n" "$real_key" "$real_user" "$real_host"

        ssh "$selected"
    fi
}
