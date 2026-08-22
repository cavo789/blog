FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Ubuntu's docker image only enables "main" + "restricted" by default; fzf
# lives in "universe".
RUN sed -i 's/^Components: main restricted$/Components: main restricted universe multiverse/' \
        /etc/apt/sources.list.d/ubuntu.sources && \
    apt-get update && \
    apt-get install -y \
        fzf \
        perl \
        openssh-client && \
    rm -rf /var/lib/apt/lists/*

# ~/.ssh/conf.d/ — the two exact config files from this article
RUN mkdir -p /root/.ssh/conf.d && chmod 700 /root/.ssh

RUN printf '%s\n' \
    '# MyAmazingApp - Production Environment' \
    '#' \
    '# https://my.amazing_app.be' \
    '#     /var/www/amazing' \
    '#     pgsql: host=1.2.3.4 port=5438 dbname=amazing username=christophe' \
    '#' \
    '# <yellow>Backend:</yellow> PHP 8.5' \
    '# <green>Note:</green>    Part of TremendousApp.' \
    '#' \
    '# <bg-red>  CRITICAL  </bg-red> - This is a production server!' \
    '# <bg-yellow>    INFO    </bg-yellow> - Database is <green>PostgreSQL</green>' \
    'Host MyAmazingApp_PROD' \
    '    Hostname 1.2.3.4' \
    '    User usr_app_prod' \
    '' \
    '# MyAmazingApp - Tests Environment' \
    '#' \
    '# https://my.tests_amazing_app.be' \
    '#     /var/www/tests_amazing' \
    '#     pgsql: host=1.2.3.4 port=5438 dbname=amazing_newx username=christophe' \
    '#' \
    '# <yellow>Backend:</yellow> PHP 8.3' \
    '# <green>Note:</green> This is the TESTS environment' \
    '#' \
    '# <bg-yellow>    INFO    </bg-yellow> - Database is <green>PostgreSQL</green>' \
    'Host MyAmazingApp_TEST' \
    '    Hostname 6.7.8.9' \
    '    User usr_app_test' \
    '' \
    'Host YourAmazingApp' \
    '    Hostname 1.2.3.4' \
    '    User you' \
    > /root/.ssh/conf.d/amazing.conf

RUN printf '%s\n' \
    'Host LegacyApp' \
    '    Hostname 1.2.3.4' \
    '    User legacy' \
    > /root/.ssh/conf.d/legacy.conf


# ~/.ssh/config — includes both conf.d files
RUN printf '%s\n' \
    'Include conf.d/amazing.conf' \
    'Include conf.d/legacy.conf' \
    > /root/.ssh/config && \
    chmod 600 /root/.ssh/config /root/.ssh/conf.d/*.conf

# ~/.bashrc — the exact sshf() function from this article
RUN printf '%s\n' \
    '# ------------------------------------------------------------------------------' \
    '# FUNCTION: sshf' \
    '#' \
    '# DESCRIPTION:' \
    '#   An interactive SSH launcher using fzf and Perl. It parses SSH configuration' \
    '#   files (~/.ssh/config and ~/.ssh/conf.d/*.conf) to present a searchable' \
    '#   list of aliases. It supports multi-line comments and rich-text' \
    '#   formatting (colors, backgrounds) in the preview pane.' \
    '#' \
    '# FEATURES:' \
    '#   - Deep search: Filters by Alias, HostName, or any word in the comments.' \
    '#   - ANSI Support: Supports tags like <red>, <bg-red>, <bold>, etc.' \
    '#   - Non-cluttered UI: Keeps the list clean while showing full docs on the right.' \
    '#   - Robust Parsing: Handles complex multi-line SSH comment blocks.' \
    '#' \
    '# INSTALLATION:' \
    '#   1. Save this file as ~/.zsh/sshf.zsh' \
    '#   2. Add the following line to your ~/.zshrc:' \
    '#           [[ -f ~/.zsh/sshf.zsh ]] && source ~/.zsh/sshf.zsh' \
    '#   3. Restart your terminal or run: source ~/.zshrc' \
    '#' \
    '# USAGE:' \
    '#   $ sshf             # Opens interactive list' \
    '#   $ sshf query       # Opens interactive list pre-filtered by "query"' \
    '#' \
    '# DOCUMENTATION TAGS (Use in SSH config comments):' \
    '#   <red>text</red>, <green>text</green>, <yellow>text</yellow>, <blue>text</blue>' \
    '#   <bg-red>highlight</bg-red>, <bg-yellow>warning</bg-yellow>, <bold>important</bold>' \
    '# ------------------------------------------------------------------------------' \
    'sshf() {' \
    '    local selected' \
    '    # Step 1: Data extraction with Perl' \
    '    # Aggregates comments and attaches them to the subsequent Host definition.' \
    '    selected=$(cat ~/.ssh/config ~/.ssh/conf.d/*.conf 2>/dev/null | perl -ne '\''' \
    '        BEGIN { $sep = " ;; "; }' \
    '        s/\r//g; chomp;' \
    '' \
    '        # Capture comment lines' \
    '        if (/^\s*#/) {' \
    '            s/^\s*#\s?//;' \
    '            s/\|/-/;' \
    '            $buf .= ($buf eq "" ? "" : $sep) . $_;' \
    '            next;' \
    '        }' \
    '' \
    '        # Match Host alias (ignoring wildcards)' \
    '        if (/^\s*Host\s+([^*\s]+)/i) {' \
    '            $new_h = $1;' \
    '            if ($h) { print_line($h, $ip, $d); }' \
    '            $h = $new_h; $d = $buf; $buf = ""; $ip = "N/A";' \
    '            next;' \
    '        }' \
    '' \
    '        # Capture HostName/IP' \
    '        if (/^\s*HostName\s+(.+)/i) { $ip = $1; }' \
    '' \
    '        # Flush the last entry' \
    '        END { if ($h) { print_line($h, $ip, $d); } }' \
    '' \
    '        sub print_line {' \
    '            my ($h, $i, $d) = @_;' \
    '            $d = "No description" unless $d;' \
    '            # 150-space padding prevents description spillover in the main list' \
    '            my $padding = " " x 150;' \
    '            printf "%-20s | %-15s %s ##### %s\n", $h, $i, $padding, $d;' \
    '        }' \
    '    '\'' | \' \
    '    fzf --query="$1" \' \
    '        --reverse \' \
    '        --delimiter="#####" \' \
    '        --no-hscroll \' \
    '        --exact \' \
    '        --ansi \' \
    '        --header="ALIAS                | HOSTNAME" \' \
    '        --prompt="Search > " \' \
    '        --preview-window="right:70%:wrap" \' \
    '        --preview="echo {2} | perl -pe '\''' \
    '            s/ ;; /\n/g;' \
    '            s/<red>/\e[31m/g;          s/<\/red>/\e[0m/g;' \
    '            s/<green>/\e[32m/g;        s/<\/green>/\e[0m/g;' \
    '            s/<yellow>/\e[33m/g;       s/<\/yellow>/\e[0m/g;' \
    '            s/<bg-red>/\e[41;37m/g;    s/<\/bg-red>/\e[0m/g;' \
    '            s/<bg-yellow>/\e[43;30m/g; s/<\/bg-yellow>/\e[0m/g;' \
    '            s/<bold>/\e[1m/g;          s/<\/bold>/\e[0m/g;' \
    '        '\''" | \' \
    '    awk '\''{print $1}'\'')' \
    '' \
    '    # Step 2: Establish SSH Connection' \
    '    if [ -n "$selected" ]; then' \
    '        # Use ssh -G to get the computed values for this alias' \
    '        local ssh_info=$(ssh -G "$selected")' \
    '        local real_user=$(echo "$ssh_info" | awk '\''/^user / {print $2}'\'')' \
    '        local real_host=$(echo "$ssh_info" | awk '\''/^hostname / {print $2}'\'')' \
    '        local real_key=$(echo "$ssh_info" | awk '\''/^identityfile / {print $2}'\'' | head -n 1)' \
    '' \
    '        # Print the fully expanded command in bold cyan' \
    '        printf "\n\e[1;36m>> Executing: ssh -i %s %s@%s\e[0m\n\n" "$real_key" "$real_user" "$real_host"' \
    '' \
    '        ssh "$selected"' \
    '    fi' \
    '}' \
    >> /root/.bashrc

WORKDIR /root

# Signal clearly that this shell runs inside a container
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /root/.bashrc

CMD ["/bin/bash", "-i"]
