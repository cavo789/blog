import BlueskyShare from "./share";
import styles from "./styles.module.css";

interface Props {
  metadata: {
    frontMatter?: {
      blueskyRecordKey?: string;
    };
  };
}

export default function Bluesky({ metadata }: Props) {
  return (
    <div className={styles.blueskyContainer}>
      <BlueskyShare metadata={metadata} />
    </div>
  );
}
