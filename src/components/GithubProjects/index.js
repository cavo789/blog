import React, { useEffect, useState } from "react";
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

  if (loading) return <p>Loading repositories...</p>;

  const renderRepoCard = (repo, isArchived = false) => {
    const languageColor =
      languageColors[repo.language] || languageColors.default;

    return (
      <div key={repo.id} className="col col--4 margin-bottom--lg">
        <Card
          shadow="md"
          className={styles.github_projects_card}
          style={{ borderTop: `5px solid ${languageColor}` }}
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

  return (
    <div className={`${styles.github_projects_container} container`}>
      {repos.length > 0 && (
        <>
          <h2>Active Repositories</h2>
          <div className="row">
            {repos.map((repo) => renderRepoCard(repo, false))}
          </div>
        </>
      )}
      {archivedRepos.length > 0 && (
        <>
          <h2>Archived Repositories</h2>
          <div className="row">
            {archivedRepos.map((repo) => renderRepoCard(repo, true))}
          </div>
        </>
      )}
    </div>
  );
}

GithubProjects.propTypes = {
  username: PropTypes.string.isRequired,
};
