---
name: feedback-i18n-translation-rejected
description: "French translation of the blog — rejected 2026-08-31, REOPENED 2026-09-16 with new data; TODO 0119 holds the plan"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 2159350b-e46e-4652-87cb-e112063de1eb
  modified: 2026-09-16T00:00:00.000Z
---

**Statut : rouvert le 2026-09-16.** L'idée avait été rejetée le 2026-08-31 (« les navigateurs
traduisent déjà gratuitement, la double maintenance ne se justifie pas »). L'auteur l'a rouverte
avec des données neuves. Le plan complet vit dans `.todos/DONE/DONE_0119-traduction-francaise-automatique-des-articles.md` (clos le 2026-09-17 ; suite dans `.todos/0124-deploiement-progressif-de-la-locale-fr.md`).

**Ce qui a changé :** trafic mesuré (withcabin, 30 j : France 671 + Belgique 247 uniques ≈ 10-15 %
du lectorat, la langue du navigateur sous-estime) ; le moteur est l'API Claude déjà câblée pour
`generate-eli5.mjs`/`generate-questions.mjs`, pas Ollama ; coût mesuré ≈ 20 $ pour tout le corpus
et < 0,10 $ par article — l'argument financier ne tient pas. Ce qui n'a pas changé : la dérive
permanente entre l'anglais et son miroir français, sur 257 articles.

**How to apply:** ne plus opposer un refus de principe. Trois points durs, **tous vérifiés par
build réel le 2026-09-16**, pas déduits :

1. **Fallback** — Docusaurus retombe sur la source anglaise quand la traduction manque
   (`@docusaurus/utils/lib/dataFileUtils.js:62`). Mesuré : locale `fr` avec 2 traductions sur 257
   → **261 répertoires FR pour 261 EN**. Sans garde-fou `noindex`, c'est du contenu dupliqué
   visant précisément le bénéfice SEO recherché.
2. **Assets co-localisés** — le bloquant le plus surprenant. Un article sous `i18n/fr/` ne trouve
   ni son `files/` ni son `images/` : 201 articles avec `files/`, 186 avec `images/`, 84 Mo,
   duplication exclue. Deux résolveurs distincts donc deux correctifs — patch de
   `resolveSourcePath` dans `plugins/remark-snippet-loader` (validé) pour `<Snippet>`, et un
   remark plugin maison à écrire pour les images (pipeline interne Docusaurus, hors d'atteinte du
   premier patch).
3. **Composants non locale-aware** — motif à chercher : toute manipulation textuelle d'un
   permalink ou d'un pathname. Cas constaté : `src/theme/BlogTagsListPage/index.js:17`
   (`permalink.replace(...)`) casse tous les liens de tags en FR. Un `<Link to="/blog/…">` ne pose
   pas problème. Plus le `require.context` de `posts.ts` qui lit `blog/`, pas `i18n/`.

**Le traducteur existe déjà — ne pas le réécrire.** `scripts/translate-post.mjs` +
`scripts/lib/translate-{contract,validate,hash}.mjs`, éprouvés le 2026-09-16 sur 4 articles réels
(4/4 structurellement intacts, relance automatique fonctionnelle). Qualité EN→FR nettement
meilleure que prévu : proche du natif, la voix de l'auteur passe.

Ce qui n'est **pas** un obstacle, contrairement à l'intuition : le coût (**≈ 41 $ le corpus,
mesuré** — les tokens de raisonnement sont facturés en sortie, d'où une première estimation fausse
d'un facteur deux), le temps de build (69 s mono-locale, ≈ 140 s bi-locale), la qualité de
traduction. Le problème d'ancres ne concerne que **7 liens** dans tout le corpus : ne pas lancer
`yarn write-heading-ids` dessus. Déploiement
progressif — 5 articles, puis top 20 par trafic Matomo, puis tout nouvel article ; jamais les 257
d'un coup. Voir [[project_internal_links]] pour le problème d'ancres jumeau.
