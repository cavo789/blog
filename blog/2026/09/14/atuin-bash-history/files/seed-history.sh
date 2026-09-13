#!/usr/bin/env bash
#
# Seed the local Atuin database with a realistic shell history, so that pressing
# CTRL+R in a freshly started demo container shows something worth searching.
#
# This is a DEMO device, not something you would ever run on a real machine: there,
# Atuin records your history by itself, one command at a time.
#
# Why write straight into SQLite instead of calling `atuin history start/end`?
# Because that pair of commands always stamps an entry with the *current* time, so
# every seeded command would share the same timestamp. A convincing demo needs a
# history spread over several weeks, which means setting `timestamp` ourselves.
#
# Schema of the `history` table (atuin 18.x):
#   id        text  - primary key, 32 hex chars
#   timestamp int   - NANOSECONDS since the epoch
#   duration  int   - NANOSECONDS
#   exit      int   - exit code of the command
#   command   text
#   cwd       text  - directory the command was run from
#   session   text  - groups commands belonging to the same shell session
#   hostname  text  - "<host>:<user>"
# with a unique(timestamp, cwd, command) constraint.

set -euo pipefail

readonly DB="${HOME}/.local/share/atuin/history.db"

# Let Atuin create the database and run its migrations before we write into it.
atuin search --limit 1 >/dev/null 2>&1 || true

if [[ ! -f "${DB}" ]]; then
    echo "Atuin database not found at ${DB}" >&2
    exit 1
fi

# The container may be restarted; only seed an empty database.
if [[ "$(sqlite3 "${DB}" 'SELECT COUNT(*) FROM history;')" -gt 0 ]]; then
    exit 0
fi

now="$(date +%s)"
me="$(whoami)"

# Two hosts, so the demo can show filtering by machine, and three shell sessions,
# so the "session" filter has something to group.
HOST_LOCAL="$(hostname):${me}"
HOST_REMOTE="srv-prod:${me}"
readonly HOST_LOCAL HOST_REMOTE

new_id() { sqlite3 "${DB}" 'SELECT lower(hex(randomblob(16)));'; }

session_1="$(new_id)"
session_2="$(new_id)"
session_3="$(new_id)"

# Each row: minutes_ago | exit | duration_ms | session | host | cwd | command
#
# "HOME" in the cwd column is replaced by the real $HOME at seeding time, and "L"/"R"
# in the host column select the local or the remote hostname.
#
# Keep minutes_ago strictly increasing-ish and unique enough to satisfy the
# unique(timestamp, cwd, command) constraint; a per-row jitter is added below.
read -r -d '' SEED <<'ROWS' || true
12|0|1840|3|L|HOME/projects/blog|docker compose up -d
15|0|320|3|L|HOME/projects/blog|git status
18|1|90|3|L|HOME/projects/blog|git push origin main
21|0|140|3|L|HOME/projects/blog|git pull --rebase
26|0|12400|3|L|HOME/projects/blog|yarn build
34|0|760|3|L|HOME/projects/blog|yarn lint
41|0|95|3|L|HOME/projects/blog|rg --type md "atuin" .
47|0|210|3|L|HOME/projects/blog|fzf --preview 'bat --color=always {}'
55|127|30|3|L|HOME/projects/blog|yarnn start
58|0|45|3|L|HOME/projects/blog|yarn start
180|0|3200|2|L|HOME/projects/api|docker build -t api:dev .
185|0|880|2|L|HOME/projects/api|docker run --rm -it api:dev bash
190|1|2100|2|L|HOME/projects/api|composer install
196|0|45300|2|L|HOME/projects/api|composer update
205|0|6700|2|L|HOME/projects/api|./vendor/bin/phpunit --testdox
212|1|5400|2|L|HOME/projects/api|./vendor/bin/phpunit --filter UserTest
219|0|130|2|L|HOME/projects/api|php -l src/Controller/UserController.php
228|0|310|2|L|HOME/projects/api|git diff --stat
240|0|88|2|L|HOME/projects/api|git log --oneline -10
255|0|1500|2|L|HOME/projects/api|docker compose logs -f --tail=100 api
1450|0|760|1|L|HOME|ssh srv-prod
1455|0|220|1|R|/var/www/app|tail -f /var/log/nginx/error.log
1462|0|95|1|R|/var/www/app|systemctl status nginx
1470|1|140|1|R|/var/www/app|systemctl restart nginx
1478|0|60|1|R|/var/www/app|sudo systemctl restart nginx
1486|0|310|1|R|/var/www/app|df -h
1494|0|180|1|R|/var/www/app|du -sh /var/log/*
1510|0|2400|1|R|/var/www/app|docker system prune -af
1530|0|120|1|R|/var/www/app|docker ps --format 'table {{.Names}}\t{{.Status}}'
2880|0|430|1|L|HOME/projects/blog|git checkout -b feat/atuin
2890|0|15200|1|L|HOME/projects/blog|npx docusaurus build
2905|0|640|1|L|HOME/projects/blog|git add . && git commit -m "draft: atuin article"
4320|0|980|2|L|HOME/.config|vim ~/.bashrc
4330|0|75|2|L|HOME/.config|source ~/.bashrc
4340|0|1200|2|L|HOME/.config|curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh
4355|0|210|2|L|HOME/.config|atuin import auto
5760|0|3400|1|L|HOME/projects/infra|terraform plan
5790|1|8900|1|L|HOME/projects/infra|terraform apply
5820|0|11200|1|L|HOME/projects/infra|terraform apply -auto-approve
7200|0|540|3|L|HOME/projects/blog|wsl --shutdown
7230|0|180|3|L|HOME/projects/blog|ollama run llama3 "summarize this changelog"
7260|0|4100|3|L|HOME/projects/blog|ollama pull mistral
10080|0|2300|2|L|HOME/projects/api|tar -czf backup-$(date +%F).tar.gz ./storage
10110|1|60|2|L|HOME/projects/api|tar -xzf backup.tar.gz -C /tmp/restore
10140|0|85|2|L|HOME/projects/api|mkdir -p /tmp/restore && tar -xzf backup.tar.gz -C /tmp/restore
14400|0|320|1|L|HOME|find . -name "*.log" -mtime +30 -delete
14430|0|1800|1|L|HOME|rsync -avz --progress ./photos/ backup:/mnt/photos/
20160|0|150|3|L|HOME/projects/blog|sed -i 's/foo/bar/g' README.md
20190|0|95|3|L|HOME/projects/blog|awk -F',' '{print $2}' data.csv | sort -u
28800|0|260|2|L|HOME/projects/api|jq '.dependencies | keys' package.json
28830|0|70|2|L|HOME/projects/api|curl -s localhost:8080/health | jq .
ROWS

# Build one big transaction rather than one sqlite3 call per row.
{
    echo "BEGIN;"
    jitter=0
    while IFS='|' read -r mins code dur_ms sess host cwd cmd; do
        [[ -z "${mins}" ]] && continue

        jitter=$((jitter + 7))
        ts_ns=$(( (now - mins * 60 - jitter) * 1000000000 ))
        dur_ns=$(( dur_ms * 1000000 ))

        case "${sess}" in
            1) session="${session_1}" ;;
            2) session="${session_2}" ;;
            *) session="${session_3}" ;;
        esac

        [[ "${host}" == "R" ]] && hostname_value="${HOST_REMOTE}" || hostname_value="${HOST_LOCAL}"

        cwd="${cwd/#HOME/${HOME}}"
        # Escape single quotes for SQL string literals.
        cmd="${cmd//\'/\'\'}"

        printf "INSERT INTO history (id, timestamp, duration, exit, command, cwd, session, hostname) VALUES (lower(hex(randomblob(16))), %s, %s, %s, '%s', '%s', '%s', '%s');\n" \
            "${ts_ns}" "${dur_ns}" "${code}" "${cmd}" "${cwd}" "${session}" "${hostname_value}"
    done <<< "${SEED}"
    echo "COMMIT;"
} | sqlite3 "${DB}"

printf 'Atuin history seeded with %s commands.\n' "$(sqlite3 "${DB}" 'SELECT COUNT(*) FROM history;')"
