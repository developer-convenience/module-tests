import ImageSlot from "./ImageSlot";
import Reveal from "./Reveal";
import "./EditorialBlock.css";

type EditorialBlockProps = {
  imageSrc: string;
  imageLabel: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  reversed?: boolean;
};

export default function EditorialBlock({
  imageSrc,
  imageLabel,
  imageAlt,
  eyebrow,
  title,
  body,
  ctaLabel = "Discover",
  onCtaClick,
  reversed = false,
}: EditorialBlockProps) {
  return (
    <section className={`ls-editorial ${reversed ? "ls-editorial--reversed" : ""}`}>
      <div className="ls-editorial__inner ls-container">
        <Reveal
          className="ls-editorial__media"
          variant={reversed ? "right" : "left"}
        >
          <ImageSlot
            src={imageSrc}
            alt={imageAlt}
            aspectRatio="4 / 5"
            label={imageLabel}
          />
        </Reveal>
        <Reveal
          className="ls-editorial__text"
          variant={reversed ? "left" : "right"}
          delay={0.15}
        >
          <p className="ls-eyebrow">{eyebrow}</p>
          <h2 className="ls-editorial__title">{title}</h2>
          <p className="ls-editorial__body" lang="ko">{body}</p>
          {onCtaClick ? (
            <button type="button" className="ls-link" onClick={() => onCtaClick?.()}>
              {ctaLabel} →
            </button>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
