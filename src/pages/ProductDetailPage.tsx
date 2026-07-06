import { formatPrice, getProduct } from "../assets";
import ImageSlot from "../components/ImageSlot";
import PageShell from "../components/PageShell";
import "./ProductDetailPage.css";

type ProductDetailPageProps = {
  productId: string;
  onBack: () => void;
  onCustom: (productId: string) => void;
  onAddToCart: () => void;
};

export default function ProductDetailPage({
  productId,
  onBack,
  onCustom,
  onAddToCart,
}: ProductDetailPageProps) {
  const product = getProduct(productId);

  if (!product) {
    return (
      <PageShell>
        <div className="ls-container ls-product-detail">
          <p>Product not found.</p>
          <button type="button" className="ls-link" onClick={onBack}>
            ← Back to shop
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="ls-product-detail-page">
      <div className="ls-container ls-product-detail">
        <button type="button" className="ls-link ls-page__back" onClick={onBack}>
          ← Back to shop
        </button>

        <div className="ls-product-detail__layout">
          <div className="ls-product-detail__media">
            <ImageSlot
              src={product.image}
              alt={product.nameKo}
              aspectRatio="3 / 4"
              label={product.image.split("/").pop() ?? ""}
            />
          </div>

          <div className="ls-product-detail__info">
            <p className="ls-eyebrow">{product.category.toUpperCase()}</p>
            <h1 className="ls-product-detail__title">{product.name}</h1>
            <p className="ls-product-detail__title-ko" lang="ko">
              {product.nameKo}
            </p>
            <p className="ls-product-detail__price">{formatPrice(product.price)}</p>

            <p className="ls-product-detail__desc">{product.description}</p>
            <p className="ls-product-detail__desc" lang="ko">
              {product.descriptionKo}
            </p>

            <dl className="ls-product-detail__meta">
              <div>
                <dt>Lead time</dt>
                <dd>{product.leadTime}</dd>
              </div>
              <div>
                <dt>Custom order</dt>
                <dd>{product.customAvailable ? "Available" : "Standard only"}</dd>
              </div>
            </dl>

            <div className="ls-product-detail__actions">
              <button type="button" className="ls-btn ls-btn--filled" onClick={onAddToCart}>
                Add to Cart
              </button>
              {product.customAvailable && (
                <button
                  type="button"
                  className="ls-btn"
                  onClick={() => onCustom(product.id)}
                >
                  Custom Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
