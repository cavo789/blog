/**
 * Cards rendered by `HomeCards` in the homepage's "Explore the site" section.
 *
 * Kept in the same order as the navbar items in `docusaurus.config.js`, and covering the same
 * destinations: this section is the visual restatement of the navbar for a visitor who scrolls
 * rather than reads the top bar, so a destination present in one and absent from the other
 * (Map and Ask My Blog were, until TODO 0089) is a bug.
 *
 * `image` is a filename resolved against `/static/img/homepage/`. Sources are square (1024x1024);
 * `HomeCards` also enforces a 1:1 ratio in CSS so an off-format image can't break the grid.
 */
const HOME_CARDS = [
  {
    title: "Blog",
    description: "I'm publishing at least one article per week.",
    url: "/blog",
    image: "blog.webp",
  },
  {
    title: "Series",
    description: "Browse articles grouped by series.",
    url: "/series",
    image: "series.webp",
  },
  {
    title: "Tags",
    description: "Quick way to find posts by topic or keyword.",
    url: "/blog/tags",
    image: "tags.webp",
  },
  {
    title: "Map",
    description: "An interactive map of every article and how they connect.",
    url: "/map",
    image: "map.webp",
    alt: "The meerkat pointing at a map of the blog's articles.",
  },
  {
    title: "Ask My Blog",
    description: "Every question this blog answers — search it or browse by topic.",
    url: "/faq",
    image: "faq.webp",
    alt: "The meerkat surveying the blog's topics.",
  },
  {
    title: "Repositories",
    description: "Discover my public repositories hosted on GitHub.com.",
    url: "/repositories",
    image: "repositories.webp",
  },
  {
    title: "Archive",
    description: "A timeline view of everything I've published so far.",
    url: "/blog/archive",
    image: "archive.webp",
  },
  {
    title: "About",
    description: "Who I am, why I write, and what this blog is about.",
    url: "/about",
    image: "about.webp",
  },
];

export default HOME_CARDS;
