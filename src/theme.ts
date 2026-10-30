export type Surface = 'cover' | 'inner' | 'lock';
export const surfaces: Record<Surface, { label: string; width: number; height: number; subtitle: string }> = {
  cover: { label: '외부 화면', width: 904, height: 2316, subtitle: '커버 디스플레이' },
  inner: { label: '내부 화면', width: 1812, height: 2176, subtitle: '메인 디스플레이' },
  lock: { label: '잠금화면', width: 904, height: 2316, subtitle: '외부 · 잠금화면 전용' },
};
export const apps = [
  { id: 'phone', name: '전화', color: '#9c86ff', path: 'M8 4H5a1 1 0 0 0-1 1c0 8 7 15 15 15a1 1 0 0 0 1-1v-3l-5-2-2 2a13 13 0 0 1-5-5l2-2z' },
  { id: 'messages', name: '메시지', color: '#7cbbff', path: 'M4 5h16v12H9l-5 4z M8 9h8 M8 13h5' },
  { id: 'kakao', name: '카카오톡', color: '#cfb1fc', path: 'M21 10c0 4-4 7-9 7H9l-5 4 1-6c-2-2-2-6 0-8 4-5 16-4 16 3z M7 10h10 M9 8v5 M15 8v5' },
  { id: 'youtube', name: '유튜브', color: '#fa8ab5', path: 'M4 6h16v12H4z M10 9l5 3-5 3z' },
  { id: 'gallery', name: '갤러리', color: '#bc8bff', path: 'M12 4c6-5 11 1 6 6 7 3 3 10-3 7-1 7-9 7-8 0-7 2-9-6-3-8-3-6 4-10 8-5z M12 10v4 M10 12h4' },
  { id: 'camera', name: '카메라', color: '#9de0ef', path: 'M3 7h5l2-3h4l2 3h5v13H3z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0' },
  { id: 'settings', name: '설정', color: '#b4b8d9', path: 'M9 3h6l1 4 4 1v8l-4 1-1 4H9l-1-4-4-1V8l4-1z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0' },
  { id: 'music', name: '음악', color: '#db8fe3', path: 'M9 17V5l11-2v12 M9 14c-8-2-8 7-2 6l2-3 M20 12c-8-2-8 7-2 6l2-3 M9 9l11-2' },
];
export function iconSvg(index: number, accent = '#a78bfa') {
  const app = apps[index];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#29243d"/><stop offset="1" stop-color="#10101e"/></linearGradient><radialGradient id="glow"><stop stop-color="${accent}" stop-opacity=".35"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs><rect x="3" y="3" width="186" height="186" rx="52" fill="url(#bg)" stroke="${accent}" stroke-opacity=".4" stroke-width="2"/><circle cx="140" cy="45" r="90" fill="url(#glow)"/><g transform="translate(43 43) scale(4.42)" fill="none" stroke="${app.color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><path d="${app.path}"/></g></svg>`;
}
export function svgUrl(svg: string) { return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`; }
