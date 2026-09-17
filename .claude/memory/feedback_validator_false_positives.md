---
name: feedback_validator_false_positives
description: "Les checks du validateur de traduction matchent des mots, pas des sens — homographes FR/EN et match par préfixe sont les deux pièges"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7e563f95-d014-4ebd-a931-12af69097c68
  modified: 2026-09-17T13:11:00.738Z
---

Les checks 7/8/11 de `scripts/lib/translate-validate.mjs` décident « c'est de l'anglais » ou
« c'est une sur-traduction » **par motif textuel, jamais par sens**. Deux pièges structurels, les
deux rencontrés le 2026-09-17 :

- **Homographe FR/EN.** `an` (article anglais) = `an` (année). « de plus d'**un an** » rejeté comme
  de l'anglais. Corrigé : `an` sorti de la liste de mots-outils, matché séparément par la propriété
  qui définit l'article anglais — voyelle juste après, pas de mot de compte juste avant.
- **Match par préfixe.** `hasWord` construit `\bmot` **sans `\b` final** — volontaire, c'est ce qui
  fait que `conteneur` attrape `conteneurs` sans lister les pluriels. Mais `jeton` attrapait alors
  « **Jetons** un œil » (verbe *jeter*). Corrigé par une `BANNED_OVERRIDES` qui ne remplace le
  matcher que pour ces termes-là : le nom « jetons » porte toujours un déterminant ou un compte
  devant, le verbe jamais.
- **Paire de cohérence sur un mot polysémique.** `["commit", "validation"]` retirée : « validation »
  au sens de validation de données n'a rien à voir avec git. `BANNED_FRENCH` garde
  « validation de code », qui nomme le sens git sans ambiguïté. Pièges latents du même type
  restants : `["build", "compilation"]`, `["cache", "antémémoire"]`.

**Why:** un faux positif du validateur ne se voit pas comme un bug — il se voit comme une
traduction ratée, et pousse à repayer une relance qui échouera à l'identique, indéfiniment.

**How to apply:** avant de conclure qu'une traduction est mauvaise, lire le **contexte** du mot
incriminé dans le dump. Un motif qui accuse du français manifestement correct est un bug du
check, pas du modèle. Tout nouveau mot ajouté à `BANNED_FRENCH` ou `CONSISTENCY_PAIRS` doit être
testé contre son homographe et contre ses formes verbales.

Voir [[project_translation_rejects]] pour le workflow de récupération des dumps.
