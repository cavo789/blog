# Coding conventions

- Target PowerShell 7+ (`pwsh`), never Windows PowerShell 5.1.
- Start every script with `Set-StrictMode -Version Latest` and `$ErrorActionPreference = 'Stop'`.
- Use approved verbs for function names (`Get-`, `Export-`, `Read-`...).
- Never hardcode a path: everything comes from `photos.config.json`.
- Write CSV files with `Export-Csv -NoTypeInformation -Encoding utf8`.
- One function per responsibility; the main block only orchestrates.
