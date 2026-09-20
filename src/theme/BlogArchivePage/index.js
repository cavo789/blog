import { useBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { useTranslationState } from "@site/src/components/Blog/utils/translations";
import TranslationCoverage from "@site/src/components/Blog/TranslationCoverage";
import { PageMetadata } from "@docusaurus/theme-common";
import { useDateTimeFormat } from "@docusaurus/theme-common/internal";
import Interpolate from "@docusaurus/Interpolate";
import Translate, { translate } from "@docusaurus/Translate";
import BlogPostCount from "@site/src/components/Blog/PostCount";
import Layout from "@theme/Layout";
import PostCard from "@site/src/components/Blog/PostCard";
import { useStorageSlot, useWindowSize } from "@docusaurus/theme-common";
import PanelToggleIcon from "@site/src/components/PanelToggleIcon";
import clsx from "clsx";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./styles.module.css";

const SIDEBAR_HIDDEN_STORAGE_KEY = "docusaurus.blog.archive.sidebar.hidden";

function Archives() {
  // Was a module-scope constant; it has to live inside the component now that the corpus is
  // locale-aware (a hook cannot be called at module scope). `useBlogMetadata` is memo-free but
  // cheap — the underlying require.context is resolved once by webpack.
  const allPosts = useBlogMetadata();
  const { isDefaultLocale } = useTranslationState();
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [activeYearMonth, setActiveYearMonth] = useState(null);
  // Closed by default, same as the article-page "All posts" sidebar — no stored preference yet
  // (first visit) means hidden, so the archive gets the full width from the start.
  const [sidebarHiddenValue, sidebarHiddenStorage] = useStorageSlot(
    SIDEBAR_HIDDEN_STORAGE_KEY,
  );
  const windowSize = useWindowSize();
  // Collapsing only reclaims horizontal space, which the mobile stacked layout doesn't have — a
  // preference saved on desktop must not leave filters/timeline inaccessible on a phone.
  const sidebarHidden =
    windowSize !== "mobile" &&
    (sidebarHiddenValue === null || sidebarHiddenValue === "true");

  const uniqueTags = [...new Set(allPosts.flatMap((post) => post.tags))].sort();

  const tagCounts = allPosts
    .filter((post) => !post.draft && !post.unlisted)
    .flatMap((post) => post.tags)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

  const displayedPosts = useMemo(() => {
    let filteredPosts = allPosts
      .filter((post) => !post.draft && !post.unlisted)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (selectedYear !== "all") {
      filteredPosts = filteredPosts.filter(
        (post) => new Date(post.date).getUTCFullYear().toString() === selectedYear,
      );
    }

    if (selectedTag !== "all") {
      filteredPosts = filteredPosts.filter((post) => post.tags.includes(selectedTag));
    }
    return filteredPosts;
  }, [selectedYear, selectedTag]);

  const monthLabelFormat = useDateTimeFormat({ month: "long", timeZone: "UTC" });

  // The month LABEL is localized; the month KEY deliberately stays the English month name.
  // That key becomes a DOM id and an `#anchor` (`#2026-September`), so localizing it would
  // both break every archive link already in the wild and make the same anchor resolve
  // differently per locale (`#2026-September` here, `#2026-septembre` there). Keeping it
  // English also keeps `Object.keys()` in insertion order: numeric keys like "01".."12" would
  // have been hoisted and re-sorted by JS, silently scrambling the months.
  //
  // UTC on both sides — `getUTCFullYear()` and `timeZone: "UTC"` — because a post's `date` is
  // a date-only string parsed as UTC midnight. Read in local time west of Greenwich, every
  // 1st-of-month article lands in the previous month. Same reason as BlogPostItem/Header/Info.
  const postsByYearAndMonth = displayedPosts.reduce((acc, post) => {
    const date = new Date(post.date);
    const year = date.getUTCFullYear();
    const month = date.toLocaleString("en-US", { month: "long", timeZone: "UTC" });

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) {
      acc[year][month] = { label: monthLabelFormat.format(date), posts: [] };
    }
    acc[year][month].posts.push(post);
    return acc;
  }, {});

  const years = Object.keys(postsByYearAndMonth).sort((a, b) => b - a);

  const allYears = [
    ...new Set(
      allPosts
        .filter((post) => !post.draft && !post.unlisted)
        .map((post) => new Date(post.date).getUTCFullYear()),
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
        .filter(Boolean),
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

    const timelineLink = document.querySelector(`a[href="#${activeYearMonth}"]`);
    if (timelineLink) {
      // Scroll into view inside the timeline container
      const timelineContainer = document.getElementById("timeline-container");
      if (timelineContainer) {
        // Calculate relative position of timelineLink inside timelineContainer
        const linkRect = timelineLink.getBoundingClientRect();
        const containerRect = timelineContainer.getBoundingClientRect();

        // Only scroll if link is outside visible bounds
        if (linkRect.top < containerRect.top || linkRect.bottom > containerRect.bottom) {
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
      <PageMetadata title={title} description={description} image="/img/archives.webp" />
      <Layout
        title={translate({ id: "blog.archive.layoutTitle", message: "Archives" })}
        description={translate({
          id: "blog.archive.layoutDescription",
          message: "Browse all blog posts by year and month.",
        })}
      >
        <div className="container margin-top--lg margin-bottom--xl">
          {/* -------- Layout: Sidebar Left + Posts Right -------- */}
          <div className={styles.contentWrapper}>
            {/* Left Sidebar: Filters + Timeline — omitted entirely when collapsed; the button to
                bring it back lives over the posts column instead, see below. */}
            {!sidebarHidden && (
              <aside
                id="timeline-container"
                className={styles.sidebar}
                aria-label={translate({
                  id: "blog.archive.sidebarAriaLabel",
                  message: "Blog Archive Filters and Timeline",
                })}
              >
                <button
                  type="button"
                  onClick={() => sidebarHiddenStorage.set("true")}
                  className={styles.toggleButton}
                  aria-expanded={true}
                  aria-label={translate({
                    id: "blog.archive.sidebarCollapseButtonTitle",
                    message: "Hide filters and timeline",
                  })}
                  title={translate({
                    id: "blog.archive.sidebarCollapseButtonTitle",
                    message: "Hide filters and timeline",
                  })}
                >
                  <PanelToggleIcon />
                </button>
                {/* Filters */}
                <div className={styles.filterContainerSidebar}>
                  <div className={styles.filterGroupSidebar}>
                    <div className={styles.filterLabel}>
                      <Translate id="blog.archive.filterByYear">
                        Filter by Year:
                      </Translate>
                    </div>
                    {/* Pills, not a <select>: a handful of years is exactly what the
                        button-row filter used on /repositories was designed for. Tags below
                        stay a dropdown — ~150 of them would be an unusable wall of pills. */}
                    <div
                      className={styles.pillRow}
                      role="group"
                      aria-label={translate({
                        id: "blog.archive.filterByYear",
                        message: "Filter by Year:",
                      })}
                    >
                      <button
                        type="button"
                        className={clsx(
                          styles.filterPill,
                          selectedYear === "all" && styles.filterPillActive,
                        )}
                        aria-pressed={selectedYear === "all"}
                        onClick={() => {
                          setSelectedYear("all");
                          setSelectedTag("all");
                        }}
                      >
                        {translate({ id: "blog.archive.allYears", message: "All Years" })}
                      </button>
                      {allYears.map((year) => (
                        <button
                          key={year}
                          type="button"
                          className={clsx(
                            styles.filterPill,
                            String(selectedYear) === String(year) &&
                              styles.filterPillActive,
                          )}
                          aria-pressed={String(selectedYear) === String(year)}
                          onClick={() => {
                            setSelectedYear(String(year));
                            setSelectedTag("all");
                          }}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.filterGroupSidebar}>
                    <label className={styles.filterLabel} htmlFor="tag-filter-sidebar">
                      <Translate id="blog.archive.filterByTag">Filter by Tag:</Translate>
                    </label>
                    <select
                      id="tag-filter-sidebar"
                      value={selectedTag}
                      onChange={(e) => {
                        setSelectedTag(e.target.value);
                        setSelectedYear("all");
                      }}
                    >
                      <option value="all">
                        {translate({ id: "blog.archive.allTags", message: "All Tags" })}
                      </option>
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
                  aria-label={translate({
                    id: "blog.archive.timelineAriaLabel",
                    message: "Blog Archive Timeline Navigation",
                  })}
                >
                  <h2 className={styles.jumpToHeading}>
                    <Translate id="blog.archive.jumpTo">Jump to</Translate>
                  </h2>
                  <ul className={styles.timelineList}>
                    {years.map((year) => (
                      <li key={year} className={styles.timelineItem}>
                        <a href={`#${year}`} className={styles.timelineYear}>
                          {year}
                        </a>
                        <ul className={styles.timelineMonthList}>
                          {Object.entries(postsByYearAndMonth[year]).map(
                            ([month, group]) => (
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
                                  {group.label}
                                </a>
                              </li>
                            ),
                          )}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}

            {/* Posts Content */}
            <main
              className={clsx(
                styles.postsContainer,
                sidebarHidden && styles.postsWithGutter,
              )}
            >
              {sidebarHidden && (
                <div className={styles.expandGutter}>
                  <button
                    type="button"
                    onClick={() => sidebarHiddenStorage.set("false")}
                    className={styles.toggleButton}
                    aria-expanded={false}
                    aria-label={translate({
                      id: "blog.archive.sidebarExpandButtonTitle",
                      message: "Show filters and timeline",
                    })}
                    title={translate({
                      id: "blog.archive.sidebarExpandButtonTitle",
                      message: "Show filters and timeline",
                    })}
                  >
                    <PanelToggleIcon />
                  </button>
                </div>
              )}
              <div className={sidebarHidden ? styles.mainContent : undefined}>
                <h1 className="text--center">
                  <Translate id="blog.archive.heading">Article Archives</Translate>
                </h1>

                {/* `<Interpolate>` rather than `<Translate>`: the count is a React element, and
                    `<Translate>` only accepts a plain string as children. This keeps the number
                    bold while leaving the sentence — and its word order — to the translator. */}
                <p className="text--center">
                  <Interpolate
                    values={{
                      count: (
                        <strong>
                          <BlogPostCount />
                        </strong>
                      ),
                    }}
                  >
                    {/* Two sentences, not one with a swapped number. `<BlogPostCount />` counts
                        the LOCALE corpus, so under `fr` the original read "We have published 4
                        articles on our blog!" — a statement about the blog itself, and a false
                        one: there are 257. The claim has to change with the corpus it describes,
                        not just its figure. */}
                    {translate(
                      isDefaultLocale
                        ? {
                            id: "blog.archive.publishedCount",
                            message: "We have published {count} articles on our blog!",
                          }
                        : {
                            id: "blog.archive.availableCount",
                            message: "{count} articles are available in this language.",
                          },
                    )}
                  </Interpolate>
                </p>

                {/* Renders nothing on `en`. Says how many of the 257 the {count} above stands
                    for. */}
                <TranslationCoverage variant="listing" />

                {years.length > 0 ? (
                  years.map((year) => (
                    <section key={year} className="col col--12">
                      <h2 className="margin-top--xl" id={year}>
                        {year}
                      </h2>
                      {Object.entries(postsByYearAndMonth[year]).map(([month, group]) => (
                        <div key={month}>
                          <h3 className={styles.monthHeading} id={`${year}-${month}`}>
                            {group.label} {year}
                            <a
                              href={`#${year}-${month}`}
                              className={styles.monthAnchor}
                              aria-label={translate(
                                {
                                  id: "blog.archive.linkTo",
                                  message: "Link to {month} {year}",
                                },
                                { month: group.label, year },
                              )}
                            >
                              #
                            </a>
                          </h3>
                          <div className="row">
                            {group.posts.map((post) => (
                              <PostCard key={post.permalink} post={post} layout="small" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </section>
                  ))
                ) : (
                  <p className="text--center">
                    <Translate id="blog.archive.noPosts">
                      No posts to display with the selected filters.
                    </Translate>
                  </p>
                )}
              </div>
            </main>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default Archives;
