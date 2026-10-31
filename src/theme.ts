export type Surface = "cover" | "inner" | "lock";
export const surfaces: Record<
  Surface,
  { label: string; width: number; height: number; subtitle: string }
> = {
  cover: {
    label: "외부 화면",
    width: 904,
    height: 2316,
    subtitle: "커버 디스플레이",
  },
  inner: {
    label: "내부 화면",
    width: 1812,
    height: 2176,
    subtitle: "메인 디스플레이",
  },
  lock: {
    label: "잠금화면",
    width: 904,
    height: 2316,
    subtitle: "외부 · 잠금화면 전용",
  },
};
export const apps = [
  {
    id: "phone",
    name: "전화",
    color: "#9c86ff",
    path: "M8 4H5a1 1 0 0 0-1 1c0 8 7 15 15 15a1 1 0 0 0 1-1v-3l-5-2-2 2a13 13 0 0 1-5-5l2-2z",
  },
  {
    id: "messages",
    name: "메시지",
    color: "#7cbbff",
    path: "M4 5h16v12H9l-5 4z M8 9h8 M8 13h5",
  },
  {
    id: "kakao",
    name: "카카오톡",
    color: "#cfb1fc",
    path: "M21 10c0 4-4 7-9 7H9l-5 4 1-6c-2-2-2-6 0-8 4-5 16-4 16 3z M7 10h10 M9 8v5 M15 8v5",
  },
  {
    id: "youtube",
    name: "유튜브",
    color: "#fa8ab5",
    path: "M4 6h16v12H4z M10 9l5 3-5 3z",
  },
  {
    id: "gallery",
    name: "갤러리",
    color: "#bc8bff",
    path: "M12 4c6-5 11 1 6 6 7 3 3 10-3 7-1 7-9 7-8 0-7 2-9-6-3-8-3-6 4-10 8-5z M12 10v4 M10 12h4",
  },
  {
    id: "camera",
    name: "카메라",
    color: "#9de0ef",
    path: "M3 7h5l2-3h4l2 3h5v13H3z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  },
  {
    id: "settings",
    name: "설정",
    color: "#b4b8d9",
    path: "M9 3h6l1 4 4 1v8l-4 1-1 4H9l-1-4-4-1V8l4-1z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  },
  {
    id: "music",
    name: "음악",
    color: "#db8fe3",
    path: "M9 17V5l11-2v12 M9 14c-8-2-8 7-2 6l2-3 M20 12c-8-2-8 7-2 6l2-3 M9 9l11-2",
  },
];
export function iconSvg(
  index: number,
  accent = "#a78bfa",
  style: IconStyle = "neon",
) {
  const app = apps[index];
  if (style === "relic") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
      <defs><linearGradient id="enamel" x2="1" y2="1"><stop stop-color="#1f3449"/><stop offset=".5" stop-color="#111d30"/><stop offset="1" stop-color="#060c19"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse"><stop stop-color="#fff0cb"/><stop offset=".4" stop-color="${accent}"/><stop offset="1" stop-color="#8e6c36"/></linearGradient><radialGradient id="aura"><stop stop-color="#80d5ff" stop-opacity=".24"/><stop offset="1" stop-color="#80d5ff" stop-opacity="0"/></radialGradient></defs>
      <rect x="6" y="6" width="180" height="180" rx="45" fill="url(#enamel)" stroke="url(#gold)" stroke-width="3"/>
      <rect x="14" y="14" width="164" height="164" rx="37" fill="none" stroke="${accent}" stroke-opacity=".42"/>
      <circle cx="96" cy="98" r="76" fill="url(#aura)"/>
      <g fill="none" stroke="url(#gold)" stroke-width="1.5" opacity=".9"><path d="M29 62V42l14-13h19 M130 29h19l14 13v20 M29 130v20l14 13h19 M130 163h19l14-13v-20"/><path d="M72 20l24 9 24-9 M72 172l24-9 24 9"/></g>
      <path d="M96 16l5 6-5 6-5-6z M96 164l5 6-5 6-5-6z" fill="#a8e4ff"/>
      <g transform="translate(48 48) scale(4)" fill="none" stroke="url(#gold)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><path d="${app.path}"/></g>
    </svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#29243d"/><stop offset="1" stop-color="#10101e"/></linearGradient><radialGradient id="glow"><stop stop-color="${accent}" stop-opacity=".35"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs><rect x="3" y="3" width="186" height="186" rx="52" fill="url(#bg)" stroke="${accent}" stroke-opacity=".4" stroke-width="2"/><circle cx="140" cy="45" r="90" fill="url(#glow)"/><g transform="translate(43 43) scale(4.42)" fill="none" stroke="${app.color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><path d="${app.path}"/></g></svg>`;
}
export function svgUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export type IconStyle = "neon" | "relic";
export type CollectionId = "lostark" | "nocturne";
export const collections = {
  lostark: {
    id: "lostark",
    name: "Wings of Dawn",
    korean: "로스트아크 · 니나브",
    artwork: `${import.meta.env.BASE_URL}art/lostark-oath.png`,
    accent: "#d8b77a",
    position: 62,
    dim: 12,
    iconStyle: "relic" as IconStyle,
    colors: ["#d8b77a", "#88cfe8", "#d9d9e5", "#a6b9d2"],
    genre: "ARKESIA FANTASY",
    label: "UNOFFICIAL FAN CONCEPT",
    edition: "02",
    description: "새벽을 여는 날개, 니나브와 함께 아크라시아로.",
    subtitle:
      "딥 네이비와 샴페인 골드. 니나브의 날개와 빛의 활을 재해석한 비공식 팬아트.",
    filename: "LOSTARK-Nineveh-Fold5",
    widget: "빛이 이끄는 곳, 새로운 모험의 시작.",
  },
  nocturne: {
    id: "nocturne",
    name: "Midnight Awakening",
    korean: "미드나잇 어웨이크닝",
    artwork: `${import.meta.env.BASE_URL}art/nocturne.png`,
    accent: "#a78bfa",
    position: 58,
    dim: 16,
    iconStyle: "neon" as IconStyle,
    colors: ["#a78bfa", "#65d5ff", "#ed9ae8", "#b5c2df"],
    genre: "K-POP FANTASY",
    label: "ORIGINAL COLLECTION",
    edition: "01",
    description: "어둠을 가르는 빛, 무대 위에서 깨어나는 또 하나의 나.",
    subtitle:
      "깊은 밤의 에너지와 빛나는 존재감. 나만의 K팝 판타지 테마를 완성하세요.",
    filename: "NOCTURNE-Fold5",
    widget: "오늘도, 나답게 빛나는 순간.",
  },
} satisfies Record<CollectionId, object>;
