import React from "react";

import MDXComponents from "@theme-original/MDXComponents";
import Card from "@site/src/components/Card";
import CardBody from "@site/src/components/Card/CardBody";
import CardFooter from "@site/src/components/Card/CardFooter";
import CardHeader from "@site/src/components/Card/CardHeader";
import CardImage from "@site/src/components/Card/CardImage";
import Column from "@site/src/components/Column";
import Columns from "@site/src/components/Columns";
import HomeCard from "@site/src/components/HomeCard";
import Image from "@site/src/components/Image";
import Link from '@docusaurus/Link';
import Snippet from "@site/src/components/Snippet";
import StepsCard from "@site/src/components/StepsCard";
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import Terminal from "@site/src/components/Terminal";
import TOCInline from '@theme/TOCInline';
import UpdateAt from "@site/src/components/Updated";

export default {
  // Reusing the default mapping
  ...MDXComponents,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardImage,
  Column,
  Columns,
  HomeCard,
  Image,
  Snippet,
  StepsCard,
  TabItem,
  Terminal,
  Tabs,
  Link,
  TOCInline,
  UpdateAt,
};
