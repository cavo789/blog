
import Card from '@site/src/components/Card';
import CardBody from '@site/src/components/Card/CardBody';
import CardImage from '@site/src/components/Card/CardImage';
import styles from "./styles.module.css";

export default function HomeCard({ title, image, link, description }) {
  // use col--2 for all cards on the same row row
  // by using col--4, three cards will be displayed in a row
  return (
    <div className={`${styles.fade_in} card col col--2 margin-bottom--lg`}>
      <a href={link}>
        <Card>
          <CardImage cardImageUrl={`/img/homepage/${image}`} />
          <CardBody className="padding-vert--md text--center" textAlign='center' transform='uppercase'>
            <h3>{title}</h3>
            <p>{description}&nbsp;→</p>
          </CardBody>
        </Card>
      </a>
    </div>
  );
}
