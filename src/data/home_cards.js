/**
 * Cards rendered by `HomeCards` in the homepage's "Explore the site" section.
 *
 * Kept in the same order as the navbar items in `docusaurus.config.js`, but *not* a mirror of it:
 * this is a curated subset. `/map` and `/faq` are reachable from the navbar (and `/faq` also from
 * the always-visible Ask-my-blog bubble) and are deliberately absent here — TODO 0089 added them,
 * and they were removed again because their only available illustrations are crops of 1584x672
 * banners, which read as visual noise next to the single-subject meerkat drawings of the six
 * others. Adding a destination back means producing an illustration in that same grammar first;
 * a mismatched card costs more than a missing one, since the navbar already covers the link.
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
