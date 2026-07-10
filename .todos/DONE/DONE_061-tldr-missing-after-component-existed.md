# 061 — `<TLDR>` manquant sur des articles retouchés après la création du composant

**Priority:** Low
**Category:** component-reuse

## Problem

`<TLDR>` a été créé le 2026-01-17. La quasi-totalité des articles publiés avant cette date n'ont
pas de TLDR — ce n'est **pas** un bug en soi (le composant n'existait pas), donc ne pas le
retrofiter en masse aveuglément. Mais un petit nombre d'articles ont été substantiellement
retouchés (`updates:` en frontmatter) **après** le 2026-01-17, c'est-à-dire à un moment où le
composant existait déjà — pour ceux-là, l'absence de TLDR est un vrai oubli de retrofit :

## Proposed solution

Ajouter un `<TLDR>` pour chaque article de blog qui n'en possède pas encore.

## Relationship to existing TODOs

Aucun TODO existant.
