/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo, type CSSProperties, type ReactNode, type JSX } from "react";
import clsx from "clsx";
import { useVarResolver } from "@site/src/components/Vars/store";
import { substitutePlainText } from "@site/src/components/Vars/substitute";

import styles from "./styles.module.css";

interface Props {
  children: JSX.Element;
  minHeight?: number;
  url: string;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
}

export default function BrowserWindow({
  children,
  minHeight,
  url = "http://localhost:3000",
  style,
  bodyStyle,
}: Props): JSX.Element {
  // Same `%%name=default%%` marker Terminal/Snippet resolve (see
  // src/components/Vars/substitute.js) — the address bar is decorative text
  // only (never a real iframe navigation, see IframeWindow.tsx for that
  // separate case), so a plain string swap is enough: no VarToken/dotted
  // underline here, matching Snippet's own `code=`/`source=` string path.
  const resolve = useVarResolver();
  const resolvedUrl = useMemo(() => substitutePlainText(url, resolve), [url, resolve]);

  return (
    <div className={styles.browserWindow} style={{ ...style, minHeight }}>
      <div className={styles.browserWindowHeader}>
        <div className={styles.buttons}>
          <span className={styles.dot} style={{ background: "#f25f58" }} />
          <span className={styles.dot} style={{ background: "#fbbe3c" }} />
          <span className={styles.dot} style={{ background: "#58cb42" }} />
        </div>
        <div className={clsx(styles.browserWindowAddressBar, "text--truncate")}>
          {resolvedUrl}
        </div>
        <div className={styles.browserWindowMenuIcon}>
          <div>
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.bar} />
          </div>
        </div>
      </div>

      <div className={styles.browserWindowBody} style={bodyStyle}>
        {children}
      </div>
    </div>
  );
}
