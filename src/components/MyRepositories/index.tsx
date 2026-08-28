/**
 * 📁 MyRepositories Component
 *
 * A layout wrapper for showcasing a user's GitHub repositories.
 * Combines a hero section with a dynamic list of public repositories
 * fetched from GitHub and displayed via the `GithubProjects` component.
 *
 * Behavior:
 * - Renders a hero intro with a title and description
 * - Passes the `username` prop to the `GithubProjects` component
 * - Displays both active and archived repositories
 *
 * Styling:
 * - Uses scoped styles from `styles.module.css`
 * - Applies layout styling to the main container
 *
 * Returns:
 * - A full-page section with a header and repository grid
 */

import type { JSX } from "react";
import Translate from "@docusaurus/Translate";
import GithubProjects from "@site/src/components/GithubProjects";
import Hero from "@site/src/components/Hero";

import styles from "./styles.module.css";

interface Props {
  /** GitHub username whose repositories will be displayed */
  username: string;
}

export default function MyRepositories({ username }: Props): JSX.Element {
  return (
    <main className={styles.main}>
      <Hero>
        <h1>
          <Translate id="myRepositories.title">My GitHub Projects</Translate>
        </h1>
        <p>
          <Translate id="myRepositories.description.intro">
            Below you&apos;ll find a list of my public repositories stored on GitHub.com.
            They&apos;re divided in two parts; the active and the inactive ones.
          </Translate>
          <br />
          <Translate id="myRepositories.description.usage">
            Feel free to grab the code and reuse it in your project if it can help.
          </Translate>
        </p>
      </Hero>
      <GithubProjects username={username} />
    </main>
  );
}
