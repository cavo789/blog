# rgtodo — surface all TODO/FIXME/HACK/NOTE comments in the project
rgtodo() {
    local dir="${1:-.}"

    rg \
        --color=always \
        --line-number \
        --smart-case \
        '(TODO|FIXME|HACK|NOTE):?\s' \
        "${dir}" \
        | sort
}
