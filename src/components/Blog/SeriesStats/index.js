import React from "react";
import Translate from "@docusaurus/Translate";
import { generateSeriesList } from "@site/src/components/Blog/utils/series";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";

/**
 * Displays a one-line summary of how many series exist and how many
 * published articles they contain in total.
 */
export default function SeriesStats() {
  const seriesCount = generateSeriesList().length;
  const articleCount = getBlogMetadata().filter(
    (post) => post.series && !post.draft
  ).length;

  return (
    <p className="seriesStats">
      <Translate
        id="blog.seriesStats.summary"
        values={{ seriesCount, articleCount }}
      >
        {"A collection of {seriesCount} series · {articleCount} articles total"}
      </Translate>
    </p>
  );
}
