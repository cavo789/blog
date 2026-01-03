import React from "react";
import { translate } from "@docusaurus/Translate";
import { PageMetadata } from "@docusaurus/theme-common";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

export default function NotFound() {
  const title = translate({
    id: "theme.NotFound.title",
    message: "Page Not Found",
  });
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
                style={{
                  maxWidth: "400px",
                  width: "100%",
                  marginBottom: "2rem",
                }}
              />
              <h1 className="hero__title">
                {translate({
                  id: "theme.NotFound.title",
                  message: "Oh no! It looks like you're lost.",
                })}
              </h1>
              <p>
                Don't worry, your meerkat companions are pointing the way back
                to the main burrow.
              </p>
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
