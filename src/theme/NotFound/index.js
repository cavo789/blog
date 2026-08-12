import React, { useEffect, useState } from "react";
import { translate } from "@docusaurus/Translate";
import { PageMetadata } from "@docusaurus/theme-common";
import { useLocation } from "@docusaurus/router";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { openPalette } from "@site/src/components/CommandPalette/paletteBus";
import styles from "./styles.module.css";

/** Turns a failed URL's last segment into a plausible search query — "docker-cs-fixer" → "docker cs fixer". */
function guessQueryFromPath(pathname) {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  return segment.replace(/[-_]+/g, " ").trim();
}

const LOST_MESSAGES = [
  "Don't worry, your meerkat companions are pointing the way back to the main burrow.",
  "Our sentries scanned the horizon and found... nothing. This page doesn't exist.",
  "The meerkat colony dug everywhere and still couldn't find this page.",
  "Even standing on their tiptoes, the meerkats can't spot this page anywhere.",
  "This burrow is empty. The meerkats suggest heading back home.",
];

export default function NotFound() {
  const title = translate({
    id: "theme.NotFound.title",
    message: "Page Not Found",
  });
  const [message] = useState(
    () => LOST_MESSAGES[Math.floor(Math.random() * LOST_MESSAGES.length)],
  );
  const location = useLocation();
  const query = guessQueryFromPath(location.pathname);

  // The moment a visitor most needs the search tool is right here — open the command
  // palette pre-filled with the failed URL instead of waiting for them to find `Ctrl+K`.
  useEffect(() => {
    openPalette(query);
  }, [query]);

  return (
    <>
      <PageMetadata title={title} />
      <Layout>
        <main className="container margin-vert--xl">
          <div className="row">
            <div className="col col--6 col--offset-3 text--center">
              <img
                src="/img/404.webp"
                alt={translate({
                  id: "theme.NotFound.imageAlt",
                  message: "A group of meerkats looking confused.",
                })}
                className={styles.notFoundImg}
              />
              <h1 className="hero__title">
                {translate({
                  id: "theme.NotFound.title",
                  message: "Oh no! It looks like you're lost.",
                })}
              </h1>
              <p>{message}</p>
              <Link to="/" className="button button--primary button--lg">
                {translate({
                  id: "theme.NotFound.backToHome",
                  message: "Take me back to the homepage",
                })}
              </Link>{" "}
              <button
                type="button"
                className="button button--secondary button--lg"
                onClick={() => openPalette(query)}
              >
                Search the site
              </button>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
}
