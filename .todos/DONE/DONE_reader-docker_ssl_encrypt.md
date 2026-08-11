# Reader review : docker_ssl_encrypt

**Détecté :** 2026-08-11
**Article :** blog/2023/12/04/docker_ssl_encrypt/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **85 %** (preuve ligne 83 sur un corps de 68 lignes, `<!-- truncate -->` l. 25).
Drapeaux : **abstraction-avant-preuve** — deux blocs `<ProjectSetup>` demandant la création de
quatre scripts (`encrypt.sh`, `decrypt.sh` l. 31-34 ; `encrypt.cmd`, `decrypt.cmd` l. 44-47)
avant qu'un seul octet chiffré ne soit montré.
Redondance : 🟢 — le contenu ne se répète pas, c'est un problème d'ordre pur.

Test des 30 secondes : **j'abandonne** — la première chose que l'article me demande, deux lignes
après le truncate, c'est de créer quatre fichiers de script et d'y éditer un mot de passe. Rien
ne m'a encore montré à quoi ressemble un fichier chiffré, ni combien de temps ça prend.

## Risque

La démonstration existe déjà et elle est excellente : `secrets.md` en clair (mots de passe FTP,
URL d'admin) devient un bloc Base64 de cinq lignes. C'est la paire avant/après idéale — et elle
est reléguée à la toute dernière section, `## Example` (l. 79-93), après un tableau d'options
`openssl` que personne ne lit avant d'avoir vu le résultat.

L'article se termine aussi sans atterrissage : la dernière phrase est une redite mécanique
(« By running that command […] you'll get a newer one called `secrets_decrypted.md` »), pas une
retombée ni un lien de sortie.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | « Vous voulez chiffrer un fichier. Quel logiciel installer ? Aucun, sauf Docker. » — inchangé | l. 21-23 |
| 2. La preuve | Nouvelle section `## What this looks like` : `secrets.md` en clair, puis `secrets_encrypted.md`, séparés par la seule commande `docker run … alpine/openssl enc …` extraite de `encrypt.sh`. La paire avant/après devient visible dans le premier écran. | `<Snippet>` l. 83 et l. 87 + phrases l. 81, 85 |
| 3. Pourquoi ça marche | Trois puces sans code : AES-256-CBC + PBKDF2 + sel, l'image `alpine/openssl` ne laisse rien sur la machine, le fichier chiffré est du Base64 donc commitable tel quel. | déduit de l. 23 et du tableau l. 61-71 |
| 4. Les scripts | `## The scripts` — Linux d'abord, DOS ensuite, les deux `<ProjectSetup>` inchangés, avec la note « mettez à jour `MY_PASSWORD` ». Les variantes DOS (mot de passe demandé, sortie console) dans un `<Details>` : c'est une plateforme sur deux. | l. 27-47 |
| 5. Variante utile | `## Decrypt on the console, don't write a file` — inchangée, elle apporte un fait neuf (retirer `-out`). | l. 73-77 |
| 6. Cas d'usage + garde-fou | `## Use case` et l'AlertBox « Encrypting is not enough » (lien vers git-precommit) — inchangés. | l. 49-55 |
| 7. Sous le capot (facultatif) | `## The openssl arguments (skip this if you just want to use it)` — le tableau des options. C'est de la référence, pas de la narration : il doit être signalé comme tel. | l. 57-71 |
| 8. Atterrissage | `## Conclusion` : ce qu'on a gagné (des secrets chiffrés sans rien installer), et le pas suivant — remplacer les trois dernières phrases mécaniques (l. 89-93) par un vrai renvoi. | à écrire, remplace l. 89-93 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
