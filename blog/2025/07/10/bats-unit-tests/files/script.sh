__RED=31

function console::printRed() {
    for line in "$@"; do
        printf "\e[1;${__RED}m%s\e[0m\n" "$line"
    done
}
