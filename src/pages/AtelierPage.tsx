import { images } from "../assets";
import AtelierSection from "../components/AtelierSection";
import EditorialBlock from "../components/EditorialBlock";
import ImageSlot from "../components/ImageSlot";
import PageShell from "../components/PageShell";
import "./AtelierPage.css";

export default function AtelierPage() {
  return (
    <PageShell className="ls-atelier-page">
      <header className="ls-page__header ls-container">
        <p className="ls-eyebrow">La Maison</p>
        <h1 className="ls-page__title">Our Atelier</h1>
        <p className="ls-page__intro" lang="ko">
          1829년 Delvaux가 Maison을 열었듯, 우리는 작은 공방에서 시작했습니다.
          재단 · 마감 · 스티치 — 모든 과정이 한 작업대 위에서 이어집니다.
        </p>
      </header>

      <div className="ls-atelier-page__hero ls-container">
        <ImageSlot
          src={images.atelierWide}
          alt="공방 작업대"
          aspectRatio="21 / 9"
          label="atelier-wide.jpg"
        />
      </div>

      <EditorialBlock
        imageSrc={images.atelierPortrait}
        imageLabel="atelier-portrait.jpg"
        imageAlt="장인"
        eyebrow="Craftsmanship"
        title="Hands that know leather"
        body="20년 넘게 같은 작업대에서 가죽만 다뤄온 장인들. 재료의 결을 읽고, 실의 장력을 조절하는 일은 앞으로도 손끝에서만 가능합니다."
        reversed
      />

      <EditorialBlock
        imageSrc={images.editorial01}
        imageLabel="editorial-01.jpg"
        imageAlt="가죽 질감"
        eyebrow="Materials"
        title="Vegetable-tanned only"
        body="식물성 무두질 가죽만 사용합니다. 시간이 지날수록 깊어지는 patina, 사용할수록 자신만의 기록이 새겨지는 재료입니다."
      />

      <AtelierSection />
    </PageShell>
  );
}
