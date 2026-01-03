import AlertBox from "@site/src/components/Blog/AlertBox";
import BrowserWindow from "@site/src/components/BrowserWindow";
import Card from "@site/src/components/Card";
import CardBody from "@site/src/components/Card/CardBody";
import CardFooter from "@site/src/components/Card/CardFooter";
import CardHeader from "@site/src/components/Card/CardHeader";
import CardImage from "@site/src/components/Card/CardImage";
import Column from "@site/src/components/Column";
import Columns from "@site/src/components/Columns";
import Details from "@site/src/components/Details";
import Hero from "@site/src/components/Hero";
import Highlight from "@site/src/components/Highlight";
import Link from "@docusaurus/Link";
import LogoIcon from "@site/src/components/Blog/LogoIcon";
import MDXComponents from "@theme-original/MDXComponents";
import Snippet from "@site/src/components/Snippet";
import StepsCard from "@site/src/components/StepsCard";
import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";
import Terminal from "@site/src/components/Terminal";
import TOCInline from "@theme/TOCInline";
import Trees from "@site/src/components/Trees";
import Folder from "@site/src/components/Trees/Folder";
import File from "@site/src/components/Trees/File";

import ProjectSetup, {
  EmptyFolder,
  Guideline,
} from "@site/src/components/ProjectSetup/index.js";

export default {
  // Reusing the default mapping
  ...MDXComponents,
  AlertBox,
  BrowserWindow,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardImage,
  Column,
  Columns,
  Details,
  EmptyFolder,
  File,
  Folder,
  Guideline,
  Hero,
  Highlight,
  Link,
  LogoIcon,
  ProjectSetup,
  Snippet,
  StepsCard,
  TabItem,
  Tabs,
  Terminal,
  TOCInline,
  Trees,
};
