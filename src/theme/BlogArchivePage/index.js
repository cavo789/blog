import { PageMetadata } from "@docusaurus/theme-common";
import { translate } from "@docusaurus/Translate";
import BlogPostCount from "@site/src/components/Blog/PostCount";
import clsx from "clsx";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { useState } from "react";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

function groupPostsByYearMonth(posts) {
  const map = new Map();

  posts.forEach((post) => {
    const date = new Date(post.metadata.date);
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "long" });

    if (!map.has(year)) {
      map.set(year, new Map());
    }

    const monthsMap = map.get(year);
    if (!monthsMap.has(month)) {
      monthsMap.set(month, []);
    }

    monthsMap.get(month).push(post);
  });

  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, monthsMap]) => ({
      year,
      months: Array.from(monthsMap.entries()).map(([month, posts]) => ({
        month,
        posts,
      })),
    }));
}

function Sidebar({ years, activeYear, setActiveYear }) {
  return (
    <div className="col col--2">
      <div className={styles.timeline__sidebar}>
        <ul className="clean-list">
          {years.map(({ year }) => (
            <li key={year}>
              <a
                href={`#year-${year}`}
                className={clsx("menu__link", {
                  "menu__link--active": year === activeYear,
                })}
                onClick={() => setActiveYear(year)}
              >
                {year}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Timeline({ data }) {
  const [expandedYears, setExpandedYears] = useState(
    data.map(({ year }) => year)
  );

  const {
    siteConfig: {
      customFields: { bluesky: { handle: blueskyHandle } = {} } = {},
    },
  } = useDocusaurusContext();

  const toggleYear = (year) => {
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  return (
    <div className="row timeline">
      <Sidebar
        years={data}
        activeYear={expandedYears[0]}
        setActiveYear={(year) => {
          const el = document.getElementById(`year-${year}`);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <div className="col col--10">
        {data.map(({ year, months }) => (
          <div
            key={year}
            className="timeline__year margin-bottom--xl"
            id={`year-${year}`}
          >
            <div
              className="timeline__year-header"
              onClick={() => toggleYear(year)}
              style={{ cursor: "pointer" }}
            >
              <Heading as="h2" className="margin-bottom--sm">
                {year} {expandedYears.includes(year) ? "▾" : "▸"}
              </Heading>
            </div>
            {expandedYears.includes(year) &&
              months.map(({ month, posts }) => (
                <div key={month} className="timeline__month margin-bottom--md">
                  <Heading as="h3" className="margin-bottom--xs">
                    {month}
                  </Heading>
                  <ul className="clean-list">
                    {posts.map((post) => {
                      const blueskyRecordKey =
                        post.metadata.frontMatter?.blueskyRecordKey;
                      const blueskyUrl =
                        blueskyHandle && blueskyRecordKey
                          ? `https://bsky.app/profile/${blueskyHandle}/post/${blueskyRecordKey}`
                          : null;

                      return (
                        <li
                          key={post.metadata.permalink}
                          className="margin-bottom--sm"
                        >
                          <Link to={post.metadata.permalink} className={styles.post_title}>
                            <strong>{post.metadata.title}</strong>
                          </Link>{" "}
                          <span
                            className={clsx(
                              "text--secondary",
                              "text--sm",
                              styles.date
                            )}
                          >
                            —{" "}
                            {new Date(post.metadata.date).toLocaleDateString()}
                          </span>
                          <div
                            className={clsx(
                              "text--secondary",
                              "text--xs",
                              styles.tags
                            )}
                          >
                            {post.metadata.tags?.length > 0 && (
                              <>
                                Tags:{" "}
                                {post.metadata.tags
                                  .map((tag) => (
                                    <Link
                                      key={tag.label}
                                      to={tag.permalink}
                                      className="tag"
                                    >
                                      {tag.label}
                                    </Link>
                                  ))
                                  .reduce((prev, curr) => [prev, ", ", curr])}
                              </>
                            )}
                            {post.metadata.frontMatter?.series && (
                              <>
                                {" • Series: "}
                                <strong>
                                  {post.metadata.frontMatter.series}
                                </strong>
                              </>
                            )}
                            {blueskyUrl && (
                              <>
                                {" • "}
                                <a
                                  href={blueskyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bluesky-link"
                                >
                                  View on Bluesky ↗
                                </a>
                              </>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BlogArchive({ archive }) {
  const title = translate({
    id: "theme.blog.archive.title",
    message: "Blog Archive",
  });

  const description = translate({
    id: "theme.blog.archive.description",
    message: "All blog posts organized by year and month.",
  });

  const groupedData = groupPostsByYearMonth(archive.blogPosts);

  return (
    <>
      <PageMetadata
        title={title}
        description={description}
        image="/img/archives_background.png"
      />
      <Layout>
        <div className={styles.pageBackground}>
          <header className={clsx("hero", "hero--primary", styles.header_archive)}>
            <div className="container">
              <Heading as="h1" className="hero__title">
                {title}
              </Heading>
              <p className="hero__subtitle">{description}</p>
              <BlogPostCount />
            </div>
          </header>
          <main className={clsx("container", "margin-vert--lg")}>
            <Timeline data={groupedData} />
          </main>
        </div>
      </Layout>
    </>
  );
}
