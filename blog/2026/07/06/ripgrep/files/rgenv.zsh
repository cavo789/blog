# rgenv — find all references to an environment variable across config and source files
rgenv() {
    local var="${1}"

    if [[ -z "${var}" ]]; then
        echo "Usage: rgenv <VARIABLE_NAME>"
        return 1
    fi

    rg \
        --type-add 'config:*.{env,cfg,ini,conf}' \
        --type config \
        --type yaml \
        --type sh \
        --type php \
        --type py \
        "${var}"
}
