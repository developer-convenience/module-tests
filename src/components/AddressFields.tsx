import { useDaumPostcodePopup } from "react-daum-postcode";
import type { Address } from "react-daum-postcode";
import type { ShippingAddress } from "../types/shipping";
import "./AddressFields.css";

type AddressFieldsProps = {
  value: ShippingAddress;
  onChange: (address: ShippingAddress) => void;
};

export default function AddressFields({ value, onChange }: AddressFieldsProps) {
  const openPostcode = useDaumPostcodePopup();

  function handleSearch() {
    openPostcode({
      onComplete: (data: Address) => {
        onChange({
          ...value,
          zonecode: data.zonecode,
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress || data.autoJibunAddress || "",
        });
        requestAnimationFrame(() => {
          document.getElementById("detailAddress")?.focus();
        });
      },
    });
  }

  function handleDetailChange(detailAddress: string) {
    onChange({ ...value, detailAddress });
  }

  return (
    <fieldset className="ls-address-fields">
      <legend className="ls-address-fields__legend">주소</legend>

      <div className="ls-address-fields__row">
        <div className="ls-checkout-form__field ls-address-fields__zonecode">
          <label htmlFor="zonecode">우편번호</label>
          <input
            id="zonecode"
            name="zonecode"
            type="text"
            readOnly
            required
            value={value.zonecode}
            placeholder="00000"
            className="ls-address-fields__readonly"
          />
        </div>
        <button type="button" className="ls-btn ls-address-fields__search" onClick={handleSearch}>
          주소 검색
        </button>
      </div>

      <div className="ls-checkout-form__field">
        <label htmlFor="roadAddress">도로명 주소</label>
        <input
          id="roadAddress"
          name="roadAddress"
          type="text"
          readOnly
          required
          value={value.roadAddress}
          placeholder="주소 검색 버튼을 눌러주세요"
          className="ls-address-fields__readonly"
        />
      </div>

      {value.jibunAddress ? (
        <div className="ls-checkout-form__field">
          <label htmlFor="jibunAddress">지번 주소</label>
          <input
            id="jibunAddress"
            name="jibunAddress"
            type="text"
            readOnly
            value={value.jibunAddress}
            className="ls-address-fields__readonly ls-address-fields__jibun"
          />
        </div>
      ) : null}

      <div className="ls-checkout-form__field">
        <label htmlFor="detailAddress">상세주소</label>
        <input
          id="detailAddress"
          name="detailAddress"
          type="text"
          required
          value={value.detailAddress}
          onChange={(e) => handleDetailChange(e.target.value)}
          placeholder="동·호수, 건물명 등"
          disabled={!value.zonecode}
        />
      </div>
    </fieldset>
  );
}
