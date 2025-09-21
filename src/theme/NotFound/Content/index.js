import clsx from "clsx";
import Translate from "@docusaurus/Translate";
import Heading from "@theme/Heading";
export default function NotFoundContent({ className }) {
  return (
    <main className={clsx("container ", className)}>
      <img src="/img/404.jpg" alt="Page Not Found" />
    </main>
  );
}
