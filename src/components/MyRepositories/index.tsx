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
import clsx from "clsx";
import Translate from "@docusaurus/Translate";
import GithubProjects from "@site/src/components/GithubProjects";

import styles from "./styles.module.css";

interface Props {
  /** GitHub username whose repositories will be displayed */
  username: string;
}

export default function MyRepositories({ username }: Props): JSX.Element {
  return (
    <main className={styles.main}>
      {/* Plain heading, no gradient banner — the Hero component (Infima hero--primary) was
          used only here, the one page on the site with a colored banner. Every other listing
          page (/blog, /series, /faq) uses a plain <h1> + description. */}
      <div className={clsx("container", styles.pageHeader)}>
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
      </div>
      <GithubProjects username={username} />
    </main>
  );
}
