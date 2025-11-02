import React, { useState, useEffect } from "react";
import clsx from "clsx";
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
    <div
      className={clsx(
        styles.scrollBtn,
        isVisible && styles.show,
        fly && styles.fly
      )}
      onClick={scrollToTop}
    >
      <img
        src={buttontop}
        alt="Back to top"
        className="no-zoom"
        width="30"
        height="30"
      />
    </div>
  );
}
