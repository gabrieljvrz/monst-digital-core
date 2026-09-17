import mascotMotion from "@/assets/mascote-hero-alpha.webp";
import mascotPoster from "@/assets/mascote-hero-poster-640.png";
import "./mascot-hero.css";

export function MascotHeroVideo() {
  return (
    <div className="hero-mascot-motion" aria-hidden="true">
      <img
        className="hero-mascot-static"
        src={mascotPoster}
        alt=""
        width="640"
        height="640"
        decoding="async"
      />
      <img
        className="hero-mascot-animated"
        src={mascotMotion}
        alt=""
        width="960"
        height="960"
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}
