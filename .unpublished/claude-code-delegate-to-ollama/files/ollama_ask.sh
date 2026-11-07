#!/usr/bin/env bash
# Ask a local Ollama model one question about one file; write the answer to a file.
#
# Usage: ollama_ask.sh <model> <instruction> <input-file|-> <output-file>
#
# Only one line of statistics goes to stdout (tokens in/out, seconds), so the
# caller (Claude Code) reads the answer only when, and as much as, it needs.
# OLLAMA_URL overrides the server (default: the host seen from a devcontainer).
# OLLAMA_TIMEOUT caps the wait in seconds (default 180).
# OLLAMA_MAX_TOKENS caps the answer (default 4096): some models loop forever
# on a long input (measured: qwen3-coder repeated one line until the timeout).

set -o errexit -o nounset -o pipefail

readonly OLLAMA_URL="${OLLAMA_URL:-http://host.docker.internal:11434}"
readonly OLLAMA_TIMEOUT="${OLLAMA_TIMEOUT:-180}"
readonly OLLAMA_MAX_TOKENS="${OLLAMA_MAX_TOKENS:-4096}"

main() {
	if [[ $# -ne 4 ]]; then
		echo "Usage: ${0##*/} <model> <instruction> <input-file|-> <output-file>" >&2
		return 2
	fi
	local -r model="$1" instruction="$2" input="$3" output="$4"
	local body
	body="$(jq --null-input --arg model "${model}" --arg system "${instruction}" \
		--argjson max "${OLLAMA_MAX_TOKENS}" \
		--rawfile prompt "${input/#-//dev/stdin}" \
		'{model: $model, system: $system, prompt: $prompt, stream: false,
		  think: false, options: {temperature: 0, num_ctx: 32768, num_predict: $max}}')"
	local reply
	if ! reply="$(curl --silent --show-error --fail --max-time "${OLLAMA_TIMEOUT}" \
		--header 'Content-Type: application/json' --data "${body}" \
		"${OLLAMA_URL}/api/generate")"; then
		echo "ollama_ask: no answer from ${OLLAMA_URL} within ${OLLAMA_TIMEOUT} s" >&2
		return 1
	fi
	jq --raw-output '.response' <<<"${reply}" >"${output}"
	jq --raw-output --arg out "${output}" \
		'"\(.model): \(.prompt_eval_count // 0) tokens in, \(.eval_count // 0) out, \(((.total_duration // 0) / 1e9 * 10 | round) / 10) s -> \($out)"' \
		<<<"${reply}"
	if [[ "$(jq --raw-output '.done_reason' <<<"${reply}")" == "length" ]]; then
		echo "ollama_ask: answer cut at ${OLLAMA_MAX_TOKENS} tokens (a loop?): check it" >&2
	fi
}

main "$@"
