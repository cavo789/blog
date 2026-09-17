import React from "react";
import Translate from "@docusaurus/Translate";
import { useSeriesList } from "@site/src/components/Blog/utils/series";
import { useBlogMetadata } from "@site/src/components/Blog/utils/posts";

/**
 * Displays a one-line summary of how many series exist and how many
 * published articles they contain in total.
 */
export default function SeriesStats(): React.JSX.Element {
  const seriesCount = useSeriesList().length;
  const articleCount = useBlogMetadata().filter((post) => post.series).length;

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
