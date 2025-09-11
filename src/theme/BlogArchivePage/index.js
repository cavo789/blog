import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { PageMetadata } from "@docusaurus/theme-common";
import { translate } from "@docusaurus/Translate";
import BlogPostCount from "@site/src/components/Blog/PostCount";
import Layout from "@theme/Layout";
import PostCard from "@site/src/components/Blog/PostCard";
import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";

const allPosts = getBlogMetadata();

function Archives() {
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [displayedPosts, setDisplayedPosts] = useState([]);

  const uniqueTags = [...new Set(allPosts.flatMap((post) => post.tags))].sort();

  useEffect(() => {
    let filteredPosts = allPosts
      .filter((post) => !post.draft && !post.unlisted)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (selectedYear !== "all") {
      filteredPosts = filteredPosts.filter(
        (post) => new Date(post.date).getFullYear().toString() === selectedYear
      );
    }

    if (selectedTag !== "all") {
      filteredPosts = filteredPosts.filter((post) =>
        post.tags.includes(selectedTag)
      );
    }
    setDisplayedPosts(filteredPosts);
  }, [selectedYear, selectedTag]);

  const postsByYearAndMonth = displayedPosts.reduce((acc, post) => {
    const date = new Date(post.date);
    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][month]) {
      acc[year][month] = [];
    }
    acc[year][month].push(post);
    return acc;
  }, {});

  const years = Object.keys(postsByYearAndMonth).sort((a, b) => b - a);
  const allYears = [
    ...new Set(
      allPosts
        .filter((post) => !post.draft && !post.unlisted)
        .map((post) => new Date(post.date).getFullYear())
    ),
  ].sort((a, b) => b - a);

  const title = translate({
    id: "theme.blog.archive.title",
    message: "Blog Archive",
  });

  const description = translate({
    id: "theme.blog.archive.description",
    message: "All blog posts organized by year and month.",
  });

  return (
    <>
      <PageMetadata
        title={title}
        description={description}
        image="/img/archives_background.png"
      />
      <Layout
        title="Archives"
        description="Browse all blog posts by year and month."
      >
        <div className="container margin-top--lg margin-bottom--xl">
          <h1 className="text--center">Article Archives</h1>
          <BlogPostCount />

          <div className={styles.filterContainer}>
            <div className={styles.filterGroup}>
              <label htmlFor="year-filter">Filter by Year:</label>
              <select
                id="year-filter"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedTag("all");
                }}
              >
                <option value="all">All Years</option>
                {allYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label htmlFor="tag-filter">Filter by Tag:</label>
              <select
                id="tag-filter"
                value={selectedTag}
                onChange={(e) => {
                  setSelectedTag(e.target.value);
                  setSelectedYear("all");
                }}
              >
                <option value="all">All Tags</option>
                {uniqueTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <nav className={styles.timelineContainer}>
            <p className={styles.jumpToHeading}>Jump to:</p>
            <div className={styles.timelineWrapper}>
              <div className={styles.timelineContent}>
                <div className={styles.timelineLine}></div>
                {years.map((year) => (
                  <React.Fragment key={year}>
                    <div className={styles.timelineYearMarker}>
                      <a href={`#${year}`}>{year}</a>
                    </div>
                    {Object.keys(postsByYearAndMonth[year]).map((month) => (
                      <a
                        key={`${year}-${month}`}
                        href={`#${year}-${month}`}
                        className={styles.monthPill}
                      >
                        {month}
                      </a>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </nav>

          <div className="row">
            {years.length > 0 ? (
              years.map((year) => (
                <div key={year} className="col col--12">
                  <h2 className="margin-top--xl" id={year}>
                    {year}
                  </h2>
                  {Object.keys(postsByYearAndMonth[year]).map((month) => (
                    <div key={month}>
                      <h3
                        className={styles.monthHeading}
                        id={`${year}-${month}`}
                      >
                        {month} {year}
                        <a
                          href={`#${year}-${month}`}
                          className={styles.monthAnchor}
                        >
                          #
                        </a>
                      </h3>
                      <div className="row">
                        {postsByYearAndMonth[year][month].map((post) => (
                          <PostCard
                            key={post.permalink}
                            post={post}
                            layout="small"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="text--center">
                No posts to display with the selected filters.
              </p>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

export default Archives;
