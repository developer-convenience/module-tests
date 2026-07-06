import { useState } from "react";
import "./ImageSlot.css";

type ImageSlotProps = {
  src: string;
  alt: string;
  aspectRatio: string;
  label: string;
  className?: string;
  objectFit?: "cover" | "contain";
};

export default function ImageSlot({
  src,
  alt,
  aspectRatio,
  label,
  className = "",
  objectFit = "cover",
}: ImageSlotProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`ls-image-slot ${className}`}
      style={{ aspectRatio }}
      data-label={label}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          className="ls-image-slot__img"
          style={{ objectFit }}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="ls-image-slot__placeholder">
          <span className="ls-image-slot__placeholder-icon" aria-hidden>
            ◫
          </span>
          <span className="ls-image-slot__placeholder-label">{label}</span>
        </div>
      )}
    </div>
  );
}
