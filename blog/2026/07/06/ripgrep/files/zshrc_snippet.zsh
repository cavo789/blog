export RIPGREP_CONFIG_PATH="$HOME/.ripgreprc"

# If you don't already have such loop...
# Load custom ZSH functions from ~/.zsh/fns/
for fn_file in ~/.zsh/fns/*.zsh; do
    source "${fn_file}"
done

# Type-specific shortcuts
alias rgp='rg --type php'
alias rgj='rg --type js'
alias rgt='rg --type ts'
alias rgm='rg --type md'
alias rgy='rg --type yaml'
alias rgb='rg --type sh'
alias rgd='rg --glob "Dockerfile*" --glob "*.dockerfile"'
