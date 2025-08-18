import Layout from "@theme/Layout";
import { getBlogMetadata } from "@site/src/components/utils/blogPosts";
import Link from "@docusaurus/Link";

import Card from "@site/src/components/Card";
import CardImage from '@site/src/components/Card/CardImage';
import CardBody from '@site/src/components/Card/CardBody';

export default function SeriesPage() {
  const blogPosts = getBlogMetadata();
  const seriesMap = {};

  blogPosts.forEach((post) => {
    const seriesName = post.serie;
    if (seriesName) {
      if (!seriesMap[seriesName]) {
        seriesMap[seriesName] = [];
      }
      seriesMap[seriesName].push(post);
    }
  });

  const sortedSeriesNames = Object.keys(seriesMap).sort();

  return (
    <Layout title="Article series">
      <div className="container margin-top--lg margin-bottom--lg">
        <h1>All article series</h1>
        {sortedSeriesNames.length > 0 ? (
          <div className="row">
            {sortedSeriesNames.map((seriesName) => {
              const seriesPosts = seriesMap[seriesName];
              const sortedPosts = seriesPosts.sort(
                (a, b) => new Date(a.date) - new Date(b.date)
              );

              const firstPost = sortedPosts[0];
              const image = firstPost.image || "default.jpg"; // fallback image
              const description =
                firstPost.description ||
                `${seriesPosts.length} article(s) in this series`;

              return (
                <div key={seriesName} className="col col--4 margin-bottom--lg">
                  <Link href={firstPost.permalink}>
                    <Card>
                      <CardImage
                        cardImageUrl={`${image}`}
                      />
                      <CardBody
                        className="padding-vert--md text--center"
                        textAlign="center"
                        transform="uppercase"
                      >
                        <h3>{seriesName}</h3>
                        <p>{description}&nbsp;→</p>
                      </CardBody>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No series of articles found.</p>
        )}
      </div>
    </Layout>
  );
}
