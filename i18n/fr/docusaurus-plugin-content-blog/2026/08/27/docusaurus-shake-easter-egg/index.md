---
slug: docusaurus-shake-easter-egg
title: "Secouez votre téléphone, surprenez le suricate"
authors: [christophe, claude]
image: /img/v2/shaked_meerkat.webp
mainTag: docusaurus
tags: [docusaurus, react, component]
date: 2026-08-27
description: "Un neuvième easter egg pour ce blog, pensé pour les lecteurs sur téléphone : secouez-le — dans Chrome ou dans la PWA installée — et la mascotte suricate prend tout l'écran, surprise, pendant environ deux secondes. On y parle du calcul du « jerk » via devicemotion derrière la détection de secousse, de l'animation de l'overlay en trois phases, de la façon de tester le tout depuis une console DevTools sur desktop sans le moindre accéléromètre, et d'un vrai bug découvert en chemin : un générateur d'images IA qui a dessiné le damier censé représenter la transparence sous forme de pixels réellement opaques au lieu d'un vrai canal alpha."
language: fr
ai_assisted: true
series: Creating Docusaurus components
blueskyRecordKey: 3mu2ayngsmc2s
---

<!-- cspell:ignore devicemotion accelerationIncludingGravity avonture RGBA meerkat's -->

![Secouez votre téléphone, surprenez le suricate](/img/v2/shaked_meerkat.webp)

<TLDR>
Ce blog cache déjà [huit petits easter eggs](/blog/docusaurus-easter-eggs), mais chacun d'eux suppose un clavier ou un panneau DevTools ouvert — inutile pour un lecteur sur téléphone. En voici un neuvième : secouez le téléphone et la mascotte apparaît en plein écran, surprise, pendant environ deux secondes. Au programme : le calcul de la détection de secousse (un seuil de « jerk » calculé entre deux échantillons `devicemotion` consécutifs), l'animation de l'overlay en trois phases (apparition, tremblement, disparition), comment la déclencher et la tester depuis une console DevTools sur desktop sans aucun accéléromètre, et un vrai bug découvert en chemin : un générateur d'images IA qui a dessiné le damier utilisé pour *représenter* la transparence sous forme de pixels réellement opaques, repéré en lisant les octets bruts du PNG plutôt qu'en se fiant à un aperçu. **Android uniquement**, délibérément et définitivement — la demande de permission de mouvement d'iOS Safari exige un tap, et toutes les façons d'en fournir un entrent en conflit avec la règle « invisible jusqu'à ce que vous tombiez dessus » que ce site applique à ses easter eggs.
</TLDR>

Jusqu'ici, chaque easter egg de ce blog suppose un clavier : <kbd>CTRL</kbd>+<kbd>U</kbd> pour afficher la source, une séquence Konami à dix touches, un `console.log` qui n'apparaît qu'avec les DevTools ouverts. Tout à fait raisonnable sur un portable — et invisible pour qui lit sur un téléphone, ce qui, sur un blog technique, représente encore une part non négligeable du trafic. Un téléphone n'a pas de touches fléchées, mais il a quelque chose qu'un portable n'a pas : un accéléromètre, à un `window.addEventListener("devicemotion", …)` de distance, sur n'importe quelle page servie en HTTPS.

Donc : secouez le téléphone, et la mascotte réagit.

<!-- truncate -->

## Secouez votre téléphone et voyez ce qui se passe {#shake-your-phone-see-what-happens}

Visitez ce blog sur Android — dans Chrome, ou dans la PWA installée — et secouez vraiment le téléphone. Voici ce qui apparaît, en plein écran, pendant environ deux secondes :

<BrowserWindow url="https://www.avonture.be/">
  ![Un suricate surpris qui remplit l'écran après une secousse du téléphone](./images/shake_overlay.webp)
</BrowserWindow>

Pas de rechargement de page, rien à activer d'abord — le capteur de mouvement du téléphone a fait tout le travail. Voici le peu de code que ça demande réellement.

<AlertBox variant="tip" title="Rien ne se passe quand vous secouez ?">
Vérifiez que ce site est autorisé à lire les **capteurs de mouvement** — tapez sur l'icône à gauche de la barre d'adresse → Autorisations. Chrome pour Android peut bloquer ça silencieusement site par site ; voyez [Comment débugger si la secousse ne fait rien](#how-to-debug-if-the-shake-does-nothing) plus bas.
</AlertBox>

## Pourquoi ça fonctionne {#why-it-works}

- **La détection de secousse a besoin d'un seul nombre, pas de trois.** Un événement `devicemotion` rapporte l'accélération sur trois axes (x, y, z) ; comparer chacun à un seuil fonctionne à peine, parce qu'une manipulation ordinaire fait déjà osciller les trois en permanence. Ce qui marque réellement une secousse volontaire, c'est *la vitesse à laquelle* ces trois valeurs changent entre deux relevés consécutifs — sommée sur les axes et normalisée par le temps écoulé entre les échantillons, elle se réduit à une seule valeur de « jerk » avec un unique seuil propre à régler.
- **Android n'a pas de prompt `requestPermission()` ; iOS, si.** Résultat : livré uniquement pour Android — délibérément, pas temporairement ; voyez [pourquoi](#why-ios-is-left-out-on-purpose) plus bas. Le fonctionnement des permissions d'Android a de toute façon sa propre subtilité, détaillée dans [Comment débugger si la secousse ne fait rien](#how-to-debug-if-the-shake-does-nothing).
- **C'est un cooldown, pas un booléen, qui empêche le redéclenchement.** L'overlay reste à l'écran plus de deux secondes ; sans un écart minimum entre deux déclenchements, la fin du même geste de secousse le relancerait immédiatement. Comparer des timestamps est plus simple qu'un verrou, et ça ne peut pas rester bloqué en position « actif » si une étape de nettoyage est un jour sautée.
- **C'est un seul composant, monté une seule fois, globalement** — [le même pattern que celui déjà utilisé pour le code Konami et le changement de favicon au changement d'onglet](/blog/docusaurus-easter-eggs) : pas de nouvelle route, pas de câblage page par page, une ligne de plus dans `Root.js`.
- **La vibration haptique est un bonus, pas une exigence.** Un court appel à `navigator.vibrate()` ajoute un « cri » physique au « cri » visuel — et sur les navigateurs qui l'ignorent silencieusement en dehors d'un geste utilisateur (ce qu'un événement de capteur n'est pas), l'easter egg fonctionne très bien, juste sans la vibration.

## Pourquoi iOS est volontairement laissé de côté {#why-ios-is-left-out-on-purpose}

iOS Safari 13+ exige un appel explicite à `DeviceMotionEvent.requestPermission()`, lié à un vrai tap, avant de livrer le moindre relevé `devicemotion` — et cet appel ne peut pas être fait de façon proactive au chargement de la page. Quelque chose doit le déclencher, ce qui laisse exactement deux options, toutes deux rejetées.

La première est un contrôle visible : un petit bouton ou bandeau « Activer les effets de secousse », affiché une fois sur iOS. Ça fonctionnerait — mais ce serait aussi le premier élément d'interface de tout ce blog qui existe uniquement pour demander quelque chose avant que le lecteur ait fait quoi que ce soit pour le mériter. Tous les autres easter eggs ici suivent une règle, énoncée noir sur blanc dans l'article qui présentait les huit premiers :

<AlertBox variant="note" title="La règle à laquelle ce blog soumet chaque easter egg">
Chaque easter egg vit dans la console, dans la source, dans les en-têtes de réponse, ou dans un état que le visiteur déclenche volontairement. Aucun n'apparaît jamais dans le flux de lecture normal. **Si vous ne le cherchez pas, vous ne le verrez jamais.**
</AlertBox>

Un bouton demandant l'accès au capteur de mouvement casse ça à vue, pour chaque visiteur iOS, qu'il se soucie ou non d'un suricate secoué — un coût payé d'avance par 100 % d'entre eux, pour une récompense que seule une minorité curieuse déclencherait. C'est un mauvais échange avant même d'être un choix de design.

La seconde option est pire d'une autre manière : supprimer le bouton visible et déclencher `requestPermission()` au tout premier tap du visiteur n'importe où sur la page — un lien de navigation, une icône de recherche, peu importe. Techniquement invisible dans l'interface de *ce* site, puisque rien de rendu par ce composant n'apparaîtrait — mais iOS affiche quand même sa propre boîte de dialogue système « Autoriser l'accès aux mouvements et à l'orientation ? » la première fois que l'appel est fait pour une origine. Un lecteur qui a tapé sur un élément de menu se voit interrompu par une demande d'autorisation, sans aucun contexte expliquant pourquoi un blog l'interroge soudain sur les capteurs de mouvement. Ce n'est pas la surprise amusante que ce site recherche ; c'est un non-sens qui dégrade la toute première interaction d'une visite sans rapport.

Les deux chemins dépensent quelque chose qui appartient à tous les visiteurs — l'attention, la confiance, ou un premier tap propre — pour financer une fonctionnalité que seuls certains voudraient. Un easter egg gagne son droit d'exister en ne coûtant rien à tous ceux qui ne le cherchent pas ; une demande d'autorisation, sous n'importe quelle forme, échoue à ce test avant même que le suricate ait une chance de surprendre. Android ne demandait rien, donc c'est sur Android que ça sort. iOS reste dehors, non pas parce que le code est difficile, mais parce que chaque façon de le rendre possible là-bas fait payer un loyer à un lecteur venu ici pour lire, pas pour accorder des permissions.

## Installation {#installation}

Le tout tient en deux fichiers plus un import. En partant d'une image à fond transparent de la mascotte surprise — plus de détails sur la façon dont cette image a réellement été produite, et sur l'erreur qui a failli passer en production, dans [Sous le capot](#under-the-hood-skip-this-if-you-just-want-to-use-it) plus bas — la détection et l'overlay vivent entièrement dans `index.tsx` :

<Snippet filename="src/components/ShakeEasterEgg/index.tsx" source="src/components/ShakeEasterEgg/index.tsx" />

Et l'overlay plein écran, son animation apparition/tremblement/disparition, ainsi que le repli `prefers-reduced-motion` vivent dans le module CSS :

<Snippet filename="src/components/ShakeEasterEgg/styles.module.css" source="src/components/ShakeEasterEgg/styles.module.css" defaultOpen={false} />

Monté une fois, globalement, depuis `src/theme/Root.js` — juste à côté du composant du code Konami dont il emprunte la forme :

```jsx title="src/theme/Root.js (excerpt)"
import ShakeEasterEgg from "@site/src/components/ShakeEasterEgg";

// ...

return (
  <>
    {children}
    <KonamiEasterEgg />
    <ShakeEasterEgg />
  </>
);
```

C'est tout — pas de nouvelle route, pas de flag de configuration, pas d'étape de build.

## Tester sans rien secouer {#testing-it-without-shaking-anything}

Se lever de son bureau pour secouer physiquement un téléphone, vingt fois de suite, pour vérifier un ajustement de timing CSS, lasse très vite. `devicemotion` n'est qu'un événement — rien n'empêche d'en envoyer un de façon synthétique depuis une console de navigateur, sur desktop, sans aucun capteur dans la boucle :

<Snippet filename="Paste in DevTools console" source="./files/test-shake-in-console.js" defaultOpen={false} />

Deux appels, espacés de 150 ms, avec un écart suffisamment grand entre les deux relevés d'accélération pour franchir le seuil de jerk — voilà tout le geste « physique », réduit à deux nombres. C'est aussi, honnêtement, comme ça que la capture d'écran ci-dessus a été produite : un navigateur headless, un viewport mobile, et exactement ce snippet envoyé dans la page — pas un vrai téléphone.

## Comment débugger si la secousse ne fait rien {#how-to-debug-if-the-shake-does-nothing}

Deux vérifications, dans l'ordre — chacune prend moins d'une minute et aucune ne demande de toucher au code.

### 1. Autoriser les capteurs de mouvement pour le site {#1-allow-motion-sensors-for-the-site}

Chrome pour Android a sa propre autorisation **Capteurs de mouvement** par site, indépendante de tout ce que ce composant contrôle. Tapez sur l'icône à gauche de la barre d'adresse (cadenas, « i », ou un triangle d'avertissement si le certificat est auto-signé) → **Autorisations** → assurez-vous que **Capteurs de mouvement** est réglé sur *Autoriser*, pas sur *Bloquer*. Si ça n'y figure pas, vérifiez plutôt **Chrome ⋮ → Paramètres → Paramètres des sites → Capteurs de mouvement** pour un blocage global. Rechargez la page après modification — à elle seule, cette manip était le correctif dont l'unique appareil réel de test avait besoin.

### 2. Observer les données brutes du capteur {#2-watch-the-raw-sensor-data}

Quand l'étape 1 n'explique rien, une petite page de diagnostic autonome règle le reste — pas d'étape de build, pas de configuration de DevTools distants, juste des chiffres en direct sur l'écran du téléphone :

<Snippet filename="static/shake-debug.html" source="static/shake-debug.html" defaultOpen={false} />

Visitez `/shake-debug.html` sur la même origine que le reste du site et la page rapporte, en direct : si `DeviceMotionEvent` existe tout simplement, l'état de `navigator.permissions.query({ name: "accelerometer" })` (`"granted"` / `"denied"` / `"prompt"`), un compteur d'événements reçus, les relevés `x`/`y`/`z` en direct, et la valeur de jerk calculée face au seuil actuel. Trois signatures d'échec distinctes à y lire :

- **Aucun événement, compteur bloqué à 0** — le navigateur ou l'OS bloque totalement le capteur, ou `DeviceMotionEvent` n'est pas supporté (iOS sans le flux de permission, voyez la limitation ci-dessus).
- **Les événements arrivent, mais `x`/`y`/`z` restent à `null`** — c'est l'autorisation Capteurs de mouvement de l'étape 1, confirmée : le navigateur émet l'événement par habitude mais retient les données.
- **De vrais chiffres, mais le jerk maximum ne franchit jamais le seuil** — pas un bug, juste un seuil calibré pour une autre main ; voyez la note de réglage plus bas.

C'est aussi, autant l'admettre franchement, comme ça que le bug de l'étape 1 a été trouvé au départ : la secousse ne faisait rien sur un vrai téléphone, cette page montrait le compteur d'événements grimper avec `x`/`y`/`z` bloqués à `null`, et la requête de permission expliquait exactement pourquoi en un seul mot — `"denied"`.

## Sous le capot (passez si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

### L'image était la partie difficile, pas le code {#the-image-was-the-hard-part-not-the-code}

Le composant lui-même s'est écrit d'un seul jet. Obtenir une **vraie** image à fond transparent du suricate surpris a demandé plus de soin que le code — bon à savoir si vous générez des visuels avec un outil d'image IA pour quoi que ce soit qui doit se composer par-dessus d'autres contenus.

Les visuels de la mascotte du site sont [générés avec Google Gemini](/blog/gemini-meerkat), en fournissant une image de référence existante pour que les nouvelles poses restent visuellement cohérentes. Pour un overlay plein écran, « fond transparent » n'est pas une préférence esthétique, c'est une exigence stricte : le fichier a besoin d'un vrai canal alpha, pas juste de quelque chose qui *paraît* transparent dans un aperçu. Le prompt demandait explicitement un export PNG, avec une ligne indiquant au modèle de ne pas dessiner le damier gris et blanc que les éditeurs utilisent pour *représenter* la transparence comme s'il faisait partie de l'image — ce motif est une convention d'interface, pas des pixels à peindre.

Deux faits liés aux formats rendent le résultat facile à vérifier, plutôt que de se fier à un aperçu :

- Le JPEG ne peut structurellement pas stocker la transparence — un export PNG (ou WebP) est non négociable dès le départ.
- Le chunk `IHDR` d'un PNG porte un octet dédié exactement à ça : `6` signifie RGBA avec un vrai canal alpha, `2` signifie du RGB simple sans alpha. Lire cet octet — ou juste échantillonner un pixel dans un coin et vérifier que son alpha vaut réellement `0` — règle la question sans ouvrir d'éditeur.

Le fichier final a passé les deux contrôles : alpha `6` dans le chunk `IHDR`, coins à alpha `0`, personnage entièrement opaque — vérifié pixel par pixel plutôt qu'à l'œil.

### Régler le seuil de jerk sur un vrai téléphone {#tuning-the-jerk-threshold-on-a-real-phone}

La première valeur livrée pour `SHAKE_JERK_THRESHOLD` (`28`) a été choisie au feeling, avec une note admettant qu'elle n'avait pas été mesurée sur un appareil physique. Elle n'a pas survécu au premier contact : sur un vrai téléphone Android, une simple *inclinaison* — sans aucune secousse — suffisait déjà à la franchir. Une première correction l'a portée à `60`, ce qui a réglé le déclenchement à l'inclinaison — mais une journée entière avec le téléphone porté normalement le déclenchait encore régulièrement, ce que `60` seul n'avait pas révélé en cinq minutes de test. C'est `100` qui a fini par être retenu. Aucune formule ne permet de trouver ça depuis un bureau, et apparemment pas non plus en cinq minutes sur un vrai téléphone ; un seuil de « jerk » doit survivre au port et à la manipulation réels dans le temps, pas seulement à une secousse de test volontaire, avant qu'on puisse lui faire confiance.

## Conclusion {#conclusion}

Un neuvième easter egg, et le premier que ce blog conçoit pour un téléphone plutôt que pour un clavier : une détection de secousse réduite à un seul nombre de « jerk », un overlay plein écran qui respecte `prefers-reduced-motion` et se ferme d'un tap, et une façon de tester tout ça sans quitter son bureau. La vraie leçon n'était pas dans le code de détection — elle était dans le fait de ne pas faire confiance à un aperçu d'image : un fichier peut *paraître* transparent et être totalement opaque, et le seul moyen d'en être sûr est de vérifier les octets.

iOS reste dehors définitivement, [pas par manque d'essais mais par choix](#why-ios-is-left-out-on-purpose), et c'est en soi le rappel à garder : un easter egg n'a qu'à ravir ceux qui le cherchent, et ne jamais rien coûter à ceux qui ne le cherchent pas — une barre sous laquelle une vraie fonctionnalité ne peut pas passer, mais une récompense cachée, si. Si vous faites tourner votre propre blog Docusaurus avec sa mascotte, le [code Konami et le changement de favicon au changement d'onglet](/blog/docusaurus-easter-eggs) sont les cousins desktop de celui-ci — même forme « monté une fois dans `Root.js` », pas de capteur, pas de compromis sur les permissions.

<StepsCard
  variant="remember"
  title="Ce qu'il faut régler"
  steps={[
    "**`SHAKE_JERK_THRESHOLD`** (par défaut `100`, relevé depuis `28` puis `60` après un usage réel où ça se déclenchait trop facilement) — augmentez-le encore si l'easter egg se déclenche toujours trop facilement, baissez-le si une secousse volontaire ne fait rien",
    "**`COOLDOWN_MS`** (par défaut `4000`) — temps minimum entre deux déclenchements",
    "**`VISIBLE_DURATION_MS`** (par défaut `2200`) / **`EXIT_DURATION_MS`** (par défaut `250`) — combien de temps l'overlay reste affiché et à quelle vitesse il disparaît ; gardez la durée CSS `overlay-out` synchronisée avec la seconde",
    "Les quatre se trouvent en haut de `src/components/ShakeEasterEgg/index.tsx`",
  ]}
/>
