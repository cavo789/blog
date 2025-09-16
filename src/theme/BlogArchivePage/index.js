import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { PageMetadata } from "@docusaurus/theme-common";
import { translate } from "@docusaurus/Translate";
import BlogPostCount from "@site/src/components/Blog/PostCount";
import Layout from "@theme/Layout";
import PostCard from "@site/src/components/Blog/PostCard";
import React, { useState, useEffect } from "react";
import ScrollToTopButton from "@site/src/components/ScrollToTopButton";
import styles from "./styles.module.css";

const allPosts = getBlogMetadata();

function Archives() {
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [isTimelineVisible, setIsTimelineVisible] = useState(true);
  const [activeYearMonth, setActiveYearMonth] = useState(null);

  const uniqueTags = [...new Set(allPosts.flatMap((post) => post.tags))].sort();

  const tagCounts = allPosts
    .filter((post) => !post.draft && !post.unlisted)
    .flatMap((post) => post.tags)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

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

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
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

  // Scroll sync: observe month headings on right and update activeYearMonth
  useEffect(() => {
    if (!displayedPosts.length) return;

    const monthElements = years.flatMap((year) =>
      Object.keys(postsByYearAndMonth[year])
        .map((month) => document.getElementById(`${year}-${month}`))
        .filter(Boolean)
    );

    if (!monthElements.length) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -80% 0px", // trigger when heading near top
      threshold: 0,
    };

    function callback(entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveYearMonth(entry.target.id);
        }
      });
    }

    const observer = new IntersectionObserver(callback, observerOptions);
    monthElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [displayedPosts, years, postsByYearAndMonth]);

  // Scroll timeline sidebar to keep active month visible
  useEffect(() => {
    if (!activeYearMonth) return;

    const timelineLink = document.querySelector(
      `a[href="#${activeYearMonth}"]`
    );
    if (timelineLink) {
      // Scroll into view inside the timeline container
      const timelineContainer = document.getElementById("timeline-container");
      if (timelineContainer) {
        // Calculate relative position of timelineLink inside timelineContainer
        const linkRect = timelineLink.getBoundingClientRect();
        const containerRect = timelineContainer.getBoundingClientRect();

        // Only scroll if link is outside visible bounds
        if (
          linkRect.top < containerRect.top ||
          linkRect.bottom > containerRect.bottom
        ) {
          // Scroll so the link is centered vertically inside container
          timelineContainer.scrollTo({
            top:
              timelineContainer.scrollTop +
              linkRect.top -
              containerRect.top -
              timelineContainer.clientHeight / 2 +
              linkRect.height / 2,
            behavior: "smooth",
          });
        }
      }
    }
  }, [activeYearMonth]);

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
          {/* -------- Layout: Sidebar Left + Posts Right -------- */}
          <div className={styles.contentWrapper}>
            {/* Left Sidebar: Filters + Timeline */}
            {isTimelineVisible && (
              <aside
                id="timeline-container"
                className={styles.sidebar}
                aria-label="Blog Archive Filters and Timeline"
              >
                {/* Filters */}
                <div className={styles.filterContainerSidebar}>
                  <div className={styles.filterGroupSidebar}>
                    <label htmlFor="year-filter-sidebar">Filter by Year:</label>
                    <select
                      id="year-filter-sidebar"
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

                  <div className={styles.filterGroupSidebar}>
                    <label htmlFor="tag-filter-sidebar">Filter by Tag:</label>
                    <select
                      id="tag-filter-sidebar"
                      value={selectedTag}
                      onChange={(e) => {
                        setSelectedTag(e.target.value);
                        setSelectedYear("all");
                      }}
                    >
                      <option value="all">All Tags</option>
                      {uniqueTags.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag} ({tagCounts[tag] || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Timeline */}
                <nav
                  className={styles.verticalTimeline}
                  aria-label="Blog Archive Timeline Navigation"
                >
                  <h2 className={styles.jumpToHeading}>Jump to</h2>
                  <ul className={styles.timelineList}>
                    {years.map((year) => (
                      <li key={year} className={styles.timelineItem}>
                        <a href={`#${year}`} className={styles.timelineYear}>
                          {year}
                        </a>
                        <ul className={styles.timelineMonthList}>
                          {Object.keys(postsByYearAndMonth[year]).map(
                            (month) => (
                              <li
                                key={`${year}-${month}`}
                                className={styles.timelineMonth}
                              >
                                <a
                                  href={`#${year}-${month}`}
                                  className={`${styles.timelineMonthLink} ${
                                    activeYearMonth === `${year}-${month}`
                                      ? styles.activeMonth
                                      : ""
                                  }`}
                                >
                                  {month}
                                </a>
                              </li>
                            )
                          )}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            {/* Posts Content */}
            <main className={styles.postsContainer}>
              <h1 className="text--center">Article Archives</h1>

              <p className="text--center">
                We have published <strong><BlogPostCount/></strong> articles on our blog!
              </p>

              {years.length > 0 ? (
                years.map((year) => (
                  <section key={year} className="col col--12">
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
                            aria-label={`Link to ${month} ${year}`}
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
                  </section>
                ))
              ) : (
                <p className="text--center">
                  No posts to display with the selected filters.
                </p>
              )}
            </main>
          </div>
        </div>
        <ScrollToTopButton />
      </Layout>
    </>
  );
}

export default Archives;
