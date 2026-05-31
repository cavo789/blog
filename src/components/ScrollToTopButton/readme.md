# 🚀 ScrollToTopButton

Un composant React élégant pour Docusaurus qui permet aux utilisateurs de remonter rapidement en haut de la page avec une animation fluide.

## 📋 Aperçu

Ce composant affiche un bouton flottant en bas à droite de l'écran qui :
- Apparaît automatiquement après 300px de défilement
- Permet de remonter en haut de page avec un clic
- Inclut une animation de "vol vers le haut" lors du clic
- S'adapte parfaitement au design Docusaurus

## 🎯 Fonctionnalités

- **Apparition conditionnelle** : Le bouton n'apparaît qu'après avoir scrollé 300px
- **Animation fluide** : Transition douce pour l'apparition/disparition
- **Animation de clic** : Effet visuel "flyUp" quand l'utilisateur clique
- **Défilement smooth** : Remontée en douceur vers le haut de la page
- **Design responsive** : S'adapte à tous les écrans
- **Accessible** : Texte alternatif pour les lecteurs d'écran

## 🔧 Installation

1. Copiez le dossier `ScrollToTopButton` dans `src/components/`
2. Ajoutez le composant dans votre layout Docusaurus
3. Personnalisez l'image et les styles selon vos besoins

## 📁 Structure des fichiers

```bash
src/components/ScrollToTopButton/
├── index.js              # Composant React principal
├── styles.module.css     # Styles CSS modulaires
└── README.md            # Documentation (ce fichier)
```

## 🚀 Utilisation

### Dans un layout Docusaurus

```jsx
import ScrollToTopButton from '../../components/ScrollToTopButton';

export default function Layout(props) {
  return (
    <LayoutProvider>
      {/* Votre contenu de layout */}

      <ScrollToTopButton />
    </LayoutProvider>
  );
}
```

### Configuration

Vous pouvez modifier le seuil d'apparition en changeant la valeur dans `index.js` :

```javascript
if (window.scrollY > 300) {  // Changez 300 pour ajuster le seuil
  setIsVisible(true);
}
```

## 🎨 Personnalisation

### Changer l'image

1. Placez votre image dans le dossier `static/img/` de votre projet
2. Modifiez l'import dans `index.js` :

```jsx
import buttontop from '@site/static/img/votre-image.png'  // Remplacez par votre image
```

3. L'image sera utilisée dans le composant :

```jsx
<img
  src={buttontop}
  alt="Retour en haut"
  width="30"
  height="30"
/>
```

### Modifier les styles

Editez `styles.module.css` pour personnaliser :

- **Position** : Changez `bottom` et `right` pour repositionner
- **Taille** : Modifiez `width` et `height`
- **Couleurs** : Ajustez `box-shadow` et autres propriétés visuelles
- **Animation** : Personnalisez l'animation `flyUp`

## 🔄 États du composant

Le composant gère trois états principaux :

1. **`isVisible`** : Contrôle la visibilité du bouton selon le scroll
2. **`fly`** : Active l'animation de "vol" lors du clic
3. **CSS Classes** : Applique conditionnellement les styles

## 🎭 Animations

### Apparition/Disparition
```css
transition: opacity 0.4s, visibility 0.4s;
```

### Animation de clic (flyUp)
```css
@keyframes flyUp {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-300px) scale(0.6);
    opacity: 0;
  }
}
```

## 🎯 Points techniques

- **React Hooks** : Utilise `useState` et `useEffect`
- **Event Listeners** : Écoute les événements de scroll
- **CSS Modules** : Styles isolés et modulaires
- **Clsx** : Gestion conditionnelle des classes CSS
- **Cleanup** : Nettoyage automatique des event listeners

## 🐛 Dépannage

### Le bouton n'apparaît pas
- Vérifiez que le composant est bien importé dans le layout
- Assurez-vous que les styles CSS sont correctement liés
- Testez en scrollant plus de 300px

### L'image ne s'affiche pas
- Vérifiez le chemin de l'image dans `/static/img/`
- Assurez-vous que l'image existe et est accessible

### Les styles ne s'appliquent pas
- Vérifiez l'import CSS : `import styles from "./styles.module.css"`
- Assurez-vous d'utiliser `styles.nomClasse` et non `"nom-classe"`

## 🚀 Optimisations possibles

- Ajouter un throttle sur l'événement scroll pour de meilleures performances
- Permettre la configuration du seuil via des props
- Ajouter plus d'options d'animation
- Support du dark mode

## 📝 Exemple complet

Voici un exemple d'utilisation complète dans un layout Docusaurus :

```jsx
import React from 'react';
import Layout from '@theme-original/Layout';
import ScrollToTopButton from '@site/src/components/ScrollToTopButton';

export default function LayoutWrapper(props) {
  return (
    <>
      <Layout {...props} />
      <ScrollToTopButton />
    </>
  );
}
```

---

**Développé par DocuxLab** - Un composant simple et efficace pour améliorer l'expérience utilisateur ! 🎉
