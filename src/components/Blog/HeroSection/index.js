import React, { useState } from "react";
import { Volume2, VolumeX, ArrowRight } from "lucide-react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import styles from "./styles.module.css";

const HeroSection = ({ videoFileName }) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoSrc = useBaseUrl(`/img/${videoFileName}`);

  return (
    <header className={styles.heroHeader}>
      <div className={styles.heroGrid}>
        <div className={styles.introText}>
          <h1>
            <Translate
              id="homepage.hero.title"
              values={{ name: <span>Christophe</span> }}
            >
              {"Hi, I'm {name}"}
            </Translate>
          </h1>
          <p>
            <Translate id="homepage.hero.description">
              Welcome to my digital garden. I share practical guides on
              streamlining workflows with Docker, Linux, Python, PHP, Quarto,
              Docusaurus, ...
            </Translate>
          </p>

          <div className={styles.buttonsContainer}>
            <Link className="button button--primary button--lg" to="/blog">
              <Translate id="homepage.hero.readBlog">Read the Blog</Translate>{" "}
              <ArrowRight size={18} className={styles.arrowIcon} />
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/blog/archive"
            >
              <Translate id="homepage.hero.archive">Archive</Translate>
            </Link>
          </div>
        </div>

        <div className={styles.videoWrapper}>
          <video
            className={styles.videoElement}
            src={videoSrc}
            autoPlay
            muted={isMuted}
            loop
            playsInline
          />

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={styles.muteButton}
            aria-label={
              isMuted
                ? translate({
                    id: "homepage.hero.video.unmute",
                    message: "Unmute",
                  })
                : translate({
                    id: "homepage.hero.video.mute",
                    message: "Mute",
                  })
            }
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
