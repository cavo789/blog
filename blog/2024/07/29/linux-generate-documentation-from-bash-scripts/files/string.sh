# region - public function string::upper
#
# ## Description
#
# Make a string uppercase.
#
# ## Examples
#
# ```bash
# echo "HEllow WoRLD!" | string::upper
# #Output
# HELLO WORLD!
#
# title="$(echo "Project title" | string::upper)"
# ```
#
# ## Return
#
# The string in uppercase
#
# ## Exit code
#
# * 0 If successful.
# * 1 An error has occurred.
#
# https://github.com/jmcantrell/bashful/blob/master/bin/bashful-utils#L33
#
# endregion
function string::upper() {
    tr '[:lower:]' '[:upper:]'
}
