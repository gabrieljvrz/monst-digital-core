import "./mascot-hero.css";

const mascotMotion = "/assets/mascote-hero-alpha.webp";
const mascotPoster = "/assets/mascote-hero-poster-640.png";

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
