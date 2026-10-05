# .devcontainer/scripts/helpers/anythingllm.sh
#
# Category "AnythingLLM" — indexing and querying the two workspaces.
#
# Sourced by ../interactive.sh — no shebang, never executed directly.
# shellcheck shell=bash

# @cat AnythingLLM
# @cmd ai-index
# @desc Push new/modified posts to the AnythingLLM 'blog' workspace
function ai-index() {
    .scripts/anythingllm-index.sh "$@"
}

# @cat AnythingLLM
# @cmd ai-search
# @desc Query the AnythingLLM 'blog' workspace, manual only (ai-search which articles cover docker?)
function ai-search() {
    .scripts/anythingllm-search.sh "$@"
}

# Ranking only — no chat model, no answer to wait for: which articles are closest in meaning
# to a topic, an idea, or another article. /suggestions-add calls the same script to catch an
# idea already covered under another name.
#
# @cat AnythingLLM
# @cmd ai-related
# @desc Articles closest in meaning to a text or --post <article> (ai-related "trivy image scan")
function ai-related() {
    node scripts/ai-related.mjs "$@"
}

# The French corpus lives in its own workspace: mixing two languages in one
# vector space degrades retrieval in both. Four variables have to agree —
# workspace, source tree, URL prefix and state file — which is exactly the
# kind of thing you get wrong when typing it by hand.
#
# @cat AnythingLLM
# @cmd ai-index-fr
# @desc Push translated posts to the AnythingLLM 'blog-fr' workspace
function ai-index-fr() {
    ANYTHINGLLM_WORKSPACE=blog-fr \
        BLOG_DIR=i18n/fr/docusaurus-plugin-content-blog \
        SITE_URL=https://www.avonture.be/fr \
        STATE_FILE=.anythingllm-indexed-fr \
        .scripts/anythingllm-index.sh "$@"
}

# @cat AnythingLLM
# @cmd ai-search-fr
# @desc Query the AnythingLLM 'blog-fr' workspace, manual only (ai-search-fr quels articles parlent de docker ?)
function ai-search-fr() {
    ANYTHINGLLM_WORKSPACE=blog-fr \
        BLOG_DIR=i18n/fr/docusaurus-plugin-content-blog \
        SITE_URL=https://www.avonture.be/fr \
        .scripts/anythingllm-search.sh "$@"
}
