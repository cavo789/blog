import React, { useState } from "react";
import { Volume2, VolumeX, ArrowRight } from "lucide-react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Link from "@docusaurus/Link"; // Pour les liens internes optimisés
import styles from "./styles.module.css";

const HeroSection = ({ videoFileName }) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoSrc = useBaseUrl(`/img/${videoFileName}`);

  return (
    <header className={styles.heroHeader}>
      <div className={styles.heroGrid}>
        {/* Colonne Gauche : Le Pitch */}
        <div className={styles.introText}>
          <h1>
            Hi, I'm <span>Christophe</span>
          </h1>
          <p>
            Welcome to my digital garden. I share practical guides on
            streamlining workflows with Docker, Linux, Python, PHP, Quarto,
            Docusaurus, ...
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link className="button button--primary button--lg" to="/blog">
              Read the Blog{" "}
              <ArrowRight size={18} style={{ marginLeft: "8px" }} />
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/blog/archive"
            >
              Archive
            </Link>
          </div>
        </div>

        {/* Colonne Droite : La Vidéo */}
        <div className={styles.videoWrapper}>
          <video
            className={styles.videoElement}
            src={videoSrc}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            // Important : cover permet de remplir le cadre sans déformer
          />

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={styles.muteButton}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
