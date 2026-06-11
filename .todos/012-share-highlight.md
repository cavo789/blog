# 012 — Share a Highlighted Quote

**WOW level: 8/10**
**Effort: Medium**
**Inspired by: Medium "highlight to tweet", Substack quote sharing**

## Concept

Le lecteur sélectionne du texte → apparaît un mini-popover avec :

- 🐦 **Share on Twitter/X** (texte pré-rempli avec la citation + URL de l'article)
- 🔗 **Copy link to this passage** (URL avec `#:~:text=...` — Text Fragment API)
- (optionnel) 💬 **Annotate** → redirige vers 001

## Différence avec 001 (Text Annotation)

| Share Highlight (012) | Text Annotation (001) |
|---|---|
| Action de partage public | Feedback privé à l'auteur |
| Vers Twitter, clipboard | Vers le backend PHP |
| Pas de backend | Backend + email |

Les deux peuvent coexister dans le même popover avec des sections distinctes.

## Text Fragment API

Les navigateurs modernes supportent `#:~:text=texte%20sélectionné` dans les URLs. Quand partagé, le navigateur du destinataire scroll jusqu'au passage et le surligne.

```js
const encoded = encodeURIComponent(selectedText.trim().slice(0, 100));
const fragmentUrl = `${window.location.href.split('#')[0]}#:~:text=${encoded}`;
```

## Implémentation

### Frontend — `src/components/ShareHighlight/index.js`

```js
useEffect(() => {
  const onMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (!text || text.length < 20) {
      hidePopover();
      return;
    }
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    showPopover({ text, rect });
  };

  document.addEventListener('mouseup', onMouseUp);
  return () => document.removeEventListener('mouseup', onMouseUp);
}, []);
```

### Twitter share URL

```js
const tweetText = `"${text.slice(0, 200)}..." — ${articleTitle}`;
const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(articleUrl)}`;
```

## UX details

- Popover apparaît au-dessus de la sélection (pas sur mobile par défaut — gère le touch)
- Disparaît si on clique ailleurs ou si la sélection est effacée
- Feedback visuel "Copied!" quand on copie le lien
- Pas intrusif : ne remplace pas les contrôles natifs du navigateur

## Relation avec 001

Si les deux features (001 et 012) sont implémentées, fusionner les popovers en un seul :

```
┌────────────────────────┐
│  📢 Share              │
│  🐦 Tweet this         │
│  🔗 Copy link          │
├────────────────────────┤
│  📝 Give feedback      │
│  🔤 Report typo        │
│  ❌ Flag as incorrect  │
└────────────────────────┘
```

## TODO steps

- [ ] Créer `src/components/ShareHighlight/index.js` + styles
- [ ] Intégrer dans le layout BlogPostPage
- [ ] Tester la Text Fragment API sur Chrome, Firefox, Safari
- [ ] Gérer le cas mobile (touch selection différent)
- [ ] Si 001 existe, fusionner les deux popovers
