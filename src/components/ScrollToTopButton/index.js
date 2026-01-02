import React, { useState, useEffect } from "react";
import clsx from "clsx";
import Translate, { translate } from "@docusaurus/Translate";
import styles from "./styles.module.css";
import buttontop from '@site/static/img/up.webp'

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [fly, setFly] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    setFly(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => setFly(false), 800);
  };

  return (
    <button
      type="button"
      className={clsx(
        styles.scrollBtn,
        isVisible && styles.show,
        fly && styles.fly
      )}
      onClick={scrollToTop}
      aria-label={translate({
        id: "theme.common.scrollToTop",
        message: "Scroll to top",
        description: "The aria label for the scroll to top button",
      })}
    >
      <img
        src={buttontop}
        alt={translate({
          id: "theme.common.scrollToTop",
          message: "Scroll to top",
        })}
        className="no-zoom"
        width="30"
        height="30"
      />
    </button>
  );
}
