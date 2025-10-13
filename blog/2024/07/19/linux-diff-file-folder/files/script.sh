FILE="string.sh"
FOLDER_SOURCE="src"
FOLDER_COMPARE_WITH="./../another_project/src"

clear

[[ ! -d "${FOLDER_SOURCE}" ]] && printf "\033[1;31mThe folder %s didn't exists\033[0m\n" "${FOLDER_SOURCE}" && return 0
[[ ! -f "${FOLDER_SOURCE}/${FILE}" ]] && printf "\033[1;31mThe file %s didn't exists\033[0m\n" "${FOLDER_SOURCE}/${FILE}" && return 0
[[ ! -d "${FOLDER_COMPARE_WITH}" ]] && printf "\033[1;31mThe folder %s didn't exists\033[0m\n" "${FOLDER_COMPARE_WITH}" && return 0
[[ ! -f "${FOLDER_COMPARE_WITH}/${FILE}" ]] && printf "\033[1;31mThe file %s didn't exists\033[0m\n" "${FOLDER_COMPARE_WITH}/${FILE}" && return 0

printf "\033[1;34m%s %s %s %s\033[0m\n" "Compare" "${FOLDER_SOURCE}/${FILE}" "against" "${FOLDER_COMPARE_WITH}/${FILE}"
printf "\033[1;34m%s \033[1;31m%s \033[1;34m%s \033[1;32m%s\033[0m\n\n" "Below in red sentences from" "${FOLDER_SOURCE}/${FILE}" "and, in green, sentences from"  "${FOLDER_COMPARE_WITH}/${FILE}"

pushd "${FOLDER_SOURCE}" > /dev/null && diff --suppress-common-lines "${FILE}" "${FOLDER_COMPARE_WITH}"/"${FILE}" && echo "Congratulations, the two files are exactly the same" ; popd > /dev/null
