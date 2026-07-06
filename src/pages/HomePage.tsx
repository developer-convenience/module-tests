import { images } from "../assets";
import Hero from "../components/Hero";
import EditorialBlock from "../components/EditorialBlock";
import ProductGrid from "../components/ProductGrid";
import AtelierSection from "../components/AtelierSection";
import Footer from "../components/Footer";

type HomePageProps = {
  onDiscover: () => void;
  onProductSelect: (productId: string) => void;
};

export default function HomePage({ onDiscover, onProductSelect }: HomePageProps) {
  return (
    <main>
      <Hero onDiscover={onDiscover} />
      <EditorialBlock
        imageSrc={images.editorial01}
        imageLabel="editorial-01.jpg"
        imageAlt="가죽 질감 클로즈업"
        eyebrow="New In"
        title="Explore what's new"
        body="새로운 시즌 컬렉션은 공방의 일상에서 시작됩니다. 재단된 가죽 조각, 실밥의 색, 손끝의 온기까지 — 제품이 완성되기 전의 순간들을 담았습니다."
      />
      <EditorialBlock
        imageSrc={images.editorial02}
        imageLabel="editorial-02.jpg"
        imageAlt="핸드 스티치 디테일"
        eyebrow="Personalisation"
        title="Made uniquely yours"
        body="모노그램 각인, 스티치 컬러, 가죽 선택까지. 주문제작은 대화에서 시작됩니다. 당신만의 한 점을 함께 설계해 드립니다."
        reversed
      />
      <ProductGrid onSelect={onProductSelect} />
      <AtelierSection />
      <Footer />
    </main>
  );
}
