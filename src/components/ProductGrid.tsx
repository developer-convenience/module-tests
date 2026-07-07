import { collectionItems, formatPrice } from "../assets";
import ImageSlot from "./ImageSlot";
import Reveal from "./Reveal";
import RevealGroup from "./RevealGroup";
import "./ProductGrid.css";

type ProductGridProps = {
  onSelect: (productId: string) => void;
  showHeader?: boolean;
};

export default function ProductGrid({ onSelect, showHeader = true }: ProductGridProps) {
  return (
    <section className="ls-product-grid" id="shop">
      <div className="ls-container">
        {showHeader && (
          <Reveal as="header" className="ls-product-grid__header">
            <p className="ls-eyebrow">Our Collection</p>
            <h2 className="ls-product-grid__title">Discover our bags &amp; leather goods</h2>
          </Reveal>
        )}

        <RevealGroup as="ul" className="ls-product-grid__list">
          {collectionItems.map((item) => (
            <li key={item.id} className="ls-product-grid__item ls-reveal-group__item">
              <button type="button" className="ls-product-grid__card" onClick={() => onSelect(item.id)}>
                <ImageSlot
                  src={item.image}
                  alt={item.nameKo}
                  aspectRatio="3 / 4"
                  label={item.image.split("/").pop() ?? ""}
                />
                <div className="ls-product-grid__info">
                  <span className="ls-product-grid__name-en">{item.name}</span>
                  <span className="ls-product-grid__name-ko">{item.nameKo}</span>
                  <span className="ls-product-grid__price">{formatPrice(item.price)}</span>
                </div>
              </button>
            </li>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
