import { images } from "../assets";
import ImageSlot from "./ImageSlot";
import Reveal from "./Reveal";
import "./AtelierSection.css";

type AtelierSectionProps = {
  onVisitAtelier?: () => void;
};

export default function AtelierSection({ onVisitAtelier }: AtelierSectionProps) {
  return (
    <section className="ls-atelier" id="atelier">
      <Reveal className="ls-atelier__banner">
        <ImageSlot
          src={images.atelierWide}
          alt="가죽 공방 작업대"
          aspectRatio="21 / 9"
          label="atelier-wide.jpg"
          className="ls-atelier__wide"
        />
        <div className="ls-atelier__banner-overlay" aria-hidden />
        <div className="ls-atelier__banner-text ls-container">
          <p className="ls-eyebrow">Craft Beyond Borders</p>
          <h2 className="ls-atelier__title">Cut · Edge · Stitch · Finish</h2>
          {onVisitAtelier ? (
            <button
              type="button"
              className="ls-link ls-atelier__visit"
              onClick={onVisitAtelier}
            >
              공방 둘러보기 →
            </button>
          ) : null}
        </div>
      </Reveal>

      <div className="ls-atelier__body ls-container">
        <Reveal className="ls-atelier__portrait" variant="left">
          <ImageSlot
            src={images.atelierPortrait}
            alt="장인"
            aspectRatio="3 / 4"
            label="atelier-portrait.jpg"
          />
        </Reveal>
        <Reveal className="ls-atelier__story" variant="right" delay={0.15}>
          <h3 className="ls-atelier__story-title">The Oldest Craft, Made by Hand</h3>
          <p>
            식물성 무두질 가죽만을 사용합니다. 재단부터 마감까지 한
            작업대에서, 주문 한 점마다 2–3주의 시간을 드립니다.
          </p>
          <p>
            Maison의 heritage가 브랜드의 시작이라면, 우리는 Atelier
            손끝에서 이어지는 이야기를 전합니다.
          </p>
          {onVisitAtelier ? (
            <button type="button" className="ls-link" onClick={onVisitAtelier}>
              공방 둘러보기 →
            </button>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
