import PropTypes from "prop-types";
import GithubProjects from "@site/src/components/GithubProjects";
import Hero from "@site/src/components/Hero";
import Layout from "@theme/Layout";

import styles from "./styles.module.css";

export default function MyRepositories({ username }) {
  return (
    <main className={styles.main}>
      <Hero>
        <h1>My GitHub Projects</h1>
        <p>
          Below you'll find a list of my public repositories stored on
          GitHub.com. They're divided in two parts; the active and the inactive
          ones.
          <br />
          Feel free to grab the code and reuse it in your project if it can
          help.
        </p>
      </Hero>
      <GithubProjects username={username} />
    </main>
  );
}

MyRepositories.propTypes = {
  username: PropTypes.string.isRequired,
};
