import { useState } from "react";
import { collectionItems, formatPrice, getProduct } from "../assets";
import type { CartLineCustom } from "../cart";
import { leatherSwatches, stitchColors } from "../routes";
import PageShell from "../components/PageShell";
import "./CustomPage.css";

type CustomPageProps = {
  productId?: string;
  onBack: () => void;
  onAddToCart: (item: Omit<CartLineCustom, "kind" | "lineId" | "quantity">) => void;
};

const STEPS = ["Product", "Leather", "Personalize", "Review"] as const;

export default function CustomPage({ productId, onBack, onAddToCart }: CustomPageProps) {
  const [step, setStep] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(
    productId ?? collectionItems.find((p) => p.customAvailable)?.id ?? "",
  );
  const [leatherId, setLeatherId] = useState(leatherSwatches[0].id);
  const [stitchId, setStitchId] = useState(stitchColors[0].id);
  const [monogram, setMonogram] = useState("");

  const product = getProduct(selectedProductId);
  const customProducts = collectionItems.filter((p) => p.customAvailable);
  const leather = leatherSwatches.find((s) => s.id === leatherId)!;
  const stitch = stitchColors.find((s) => s.id === stitchId)!;

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <PageShell className="ls-custom-page">
      <div className="ls-container ls-custom">
        <button type="button" className="ls-link ls-page__back" onClick={onBack}>
          ← Back
        </button>

        <header className="ls-custom__header">
          <p className="ls-eyebrow">Custom Order</p>
          <h1 className="ls-page__title">Made uniquely yours</h1>
        </header>

        <ol className="ls-custom__steps" aria-label="주문제작 단계">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`ls-custom__step ${i === step ? "is-active" : ""} ${i < step ? "is-done" : ""}`}
            >
              <span className="ls-custom__step-num">{i + 1}</span>
              <span className="ls-custom__step-label">{label}</span>
            </li>
          ))}
        </ol>

        <div className="ls-custom__panel">
          {step === 0 && (
            <div className="ls-custom__section">
              <h2 className="ls-custom__section-title">Choose product</h2>
              <ul className="ls-custom__product-list">
                {customProducts.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`ls-custom__product-option ${selectedProductId === item.id ? "is-selected" : ""}`}
                      onClick={() => setSelectedProductId(item.id)}
                    >
                      <span className="ls-custom__product-name">{item.name}</span>
                      <span className="ls-custom__product-name-ko" lang="ko">
                        {item.nameKo}
                      </span>
                      <span className="ls-custom__product-price">{formatPrice(item.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 1 && (
            <div className="ls-custom__section">
              <h2 className="ls-custom__section-title">Select leather</h2>
              <div className="ls-custom__swatches">
                {leatherSwatches.map((swatch) => (
                  <button
                    key={swatch.id}
                    type="button"
                    className={`ls-custom__swatch ${leatherId === swatch.id ? "is-selected" : ""}`}
                    onClick={() => setLeatherId(swatch.id)}
                    aria-label={swatch.name}
                  >
                    <span className="ls-custom__swatch-color" style={{ background: swatch.hex }} />
                    <span>{swatch.name}</span>
                  </button>
                ))}
              </div>
              <h3 className="ls-custom__subsection-title">Stitching color</h3>
              <div className="ls-custom__swatches">
                {stitchColors.map((swatch) => (
                  <button
                    key={swatch.id}
                    type="button"
                    className={`ls-custom__swatch ${stitchId === swatch.id ? "is-selected" : ""}`}
                    onClick={() => setStitchId(swatch.id)}
                    aria-label={swatch.name}
                  >
                    <span className="ls-custom__swatch-color" style={{ background: swatch.hex }} />
                    <span>{swatch.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="ls-custom__section">
              <h2 className="ls-custom__section-title">Personalize</h2>
              <label className="ls-custom__field" htmlFor="monogram">
                Monogram (optional, max 3 characters)
              </label>
              <input
                id="monogram"
                type="text"
                maxLength={3}
                value={monogram}
                onChange={(e) => setMonogram(e.target.value.toUpperCase())}
                placeholder="ABC"
                className="ls-custom__input"
              />
              <p className="ls-custom__hint" lang="ko">
                대문자 이니셜 각인. 제작 전 시안 확인을 위해 연락드립니다.
              </p>
            </div>
          )}

          {step === 3 && product && (
            <div className="ls-custom__section">
              <h2 className="ls-custom__section-title">Review your order</h2>
              <dl className="ls-custom__review">
                <div>
                  <dt>Product</dt>
                  <dd>
                    {product.name} / {product.nameKo}
                  </dd>
                </div>
                <div>
                  <dt>Leather</dt>
                  <dd>{leather.name}</dd>
                </div>
                <div>
                  <dt>Stitching</dt>
                  <dd>{stitch.name}</dd>
                </div>
                <div>
                  <dt>Monogram</dt>
                  <dd>{monogram || "—"}</dd>
                </div>
                <div>
                  <dt>Estimated total</dt>
                  <dd>{formatPrice(product.price + (monogram ? 15_000 : 0))}</dd>
                </div>
                <div>
                  <dt>Lead time</dt>
                  <dd>{product.leadTime}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className="ls-custom__nav">
          {step > 0 && (
            <button type="button" className="ls-btn" onClick={prev}>
              Previous
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="ls-btn ls-btn--filled"
              onClick={next}
              disabled={step === 0 && !selectedProductId}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="ls-btn ls-btn--filled"
              onClick={() =>
                onAddToCart({
                  productId: selectedProductId,
                  leatherId,
                  stitchId,
                  monogram,
                })
              }
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </PageShell>
  );
}
