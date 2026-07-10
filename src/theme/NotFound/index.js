import React, { useState } from "react";
import { translate } from "@docusaurus/Translate";
import { PageMetadata } from "@docusaurus/theme-common";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

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
              </Link>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
}
