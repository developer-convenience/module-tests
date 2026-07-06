import { images } from "../assets";
import ImageSlot from "./ImageSlot";
import "./Hero.css";

type HeroProps = {
  onDiscover?: () => void;
};

export default function Hero({ onDiscover }: HeroProps) {
  return (
    <section className="ls-hero">
      <div className="ls-hero__media">
        <ImageSlot
          src={images.heroMain}
          alt="장인의 손길로 이어지는 가죽 스티칭"
          aspectRatio="16 / 9"
          label="hero-main.jpg"
          className="ls-hero__image"
        />
        <div className="ls-hero__overlay" aria-hidden />
      </div>

      <div className="ls-hero__content">
        <div className="ls-hero__copy">
          <p className="ls-eyebrow ls-hero__eyebrow">Handmade Leather Atelier</p>
          <h1 className="ls-hero__title">Crafted for a Lifetime</h1>
          <p className="ls-hero__subtitle" lang="ko">
            한 땀 한 땀, 시간이 빚어낸 가죽의 온기
          </p>
          <button type="button" className="ls-link ls-hero__discover" onClick={onDiscover}>
            Discover
          </button>
        </div>
      </div>
    </section>
  );
}
