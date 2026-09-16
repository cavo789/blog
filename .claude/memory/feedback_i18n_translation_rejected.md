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
avec des données neuves. Le plan complet vit dans `.todos/0119-traduction-francaise-automatique-des-articles.md`.

**Ce qui a changé :** trafic mesuré (withcabin, 30 j : France 671 + Belgique 247 uniques ≈ 10-15 %
du lectorat, la langue du navigateur sous-estime) ; le moteur est l'API Claude déjà câblée pour
`generate-eli5.mjs`/`generate-questions.mjs`, pas Ollama ; coût mesuré ≈ 20 $ pour tout le corpus
et < 0,10 $ par article — l'argument financier ne tient pas. Ce qui n'a pas changé : la dérive
permanente entre l'anglais et son miroir français, sur 257 articles.

**How to apply:** ne plus opposer un refus de principe. Les deux points durs à rappeler si le sujet
revient : (1) Docusaurus **retombe sur la source anglaise** quand une traduction manque, donc
activer la locale sans garde-fou crée 237 pages anglaises sous `/fr/` — du contenu dupliqué visant
précisément le bénéfice SEO recherché ; (2) le gros du travail n'est pas la traduction mais le
lot G du TODO (le `require.context` de `posts.ts` lit `blog/`, pas `i18n/`, donc tous les
composants maison affichent des titres anglais sur les pages FR). Déploiement progressif —
5 articles, puis top 20 par trafic Matomo, puis tout nouvel article ; pas les 257 d'un coup.
Voir [[project_internal_links]] pour le problème d'ancres jumeau.
