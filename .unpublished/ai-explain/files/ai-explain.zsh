# ai-explain — explain a script, error, or piped output in plain English
#
# Usage:
#   ai-explain script.sh          # explain a script file
#   ai-explain error.txt          # explain a text file (stack trace, log, etc.)
#   cat error.log | ai-explain    # pipe any output
#   ./failing-command 2>&1 | ai-explain   # pipe command output + stderr
#
# Registers as: ai explain  (via the AI_COMMANDS dispatcher)

AI_COMMANDS[explain]="Explain a script or error output in plain English"
AI_PARAMS[explain]="file"

ai-explain() {
    local input

    # Priority 1: piped input
    if [[ ! -t 0 ]]; then
        input=$(cat)
    # Priority 2: file argument
    elif [[ -n "$1" ]]; then
        if [[ ! -f "$1" ]]; then
            echo "ai-explain: file not found: $1" >&2
            return 1
        fi
        input=$(cat "$1")
    # Priority 3: interactive text argument (useful for quick one-liners)
    elif [[ $# -gt 0 ]]; then
        input="$*"
    else
        print -P "%F{yellow}Usage:%f"
        print "  ai-explain <file>                    — explain a file"
        print "  command 2>&1 | ai-explain            — explain command output"
        print "  ai-explain 'error: undefined symbol' — explain an inline message"
        return 0
    fi

    if [[ -z "$input" ]]; then
        echo "ai-explain: empty input — nothing to explain" >&2
        return 1
    fi

    _ollama_check || return 1

    local prompt="You are a helpful assistant that explains technical content in plain English.

Look at the content below and:
- If it is a script (bash, zsh, python, php, etc.): explain what it does step by step. Mention what it produces, what it modifies, and any side effects or risks.
- If it is an error message, stack trace, or log output: explain what went wrong, why it happened, and what to do to fix it.
- If you are not sure: describe what you see and give your best interpretation.

Keep the explanation concrete and practical. No hype, no filler. If there is a fix, give the exact command or change.

---
${input}"

    _ollama_query "$prompt"
}
