FOLDER_SOURCE="src"
FOLDER_COMPARE_WITH="./../another_project/src"

clear

[[ ! -d "${FOLDER_SOURCE}" ]] && printf "\033[1;31mThe folder %s didn't exists\033[0m\n" "${FOLDER_SOURCE}" && return 0
[[ ! -d "${FOLDER_COMPARE_WITH}" ]] && printf "\033[1;31mThe folder %s didn't exists\033[0m\n" "${FOLDER_COMPARE_WITH}" && return 0

printf "\033[1;34m%s %s %s %s\033[0m\n" "Compare folder" "${FOLDER_SOURCE}" "against" "${FOLDER_COMPARE_WITH}"

pushd "${FOLDER_SOURCE}" > /dev/null && LC_ALL=C diff --brief --ignore-blank-line . "${FOLDER_COMPARE_WITH}" | grep -v '^Only in \.' ; popd > /dev/null
