# 0091 — Déploiement non atomique : aucun retour arrière possible

- **Priority**: Medium
- **Batch**: deploy-pipeline
- **Depends**: —
- **Files**: `.github/workflows/deploy.yml`

## Problème

Le workflow rsync écrit directement dans la racine web de production, fichier par fichier.
Deux conséquences distinctes.

**Pendant le transfert, le site est incohérent.** La mise en ligne dure ~12 s (mesuré le
2026-08-18). Un visiteur qui charge une page pendant cette fenêtre peut recevoir un HTML neuf
qui référence un chunk JS pas encore arrivé, ou l'inverse. rsync rend chaque fichier atomique
individuellement (écriture dans un temporaire puis `rename`), mais pas **l'ensemble**. À notre
trafic le risque pratique est faible ; il n'est pas nul, et il grandit avec l'audience.

**Après le transfert, il n'y a pas de marche arrière.** Si un déploiement publie un site cassé
— une régression de composant qui passe le build, une image manquante, un article publié par
erreur — la seule issue est de corriger et de repousser, soit un nouveau cycle build + transfert
d'environ 100 s pendant lequel la production reste cassée. Aucune commande ne remet la version
précédente en ligne, parce qu'elle n'existe plus nulle part : rsync l'a écrasée.

C'est le dernier vrai manque architectural du pipeline, identifié le 2026-08-18 après la
migration FTP → SSH.

## Solution

Le motif standard est le déploiement par bascule de lien symbolique :

1. rsync vers `releases/<sha-du-commit>/` au lieu de la racine web ;
2. une fois le transfert **terminé et vérifié**, basculer un symlink `www -> releases/<sha>` ;
3. conserver les N dernières releases, purger au-delà.

La mise en ligne devient instantanée (un `rename` de symlink, atomique au niveau du noyau) et le
retour arrière consiste à refaire pointer le symlink sur la release précédente — une seconde,
sans rebuild.

### Points à trancher pendant l'implémentation

- **L'hébergeur autorise-t-il une racine web qui soit un symlink ?** C'est le prérequis
  bloquant. À vérifier avant tout développement : créer `~/test-target/`, faire
  `ln -s ~/test-target ~/test-link`, et confirmer qu'Apache suit le lien (option `FollowSymLinks`).
  Si la racine est figée par le panneau de contrôle, ce TODO devient sans objet et il faudra
  se rabattre sur une sauvegarde de la release précédente pour rollback seul.
- **Interaction avec `rrsync`.** La clé de déploiement est confinée à un seul dossier par
  `command="rrsync -wo /home/<user>/www"`. Le confinement devra viser le parent de `releases/`,
  et la bascule du symlink ne peut pas être faite par rsync — il faudrait soit une seconde clé
  avec une commande forcée dédiée, soit un script côté serveur déclenché autrement.
  **C'est le vrai point dur** : autoriser la bascule sans réouvrir un shell.
- **Coût disque.** Chaque release pèse ~166 Mo. Garder 3 releases = ~500 Mo. À valider contre
  le quota de l'hébergement.
- **Interaction avec `--delete` ciblé** (passes `assets/` et `pagefind/`) : avec des releases
  isolées, le nettoyage d'orphelins disparaît de lui-même, chaque release étant complète. Mais
  chaque release devient alors un transfert complet et non plus un delta — ce qui annule le
  gain de 1,76 Mo/déploiement obtenu le 2026-08-18. Piste : `rsync --link-dest` vers la release
  précédente, qui matérialise la nouvelle release en hardlinks et ne transfère que les
  différences. À vérifier : `--link-dest` est-il dans la liste blanche de `rrsync` ? (Il y est
  sous la forme `'link-dest' => 2` — donc autorisé avec vérification de l'argument.)

## Risque

Le risque principal est de casser un pipeline qui fonctionne parfaitement pour un bénéfice
partiellement théorique. La fenêtre d'incohérence de 12 s n'a jamais causé de problème observé,
et le besoin de rollback ne s'est jamais présenté depuis la mise en place.

À l'inverse, le jour où il se présentera, il se présentera mal — typiquement un vendredi soir
avec un article fraîchement publié. Le coût de l'implémentation est à payer à froid.

**Ne pas entamer ce chantier tant que le pipeline actuel n'a pas quelques semaines de
fonctionnement stable derrière lui.**

## Acceptance

- Un déploiement met le site à jour sans qu'aucune requête ne voie un état mixte.
- Une commande documentée remet la release précédente en ligne en moins de 5 s, sans rebuild.
- Le transfert incrémental reste de l'ordre de quelques Mo par déploiement.
- La clé de déploiement ne permet toujours ni shell, ni lecture, ni écriture hors périmètre
  (les trois tests du 2026-08-18 doivent continuer à échouer).
