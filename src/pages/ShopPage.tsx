import PageShell from "../components/PageShell";
import ProductGrid from "../components/ProductGrid";
import "./ShopPage.css";

type ShopPageProps = {
  onProductSelect: (productId: string) => void;
};

export default function ShopPage({ onProductSelect }: ShopPageProps) {
  return (
    <PageShell className="ls-shop-page">
      <header className="ls-page__header ls-container">
        <p className="ls-eyebrow">Shop</p>
        <h1 className="ls-page__title">All Leather Goods</h1>
        <p className="ls-page__intro" lang="ko">
          공방에서 한 점씩 완성하는 가죽 제품. 주문제작 가능한 아이템은 Custom에서
          옵션을 선택할 수 있습니다.
        </p>
      </header>
      <ProductGrid onSelect={onProductSelect} showHeader={false} />
    </PageShell>
  );
}
