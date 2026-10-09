_docker_size_check() {
    local stamp="$HOME/.cache/.vhdx_check_$(date +%Y%m%d)"
    [[ -f "$stamp" ]] && return
    touch "$stamp"
    local app_data
    app_data="$(powershell.exe -NoProfile -Command \
        '[System.Environment]::GetFolderPath("LocalApplicationData")' \
        2>/dev/null | tr -d '\r\n')"
    local vhdx
    vhdx="$(wslpath "${app_data}/Docker/wsl/disk/docker_data.vhdx" 2>/dev/null)"
    [[ -f "$vhdx" ]] || return
    local gb
    gb="$(du -BG -- "$vhdx" 2>/dev/null | cut -f1 | tr -d 'G')"
    (( gb > 150 )) && printf '\n⚠  docker_data.vhdx: %s GB — run: docker system df\n\n' "$gb"
}
_docker_size_check
