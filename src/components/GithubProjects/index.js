/**
 * GithubProjects Component
 *
 * Displays a dynamic grid of GitHub repositories for a given user.
 * Repositories are fetched from the GitHub API and cached locally for performance.
 * Users can filter repositories by language, archived status, minimum star count,
 * and search by keyword (name or description).
 *
 * Features:
 * - Fetches all public repositories for a specified GitHub username
 * - Caches repository data in localStorage for 24 hours
 * - Separates active and archived repositories
 * - Sorts repositories by popularity (stars) or alphabetically
 * - Dynamically generates language filter options from fetched data
 * - Provides a search bar for keyword filtering
 * - Applies visual enhancements including fade-in animation and language-based styling
 *
 * Props:
 * @param {string} username - GitHub username to fetch repositories for (required)
 *
 * Example usage:
 * <GithubProjects username="cavo789" />
 */

import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import Card from "@site/src/components/Card";
import CardHeader from "@site/src/components/Card/CardHeader";
import CardFooter from "@site/src/components/Card/CardFooter";
import CardBody from "@site/src/components/Card/CardBody";
import styles from "./styles.module.css";
import { FaStar, FaCodeBranch } from "react-icons/fa";

// GitHub language colors
const languageColors = {
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  TypeScript: "#2b7489",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  default: "#6a82fb",
};

// Sort repositories
const sortRepos = (repos, isArchived) => {
  if (isArchived) {
    return [...repos].sort((a, b) => a.name.localeCompare(b.name));
  }
  return [...repos].sort((a, b) => {
    if (a.stargazers_count !== b.stargazers_count) {
      return b.stargazers_count - a.stargazers_count;
    }
    return a.name.localeCompare(b.name);
  });
};

export default function GithubProjects({ username }) {
  const [repos, setRepos] = useState([]);
  const [archivedRepos, setArchivedRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    language: "All",
    archived: "All",
    minStars: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const loadCachedRepos = () => {
    const cachedData = localStorage.getItem("githubRepos");
    const now = new Date().getTime();
    if (cachedData) {
      const { repos, expiration } = JSON.parse(cachedData);
      if (expiration > now) {
        return repos;
      }
    }
    return null;
  };

  const fetchAllRepos = async () => {
    const allRepos = [];
    let page = 1;
    const perPage = 100;

    try {
      let hasMoreRepos = true;
      while (hasMoreRepos) {
        const response = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`
        );
        const data = await response.json();
        if (data.length > 0) {
          allRepos.push(...data);
          page++;
        } else {
          hasMoreRepos = false;
        }
      }

      const archived = allRepos.filter((repo) => repo.archived);
      const nonArchived = allRepos.filter((repo) => !repo.archived);
      setRepos(sortRepos(nonArchived, false));
      setArchivedRepos(sortRepos(archived, true));

      const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem(
        "githubRepos",
        JSON.stringify({ repos: allRepos, expiration: expirationTime })
      );
    } catch (error) {
      console.error("Error fetching GitHub repositories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = loadCachedRepos();
    if (cached) {
      const archived = cached.filter((repo) => repo.archived);
      const nonArchived = cached.filter((repo) => !repo.archived);
      setRepos(sortRepos(nonArchived, false));
      setArchivedRepos(sortRepos(archived, true));
      setLoading(false);
    } else {
      fetchAllRepos();
    }
  }, [username]);

  const allRepos = useMemo(
    () => [...repos, ...archivedRepos],
    [repos, archivedRepos]
  );

  const languageOptions = useMemo(() => {
    const langs = new Set();
    allRepos.forEach((repo) => {
      if (repo.language) langs.add(repo.language);
    });
    return Array.from(langs).sort();
  }, [allRepos]);

  const getFilteredRepos = () => {
    return allRepos.filter((repo) => {
      const matchesLanguage =
        filters.language === "All" || repo.language === filters.language;
      const matchesArchived =
        filters.archived === "All" ||
        String(repo.archived) === filters.archived;
      const matchesStars = repo.stargazers_count >= filters.minStars;
      const matchesSearch =
        searchTerm.trim() === "" ||
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description &&
          repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return (
        matchesLanguage && matchesArchived && matchesStars && matchesSearch
      );
    });
  };

  const filteredRepos = getFilteredRepos();

  const renderRepoCard = (repo, isArchived = false) => {
    const languageColor =
      languageColors[repo.language] || languageColors.default;

    return (
      <div
        key={repo.id}
        className={`col col--4 margin-bottom--lg ${styles.fadeIn}`}
      >
        <Card
          shadow="md"
          className={styles.github_projects_card}
          style={{
            borderTop: `5px solid ${languageColor}`,
            boxShadow: `0 -2px 10px ${languageColor}55`,
          }}
        >
          <CardHeader>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.repo_link}
            >
              {repo.name}
              {isArchived && (
                <span className={styles.archived_label}> (Archived)</span>
              )}
            </a>
          </CardHeader>

          <CardBody>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <p>{repo.description || "No description available"}</p>
            </a>
          </CardBody>

          <CardFooter>
            <FaStar /> {repo.stargazers_count} <FaCodeBranch />{" "}
            {repo.forks_count}{" "}
            <span
              className={styles.language_dot}
              style={{ backgroundColor: languageColor }}
            ></span>
            {repo.language || "Unknown"}
          </CardFooter>
        </Card>
      </div>
    );
  };

  if (loading) return <p>Loading repositories...</p>;

  return (
    <div className={`${styles.github_projects_container} container`}>
      <div className={styles.filters_panel}>
        <label>
          Search:
          <input
            type="text"
            placeholder="Search by name or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>

        <label>
          Language:
          <select
            value={filters.language}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, language: e.target.value }))
            }
          >
            <option value="All">All</option>
            {languageOptions.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status:
          <select
            value={filters.archived}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, archived: e.target.value }))
            }
          >
            <option value="All">All</option>
            <option value="false">Active</option>
            <option value="true">Archived</option>
          </select>
        </label>

        <label>
          Min Stars:
          <input
            type="number"
            value={filters.minStars}
            min="0"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minStars: Number(e.target.value),
              }))
            }
          />
        </label>
      </div>

      {filteredRepos.length > 0 ? (
        <div className="row">
          {filteredRepos.map((repo) => renderRepoCard(repo, repo.archived))}
        </div>
      ) : (
        <p>No repositories match your filters.</p>
      )}
    </div>
  );
}

GithubProjects.propTypes = {
  username: PropTypes.string.isRequired,
};
