#!/usr/bin/env bash

# Get the location (foldername) of this script; not the running one (don't use $0)
#! Should be defined here and in below during the initialisation of the params array
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

# region - public function array::sort
#
# ## Description
#
# Sort an array (not associative one)
#
# ## Examples
#
# ```bash
# arr=("f" "a" "e" "c" "b")
#
# #! As you can see, don't use the dollar sign before the array variable name
# array::sort arr  # sort the array "a", "b", "c", ...
# ```
#
# ## Parameters
#
# * @arg array Non-associative array to sort
#
# ## Return
#
# The sorted array
#
# ## Exit code
#
# * 0 If successful.
# * 1 An error has occurred.
# * 2 Function missing arguments.
#
# endregion
function array::sort() {
    local -n arr=$1

    # shellcheck disable=SC2207
    IFS=$'\n' arrSorted=($(sort <<< "${arr[*]}"))
    unset IFS

    echo "${arrSorted[@]}"
}

# region - private function bash::__getIntroBlock
#
# ## Description
#
# Extract the introduction block present in the bash file.
#
# The block will look like below
#
#   # region - Intro block -------------------------------------------
#   #
#   # A long description
#   #
#   # endregion - Intro block ----------------------------------------
#
# Just like in this script, see the top of this file
#
# ## Examples
#
# ```bash
# bash::__getIntroBlock  "any_script.sh"
# ```
#
# ## Parameters
#
# * @arg string The name of the script like "any_script.sh"
#
# ## Return
#
# The introduction block as a string
#
# ## Exit code
#
# * 0 If successful i.e. no syntax error retrieved in the script
# * 1 An error has occurred i.e. there are syntax errors in the script
# * 2 Function missing arguments.
#
# endregion
function bash::__getIntroBlock() {
    local -r filename="$1" # The filename we need to scan (f.i. "any_script.sh")

    startTag="^# region - Intro block"
    endTag="^# endregion - Intro block"

    # Extract the region; including the tags
    regionIntroBlock="$(sed -n "/${startTag}/,/${endTag}/p" "${filename}")"

    # Remove the tags line
    regionIntroBlock="$(echo "$regionIntroBlock" | sed -E 's/^# region - Intro block.*//')"
    regionIntroBlock="$(echo "$regionIntroBlock" | sed -E 's/^# endregion - Intro block.*//')"

    # Remove the starting "#" followed or not by a space on each line
    # shellcheck disable=SC2001
    regionIntroBlock="$(echo "$regionIntroBlock" | sed -E 's/^#\s?//')"

    echo "$regionIntroBlock"
}

# region - public function bash::addBanner
#
# ## Description
#
# Add a banner "Don't modify this file" at the top of the generated file
#
# ## Examples
#
# ```bash
# bash::addBanner "documentation.md"
# ```
#
# ## Parameters
#
# * @arg string The name of the file where the banner has to be added
# * @arg string Optional, the name of the script used to generate the documentation.
#
# ## Exit code
#
# * 0 If successful.
# * 1 An error has occurred.
# * 2 Function missing arguments.
#
# endregion
function bash::addBanner() {
    local filename="$1" # The filename where the banner should be added

    local generateScript="${2:-}" # The name of the script used to generate the documentation

    # Comment that will be added at the top of the file.
    header="<!--"
    header2="    This documentation has been generated automatically."
    header3="    Run the generation script (${generateScript}) to update it if needed"
    header4=""
    header5="    Last refresh date: $(date +"%A, %B %d, %Y, %T")"
    header6="-->"

    file::addBanner "$filename" "$header\n$header2\n$header3\n$header4\n$header5\n$header6"

    return 0
}

# region - public function bash::generateBashDocumentation
#
# ## Description
#
# Scan the script and generate a documentation (markdown one).
#
# ## Examples
#
# ```bash
# bash::generateBashDocumentation "any_script.sh"
# ```
#
# ## Parameters
#
# * @arg string The name of the script like "my_script.sh"
# * @arg boolean Optional, Did we need to make a table of contents?
# * @arg string Optional, The start tag to retrieve like "# region - public function".
#
# ## Return
#
# When successful, the return will be a long string that is the Markdown documentation
#
# ## Exit code
#
# * 0 If successful.
# * 1 An error has occurred.
# * 2 Function missing arguments.
#
# endregion
function bash::generateBashDocumentation() {
    local filename="$1"                                # The filename we need to scan (f.i. "my_script.sh")
    local createTOC="${2:-true}"                       # Should we need to create a table of contents
    local startTag="^${3:-# region - public function}" # The start tag if any (f.i. "# region - public function")

    local endTag="^# endregion"

    local generateScript="${2:-}" # The name of the script used to generate the documentation

    # Extract the region; including the tags
    regionBlock="$(sed -n "/${startTag}/,/${endTag}/p" "${filename}")"

    # Remove the starting "#" followed or not by a space on each line
    # shellcheck disable=SC2001
    regionBlock="$(echo "$regionBlock" | sed -E 's/^#\s?//')"

    # Replace the starting "region -" by "# " so we've a heading one in markdown
    regionBlock="$(echo "$regionBlock" | sed -E 's/^region\s?-\s/# /')"

    # Replace any "#" in the comment by "###" i.e. increase the level
    regionBlock="$(echo "$regionBlock" | sed -E 's/# /### /')"

    # And the final "endregion" line
    regionBlock="$(echo "$regionBlock" | sed -E 's/^endregion//')"

    tmpFile="$(mktemp)"

    # The syntax $'\n' will concatenate substrings with a linefeed
    echo "# Documentation $(file::getBasename "${filename}")" > "${tmpFile}"

    # shellcheck disable=SC2129
    bash::__getIntroBlock "${filename}" >> "${tmpFile}"

    if [[ ${createTOC} == "true" ]]; then
        # Add a table of contents
        # shellcheck disable=SC2129
        echo "" >> "${tmpFile}"
        echo "## List of functions" >> "${tmpFile}"
        echo "" >> "${tmpFile}"
        markdown::generateTableOfContents "${regionBlock}" >> "${tmpFile}"
        echo "${regionBlock}" >> "${tmpFile}"
    fi

    bash::addBanner "${tmpFile}" "${generateScript}"

    cat "${tmpFile}"

    rm -f "${tmpFile}"

    return 0
}

# region - public function file::addBanner
#
# ## Description
#
# Add a text at the very top of a file
#
# ## Examples
#
# ```bash
# file::addBanner "test.md" "<!-- ipso lorem -->"
# ```
#
# ## Parameters
#
# * @arg string The filename where the banner should be added
# * @arg string The banner text to add
#
# ## Exit code
#
# * 0 If successful i.e. the banner was successfully added
# * 1 An error has occurred i.e. the banner wasn't added
# * 2 Function missing arguments.
#
# endregion
function file::addBanner() {
    local -r filename="$1"

    sed -i "1 i \\$2\n" "${filename}"

    return 0
}

# region - public function file::getBasename
#
# ## Description
#
# Get the filename without parent folder's name.
#
# ## Examples
#
# ```bash
# file::getBasename "/app/.docker/entrypoint.sh"  # will return "entrypoint.sh"
# ```
#
# ## Parameters
#
# * @arg string A filename
#
# ## Return
#
# Will return only the filename, without parent folder's name
#
# ## Exit code
#
# * 0 If successful.
# * 1 An error has occurred.
# * 2 Function missing arguments.
#
# endregion
function file::getBasename() {
    basename -- "$1"
}


# region - private function generate_doc::__main
#
# ## Description
#
# Run the script
#
# ## Examples
#
# ```bash
# generate_doc::__main $*
# ```
#
# ## Parameters
#
# * @arg CLI arguments
#
# ## Exit code
#
# * 0 If successful.
# * 1 An error has occurred.
# * 2 Function missing arguments.
#
# endregion
function generate_doc::__main() {
    # shellcheck disable=SC2178
    arrFiles=$(find "${SCRIPT_DIR}/helpers" -name "*.sh")

    #  And sort the array based on filenames thus
    arrFiles=$(array::sort arrFiles)

    local readme
    readme="# List of helpers"$'\n'

    [[ ! -d "${SCRIPT_DIR}"/documentation ]] && mkdir -p "${SCRIPT_DIR}"/documentation

    # shellcheck disable=SC2068
    for filename in ${arrFiles[@]}; do
        echo "Process $filename"

        # Replace the .sh extension by .md
        outputFilename="${filename/%.sh/.md}"
        # and replace "helpers" (the folder) by "documentation" (where docs will be created)
        outputFilename="${outputFilename/\/helpers/\/documentation}"
        echo "Create $outputFilename"

        bash::generateBashDocumentation "$filename" "true" "# region - public function" > "${outputFilename}"

        # Keep only the basename like "markdown.md"
        relativeOutputFilename="$(file::getBasename "${outputFilename}")"

        # $'\n' is to add a linefeed
        readme="${readme}"$'\n'"* [${relativeOutputFilename}](${relativeOutputFilename})"
    done

    # Generate the readme.md file so we can have a look on each doc through GitLab
    echo "$readme" > "${SCRIPT_DIR}/documentation/readme.md"

    # Add the last modification date/time in the readme.md file
    bash::addBanner "${SCRIPT_DIR}/documentation/readme.md" "$(basename "${BASH_SOURCE[0]}")"

    echo ""
    echo "Success! The documentation has been created/updated."

    return 0
}

# region - public function markdown::generateTableOfContents
#
# ## Description
#
# This function will retrieve any headings (from `H2` to `H6`) from the markdown content
# and will generate a table of contents
#
# ## Examples
#
# ```bash
# markdown::generateTableOfContents "any markdown long, multi-lines, text"
# markdown::generateTableOfContents "$(cat test.md)"
# ```
#
# ## Parameters
#
# * @arg string A long and multi-lines text
#
# ## Return
#
# A bullet list that will be used as a table of content
#
# For instance (partial output):
#
# ```markdown
# * [public function console::printGray()](#public-function-console-printgray)
#   * [Description](#description)
#   * [Examples](#examples)
#   * [Parameters](#parameters)
#   * [Exit code](#exit-code)
# * [public function console::printGrayNoNewLine()](#public-function-console-printgraynonewline)
#   * [Description](#description)
#   * [Examples](#examples)
# ```
#
# ## Exit code
#
# * 0 If successful.
# * 1 An error has occurred.
# * 2 Function missing arguments.
#
# endregion
function markdown::generateTableOfContents() {
    local -r markdownContent="$1"

    # Extract H2 and more
    local headings
    headings="$(printf "%s" "$markdownContent" | grep '^##')"

    # Make sure we've Unix LF style
    headings="${headings//\r$/}"

    local toc=""

    # Process each entries in the list of titles (we can't yet call it a TOC)
    while IFS= read -r heading; do
        slug=""

        # region-slug
        # Try to find a slug in the title f.i. `## How to use the program?{#how-to}`
        # In this case, we've a slug and it's `how-to`
        pattern='\{\#([^}]*)\}'

        # Generate a slug
        slug="$(echo "$heading" | string::slugify)"

        if [[ $heading =~ $pattern ]]; then
            # The title already contains a slug, use it
            match="${BASH_REMATCH[0]}" # f.i. `{#run-hooks}`
            slug="${BASH_REMATCH[1]}"  # f.i. `{#how-to}`

            # Remove the slug in the title
            heading=${heading//$match/}

        fi
        # endregion

        # H2 should become H1 in the TOC, H3 to H2, ...
        heading=${heading//## /# }

        # `# My title` should become `* My title`
        # `## My subtitle` should become `  * My title`
        # The two replace below achieve this purpose
        heading=${heading//# /* }
        heading=${heading//#/  }

        # heading is something like:
        #     `* Installation`
        #     `  * Settings`
        #     `    * JSON file`
        # i.e.
        #     1. an indentation or not followed by a bullet followed by a space
        #     2. a title

        # Parse the title
        #    ([^*]* ?\* )  Anything before a wildcard with or without a following space
        #                  Then a wildcard character and followed by a space ==> we've our indentation
        #    (.*)          Anything ==> we've our title
        pattern='([^*]* ?\* )(.*)'

        if [[ $heading =~ $pattern ]]; then
            # shellcheck disable=SC2034
            indent="${BASH_REMATCH[1]}" # f.i. `    * `
            title=${BASH_REMATCH[2]}    # f.i. `JSON file`

            # Remove leading and trailing whitespace
            title="$(echo "$title" | string::trim)"

            # Add the heading in the table of content and add a LF character to go to the next line
            toc+=${heading//$title/[$title](#$slug)}$'\n'
        fi

    done < <(printf '%s\n' "$headings") # Process $headings, line by line

    echo "$toc"
}

# region - public function string::ltrim
#
# ## Description
#
# Removes all leading whitespace (from the left)
# Specify the character to remove (default is a space) as the first argument
# to remove that character; f.i. a starting slash
#
# ## Examples
#
# ```bash
# $(echo "     Hello world     " | string::ltrim)"  # "Hello world     "
# $(echo "/tmp/folder/" | string::ltrim "/")"       # "tmp/folder/"
# ```
#
# ## Parameters
#
# * @arg String The character to remove, default is a space
#
# ## Return
#
# The left-trimmed string
#
# ## Exit code
#
# * 0 If successful.
# * 1 An error has occurred.
#
# @link https://github.com/jmcantrell/bashful/blob/master/bin/bashful-utils#L233
#
# endregion
function string::ltrim() {
    local -r char=${1:-[:space:]}
    sed "s%^[${char//%/\\%}]*%%"
}

# region - public function string::rtrim
#
# ## Description
#
# Removes all trailing whitespace (from the right).
# Specify the character to remove (default is a space) as the first argument
# to remove that character; f.i. an ending slash
#
# ## Examples
#
# ```bash
# $(echo "     Hello world     " | string::rtrim)"  # "     Hello world"
# $(echo "/tmp/folder/" | string::rtrim "/")"       # "/tmp/folder"
# ```
#
# ## Parameters
#
# * @arg String The character to remove, default is a space
#
# ## Return
#
# The right-trimmed string
#
# ## Exit code
#
# * 0 If successful.
# * 1 An error has occurred.
#
# @https://github.com/jmcantrell/bashful/blob/master/bin/bashful-utils#L245
#
# endregion
function string::rtrim() {
    local -r char=${1:-[:space:]}
    sed "s%[${char//%/\\%}]*$%%"
}

# region - public function string::slugify
#
# ## Description
#
# Create a slug from any text
# Return "how-to" f.i. the text is "How to?"
# https://gist.github.com/oneohthree/f528c7ae1e701ad990e6
#
# ## Examples
#
# ```bash
# echo "HEllo WoRLD!" | string::slugify  # will return `hello-world`
# ```
#
# ## Parameters
#
# * @arg string A string to "slugify"
#
# ## Return
#
# The slug i.e. a string with spaces, special characters, ...
#
# ## Exit code
#
# * 0 If successful.
# * 1 An error has occurred.
# endregion
function string::slugify() {
    # Replace the "– dash" sign and use the minus instead "-"
    # Use sed to remove some characters then convert uppercase to lower
    sed -E 's/[~\^]+//g' |
        # Remove purely and simply some characters
        sed -E 's/://g' |
        sed -E 's/[^a-zA-Z0-9]+/-/g' | sed -E 's/^-+\|-+$//g' |
        sed -E 's/^-+://g' | sed -E 's/-+$//g' | tr "[:upper:]" "[:lower:]" |
        sed -e "s/^-//"
}

# region - public function string::trim
#
# ## Description
#
# Removes all leading/trailing whitespace.
# Specify the character to remove (default is a space) as the first argument
# to remove that character; f.i. a slash
#
# ## Examples
#
# ```bash
# $(echo "     Hello world     " | string::trim)"   # "Hello world"
# $(echo "/tmp/folder/" | string::trim "/")"        # "tmp/folder"
# ```
#
# ## Parameters
#
# * @arg String to trim
#
# ## Return
#
# The trimmed string (left and right)
#
# ## Exit code
#
# * 0 If successful.
#
#https://github.com/jmcantrell/bashful/blob/master/bin/bashful-utils#L219
#
# endregion
function string::trim() {
    local -r char=${1:-[:space:]}
    # shellcheck disable=SC2068
    string::ltrim $@ | string::rtrim $@
}

generate_doc::__main $*
