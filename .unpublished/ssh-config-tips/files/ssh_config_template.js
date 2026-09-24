// Handlebars template for the SSH config generator in the ssh-config-tips article.
// Kept in a separate .js file so SSH comments (# ...) don't trigger markdownlint
// rules when scanned inside the .md file.

export const sshConfigTemplate = `{{#if vmIp}}# 1. Bastion — no ProxyJump, no IdentityFile
Host {{vmIp}}
    User {{vmUser}}

{{/if}}{{#each domains}}{{#if @first}}# {{#if ../vmIp}}2{{else}}1{{/if}}. Domain defaults — in effect when connecting via full FQDN only
{{/if}}Host {{domain}}
    User {{user}}
{{/each}}# {{#if vmIp}}3{{else}}{{#if domains}}2{{else}}1{{/if}}{{/if}}. Short aliases
{{#each servers}}
Host {{lower ../projectName}}_{{environment}}_app
    RequestTTY yes
    RemoteCommand sudo -u {{appUser}} bash -c "cd {{appDir}} && exec bash -l"

Host {{lower ../projectName}}_{{environment}} {{lower ../projectName}}_{{environment}}_app
    HostName {{hostname}}
    User {{globLookup hostname ../domains "domain" "user" ../userB}}

{{/each}}# {{#if vmIp}}4{{else}}{{#if domains}}3{{else}}2{{/if}}{{/if}}. Global defaults — fallback for {{#if vmIp}}every host except the bastion{{else}}every host{{/if}}
Host *{{#if vmIp}} !{{vmIp}}{{/if}}
{{#if vmIp}}    ProxyJump {{vmUser}}@{{vmIp}}
{{/if}}    IdentityFile ~/.ssh/{{sshKey}}

    # Optional — prevent silently-dropped idle connections
    ServerAliveInterval 30
    ServerAliveCountMax 3`;
