# yq: run mikefarah/yq through Docker on the files of the current folder, no
# local install. Works in zsh and bash: save it as ~/.zsh/fns/yq.zsh or
# ~/.bash/fns/yq.sh (see https://www.avonture.be/blog/linux-yq).
#
# Runs with your own user ID, so files edited in place with -i keep their owner.
# The image is pulled automatically the first time.
yq() {
    if ! command -v docker >/dev/null 2>&1; then
        printf '\e[31mError: docker is not installed or not in your PATH.\e[0m\n' >&2
        return 1
    fi

    docker run --rm -i \
        -u "$(id -u):$(id -g)" \
        -v "${PWD}:/workdir" \
        mikefarah/yq:4 "$@"
}
