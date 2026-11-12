# 0146 — devcontainer.json : thème clair imposé au lieu d'un profil VS Code personnel

- **Priority**: Low
- **Batch**: devcontainer-config
- **Depends**: —
- **Files**: `.devcontainer/devcontainer.json`

## Problème

`customizations.vscode.settings` impose `"workbench.colorTheme": "Visual Studio Light"` (et des extensions de confort comme `Tyriar.luna-paint`). C'est un goût personnel, que l'article `.unpublished/devcontainer-tips` (astuces 8 et 9) recommande justement de mettre dans un profil VS Code « Devcontainer » plutôt que dans le fichier du projet.

## Risque

Aucun en solo ; incohérence entre ce que l'article prône et ce que le blog fait, visible par tout lecteur qui ouvre le dépôt.

## Solution

Créer le profil VS Code `Devcontainer` sur le poste (thème clair, extensions de confort), l'associer au workspace, puis retirer `workbench.colorTheme` (et trier les extensions : équipe vs confort) du `devcontainer.json`. Garder `window.title` avec `[DevContainer]`, qui n'impose aucun goût.
