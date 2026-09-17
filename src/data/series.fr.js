/**
 * French labels and descriptions for SERIES_DATA (src/data/series.js).
 *
 * Kept in a separate file, keyed by the series' ENGLISH name — because that name is a functional
 * key, not a label: `src/components/Blog/utils/slug.ts` derives `/series/<slug>` from it, and
 * every article's front matter references the series by that exact string. Translating `name`
 * would break both. Only what is displayed changes.
 *
 * Not in `code.json` for the same reason `tags.yml` is not: this is content keyed by a domain
 * identifier, not UI chrome. Adding a locale means adding a sibling file, not editing this one.
 *
 * See TODO 0119.
 */
const SERIES_FR = {
  "Bluesky Docusaurus component": {
    label: "Composant Bluesky pour Docusaurus",
    description: "Construire et intégrer des composants Bluesky dans Docusaurus.",
  },
  "Building and testing REST APIs": {
    label: "Construire et tester des API REST",
    description:
      "Construire, tester et documenter des API REST avec des outils de client et de linting modernes.",
  },
  "Claude Code": {
    label: "Claude Code",
    description:
      "Bâtir un workflow Claude Code en couches — commandes, hooks, skills, agents, règles — et garder la consommation de tokens sous contrôle.",
  },
  "Coding using a devcontainer": {
    label: "Développer dans un devcontainer",
    description:
      "Travailler de façon identique d'une machine à l'autre grâce aux Dev Containers de VS Code.",
  },
  "Create your joomla website using Docker": {
    label: "Créer votre site Joomla avec Docker",
    description:
      "Faire tourner Joomla en local avec Docker et fluidifier votre développement web.",
  },
  "Creating Docusaurus components": {
    label: "Créer des composants Docusaurus",
    description:
      "Composants sur mesure, hooks, mises en page et interface réutilisable pour votre site Docusaurus.",
  },
  "Customize your shell with ZSH": {
    label: "Personnaliser votre shell avec ZSH",
    description: "Installer, étendre et organiser ZSH en un shell rapide et modulaire.",
  },
  "Diagrams as code": {
    label: "Diagrammes as code",
    description:
      "Générer diagrammes, cartes mentales et visualisations directement depuis du code et des données.",
  },
  "Discovering Docusaurus": {
    label: "Découvrir Docusaurus",
    description:
      "Un parcours complet et pratique à travers les fonctionnalités et la configuration de Docusaurus.",
  },
  "Discovering Quarto": {
    label: "Découvrir Quarto",
    description:
      "Apprendre Quarto pas à pas, pour des documents reproductibles et la publication scientifique.",
  },
  "Display Docusaurus Blog Posts as Cards - A Step-by-Step Guide": {
    label: "Afficher vos articles Docusaurus en cartes — guide pas à pas",
    description:
      "Construire une mise en page en cartes sur mesure et soigner l'aspect visuel de vos articles.",
  },
  "Functional testing": {
    label: "Tests fonctionnels",
    description:
      "Maîtriser les concepts du test fonctionnel et automatiser efficacement les parcours d'interface.",
  },
  "MS Excel - Connect to a SQL Server database": {
    label: "MS Excel — se connecter à une base SQL Server",
    description:
      "Interroger directement des bases SQL Server depuis Excel et automatiser vos rapports.",
  },
  "Modern CLI tools for your terminal": {
    label: "Outils CLI modernes pour votre terminal",
    description:
      "Remplacer les commandes Unix classiques par des outils en ligne de commande plus rapides et plus agréables.",
  },
  "Ollama daily use": {
    label: "Ollama au quotidien",
    description:
      "Transformer un LLM Ollama local en outils du quotidien : fonctions zsh pour les tests et git, et une recherche RAG sur vos propres documents.",
  },
  "Running Docusaurus using Docker": {
    label: "Faire tourner Docusaurus avec Docker",
    description:
      "Conteneuriser votre environnement Docusaurus pour un développement local reproductible.",
  },
  "Running Oracle Database Server as a Docker container": {
    label: "Oracle Database Server dans un container Docker",
    description:
      "Faire tourner Oracle Database en local avec Docker, pour les tests et le développement.",
  },
  "Self-host your own services": {
    label: "Auto-héberger vos propres services",
    description:
      "Auto-héberger des services web utiles avec Docker, de la supervision à la prise de notes.",
  },
  "SSH - From your first key to remote development": {
    label: "SSH — de votre première clé au développement distant",
    description:
      "Mettre en place un accès SSH et l'exploiter, de la première clé au développement à distance.",
  },
  "VBA & MS Office automation": {
    label: "VBA et automatisation de MS Office",
    description: "Automatiser Excel, Access et Outlook avec des scripts VBA et VBS.",
  },
  "VSCode - Tips, extensions and shortcuts": {
    label: "VSCode — astuces, extensions et raccourcis",
    description:
      "Astuces, extensions et raccourcis VS Code du quotidien pour coder plus vite.",
  },
  "WSL2 - Install, move and use it": {
    label: "WSL2 — installer, déplacer et utiliser",
    description: "Installer WSL2, le déplacer et devenir productif avec sous Windows.",
  },
  "WinSCP & remote file transfer": {
    label: "WinSCP et transfert de fichiers distant",
    description:
      "Transférer des fichiers de façon fiable avec WinSCP, SFTP et les outils d'accès distant.",
  },
  "Windows Terminal": {
    label: "Windows Terminal",
    description:
      "Configurer et personnaliser Windows Terminal pour une ligne de commande plus agréable.",
  },
  "Writing better Bash scripts": {
    label: "Écrire de meilleurs scripts Bash",
    description:
      "Faire monter vos scripts Bash en gamme : journalisation, parallélisme, documentation et tests.",
  },
  "code quality": {
    label: "Qualité du code",
    description:
      "Améliorer la qualité du code avec des linters, des formateurs, des tests et de bonnes habitudes d'ingénierie.",
  },
};

export default SERIES_FR;
