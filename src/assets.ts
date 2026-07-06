const BASE = "/images";

export const images = {
  logo: `${BASE}/logo.svg`,
  logoMark: `${BASE}/logo-mark.svg`,
  heroMain: `${BASE}/hero-main.png`,
  editorial01: `${BASE}/editorial-01.jpg`,
  editorial02: `${BASE}/editorial-02.jpg`,
  collection: [
    `${BASE}/collection-01.jpg`,
    `${BASE}/collection-02.jpg`,
    `${BASE}/collection-03.jpg`,
    `${BASE}/collection-04.jpg`,
    `${BASE}/collection-05.jpg`,
    `${BASE}/collection-06.jpg`,
  ] as const,
  atelierWide: `${BASE}/atelier-wide.jpg`,
  atelierPortrait: `${BASE}/atelier-portrait.jpg`,
} as const;

export type ProductCategory = "bag" | "wallet" | "slg";

export type Product = {
  id: string;
  name: string;
  nameKo: string;
  image: string;
  price: number;
  category: ProductCategory;
  customAvailable: boolean;
  leadTime: string;
  description: string;
  descriptionKo: string;
};

export const collectionItems: Product[] = [
  {
    id: "wallet",
    name: "Hand-stitched Wallet",
    nameKo: "핸드 스티치 지갑",
    image: images.collection[0],
    price: 280_000,
    category: "wallet",
    customAvailable: true,
    leadTime: "2–3 weeks",
    description:
      "Vegetable-tanned leather, saddle-stitched by hand. Six card slots, two bill compartments.",
    descriptionKo:
      "식물성 무두질 가죽, 손으로 이어 붙인 새들 스티치. 카드 6칸, 지폐 2칸.",
  },
  {
    id: "tote",
    name: "Vegetable Tote",
    nameKo: "베지터블 토트",
    image: images.collection[1],
    price: 520_000,
    category: "bag",
    customAvailable: true,
    leadTime: "3–4 weeks",
    description:
      "Unlined tote with reinforced handles. Ages beautifully with daily use.",
    descriptionKo:
      "안감 없는 토트, 손잡이 보강 처리. daily use에 따라 깊은 patina가 생깁니다.",
  },
  {
    id: "journal",
    name: "Custom Journal",
    nameKo: "주문제작 저널",
    image: images.collection[2],
    price: 195_000,
    category: "slg",
    customAvailable: true,
    leadTime: "2 weeks",
    description:
      "A5 refillable journal cover. Optional monogram and closure style.",
    descriptionKo:
      "A5 리필형 저널 커버. 모노그램·잠금 방식 선택 가능.",
  },
  {
    id: "card-case",
    name: "Card Case",
    nameKo: "카드 케이스",
    image: images.collection[3],
    price: 145_000,
    category: "wallet",
    customAvailable: false,
    leadTime: "2 weeks",
    description: "Minimal card case for four cards. Burnished edges, hand-finished.",
    descriptionKo: "카드 4장 수납 미니멀 케이스. 엣지 번ishing, 손 마감.",
  },
  {
    id: "crossbody",
    name: "Crossbody Bag",
    nameKo: "크로스바디 백",
    image: images.collection[4],
    price: 680_000,
    category: "bag",
    customAvailable: true,
    leadTime: "4–5 weeks",
    description:
      "Compact crossbody with adjustable strap. Brass hardware, interior pocket.",
    descriptionKo:
      "길이 조절 스트랩, 컴팩트 크로스바디. 황동 하드웨어, 내부 포켓.",
  },
  {
    id: "keyring",
    name: "Leather Keyring",
    nameKo: "가죽 키링",
    image: images.collection[5],
    price: 68_000,
    category: "slg",
    customAvailable: false,
    leadTime: "1 week",
    description: "Loop keyring in single piece leather. Optional embossed initials.",
    descriptionKo: "원피스 가죽 루프 키링. 이니셜 각인 선택 가능.",
  },
];

export function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

export function getProduct(id: string) {
  return collectionItems.find((item) => item.id === id);
}
