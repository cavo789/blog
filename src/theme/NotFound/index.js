import React, { useEffect, useState } from "react";
import Translate, { translate } from "@docusaurus/Translate";
import useBaseUrl from "@docusaurus/useBaseUrl";
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

/**
 * The five wordings, one picked at random per visit.
 *
 * Listed one `translate()` call at a time rather than mapped over an array of strings:
 * `yarn write-translations` reads the AST, so each `id`/`message` pair has to be a literal at
 * its own call site or the key is never extracted and the French page keeps the English text.
 */
function lostMessages() {
  return [
    translate({
      id: "theme.NotFound.lost.companions",
      message:
        "Don't worry, your meerkat companions are pointing the way back to the main burrow.",
    }),
    translate({
      id: "theme.NotFound.lost.sentries",
      message:
        "Our sentries scanned the horizon and found... nothing. This page doesn't exist.",
    }),
    translate({
      id: "theme.NotFound.lost.dug",
      message: "The meerkat colony dug everywhere and still couldn't find this page.",
    }),
    translate({
      id: "theme.NotFound.lost.tiptoes",
      message:
        "Even standing on their tiptoes, the meerkats can't spot this page anywhere.",
    }),
    translate({
      id: "theme.NotFound.lost.burrow",
      message: "This burrow is empty. The meerkats suggest heading back home.",
    }),
  ];
}

export default function NotFound() {
  const title = translate({
    id: "theme.NotFound.title",
    message: "Page Not Found",
  });
  const [message] = useState(() => {
    const messages = lostMessages();
    return messages[Math.floor(Math.random() * messages.length)];
  });
  // Front-matter-style static path: it carries no locale prefix of its own, so under `fr` a bare
  // "/img/404.webp" resolves to the SPA fallback and the illustration never paints.
  const imageUrl = useBaseUrl("/img/404.webp");
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
                src={imageUrl}
                alt={translate({
                  id: "theme.NotFound.imageAlt",
                  message: "A group of meerkats looking confused.",
                })}
                className={styles.notFoundImg}
              />
              {/* Its own id: this used to reuse `theme.NotFound.title`, the <meta> title above.
                  English never showed it — a missing key falls back to each call's own
                  `message` — but as soon as French supplied one, both rendered "Page
                  introuvable" and the heading lost its wording. */}
              <h1 className="hero__title">
                {translate({
                  id: "theme.NotFound.heading",
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
                <Translate id="theme.NotFound.search">Search the site</Translate>
              </button>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
}
