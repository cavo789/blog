#!/usr/bin/env bash
# Converts documents to Markdown using the isolated docling Docker image, with
# GPU acceleration when the NVIDIA container runtime is available. Unlike
# md-convert, docling writes "<basename>.md" directly into the current directory
# rather than to stdout — the source format is auto-detected from the extension.
#
# The image already carries its layout, table, OCR and VLM models, so there is
# nothing to download here and nothing to persist between runs.
#
# --pipeline vlm is the slow, accurate path: it reads the page the way a human
# would instead of stitching text fragments, which is what keeps paragraphs and
# titles intact. Pass "--pipeline standard" as an extra argument for the fast
# one. --pdf-backend only applies to the standard pipeline, where the default
# ("threaded_docling_parse") drops the last line of every paragraph; pypdfium2
# rebuilds the text correctly and gives the cleanest spacing of the backends.
#
# --image-export-mode referenced overrides docling's own default ("embedded"),
# which inlines every picture as a base64 data: URI and bloats the Markdown.
# "referenced" writes them as PNG files in "<basename>_artifacts/" instead, and
# the links stay relative because of "--output ." below.
set -euo pipefail

if [[ $# -eq 0 ]]; then
    echo "Usage: docling-convert <file> [extra docling options]" >&2
    exit 1
fi

# True when "$1" is already among the extra options, either bare or as "--opt=value".
has_arg() {
    local needle="$1" arg
    shift
    for arg in "$@"; do
        [[ "${arg}" == "${needle}" || "${arg}" == "${needle}="* ]] && return 0
    done
    return 1
}

# Printed under the result of every PDF conversion, because the moment you want
# the flag list is the moment you have just read a disappointing file and are
# about to run the command again. Options already on the command line drop off
# the list, so a second attempt never suggests what it is already doing. PDFs
# only: on the other four formats none of these flags changes anything.
print_tip() {
    [[ "${DOCLING_CONVERT_NO_TIP:-}" == "1" ]] && return 0
    [[ "${1,,}" == *.pdf ]] || return 0

    local -a tips=()
    has_arg --pipeline "${@:2}" || tips+=("--pipeline standard (faster, rougher on titles)")
    has_arg --image-export-mode "${@:2}" || tips+=("--image-export-mode placeholder|embedded (drop the images, or inline them)")
    has_arg -v "${@:2}" || tips+=("-v (the full log)")
    ((${#tips[@]} == 0)) && return 0

    local joined
    joined="$(printf '%s, ' "${tips[@]}")"
    echo "💡 Not happy with the result? Run it again with ${joined%, }." >&2
    echo "💡 Hide this hint with DOCLING_CONVERT_NO_TIP=1." >&2
}

# Without the NVIDIA container runtime, "docker run --gpus all" fails outright;
# skip the flag and let "--device auto" settle on the CPU instead.
gpu_args=()
if docker info --format '{{json .Runtimes}}' 2>/dev/null | grep -q '"nvidia"'; then
    gpu_args+=(--gpus all)
else
    echo "docling-convert: no NVIDIA container runtime detected, converting on CPU" >&2
fi

# Triton compiles a shared library on first use and then has to load it, which a
# noexec filesystem forbids. Rather than loosen /tmp, give it 256 MB of its own
# that allows execution — and nothing else.
#
# That tmpfs doubles as HOME. The container runs under the caller's UID, which
# has no entry in /etc/passwd, so HOME would otherwise be empty: PyTorch then
# resolves its kernel cache to "//.cache/torch/kernels", fails to create it, and
# recompiles its CUDA kernels on every single run.
#
# --quiet drops the two dozen INFO lines Docling logs per run, leaving warnings
# and errors. It is not a dead end: Docling ignores --quiet as soon as -v is
# given, so "docling-convert file.pdf -v" still brings the whole log back.
#
# The awk filter handles what --quiet cannot. In 2.127.0, VlmConvertModel.__del__
# logs through a module global that Python has already torn down by the time it
# runs, so every VLM conversion ends on an "Exception ignored in" traceback —
# after the Markdown has been written, and with the exit code still 0. It is
# noise, not a failure. The rule below drops that one block, keyed on its exact
# first line, and passes everything else through. Delete it when upstream fixes
# __del__; it is pinned to a version for exactly that reason.
start=${SECONDS}
set +e
docker run --rm \
    "${gpu_args[@]}" \
    -v "${PWD}:/workspace:cached" \
    --read-only \
    --tmpfs /tmp:size=512m,noexec,nosuid \
    --tmpfs /run:size=16m \
    --tmpfs /cache:size=256m,exec,nosuid \
    -e HOME=/cache \
    -e TRITON_CACHE_DIR=/cache/triton \
    --cap-drop ALL \
    --security-opt no-new-privileges:true \
    -u "$(id -u):$(id -g)" \
    docling convert "$1" \
        --to md \
        --device auto \
        --pipeline vlm \
        --pdf-backend pypdfium2 \
        --image-export-mode referenced \
        --output . \
        --quiet \
        "${@:2}" 2>&1 | awk '
            /^Exception ignored in: <function VlmConvertModel\.__del__/ { skip = 1; n = 0; next }
            skip { n++; if (/^AttributeError: / || n >= 8) skip = 0; next }
            { print }
        ' >&2
status=${PIPESTATUS[0]}
set -e

# In referenced mode docling creates "<basename>_artifacts/" for every run, even
# for a document without a single picture in it. rmdir only succeeds on an empty
# directory, so this clears the stray folders and can never touch one that holds
# actual images.
artifacts="$(basename "${1%.*}")_artifacts"
if [[ -d "${artifacts}" ]]; then
    rmdir "${artifacts}" 2>/dev/null || true
fi

# Docling no longer announces what it produced, so the wrapper does — one line,
# with the elapsed time, because the whole point of the pipeline choice above is
# the trade it makes against the clock.
if [[ ${status} -eq 0 ]]; then
    echo "docling-convert: $(basename "${1%.*}").md written in $((SECONDS - start))s" >&2
fi

print_tip "$@"

exit "${status}"
