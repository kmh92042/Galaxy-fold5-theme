import JSZip from 'jszip';
import { apps, iconSvg, surfaces, svgUrl, type Surface } from './theme';
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('이미지를 불러오지 못했습니다. 다른 PNG 또는 JPEG 파일을 선택하세요.')); image.src = src; });
}
export function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('PNG 변환에 실패했습니다.')), 'image/png'));
}
export async function wallpaper(src: string, surface: Surface, dim: number, position: number) {
  const { width, height } = surfaces[surface]; const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas를 지원하는 브라우저가 필요합니다.');
  const image = await loadImage(src); const scale = Math.max(width / image.width, height / image.height);
  ctx.drawImage(image, (width - image.width * scale) * position / 100, (height - image.height * scale) / 2, image.width * scale, image.height * scale);
  ctx.fillStyle = `rgba(0,0,0,${dim / 100})`; ctx.fillRect(0,0,width,height);
  if (surface === 'lock') { const veil=ctx.createLinearGradient(0,0,0,height*.65); veil.addColorStop(0,'rgba(5,3,15,.5)'); veil.addColorStop(1,'rgba(5,3,15,0)'); ctx.fillStyle=veil; ctx.fillRect(0,0,width,height); }
  return canvasBlob(canvas);
}
export async function iconPng(index: number, accent: string) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 192;
  canvas.getContext('2d')!.drawImage(await loadImage(svgUrl(iconSvg(index, accent))),0,0,192,192); return canvasBlob(canvas);
}
export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url),10000);
}
export async function pack(sources: Record<Surface,string>, dim: number, position: number, accent: string) {
  const zip = new JSZip();
  for (const surface of Object.keys(surfaces) as Surface[]) { const s = surfaces[surface]; zip.file(`wallpapers/${surface}-${s.width}x${s.height}.png`, await wallpaper(sources[surface],surface,dim,position)); }
  for (let i=0;i<apps.length;i++) zip.file(`icons/${apps[i].id}-192.png`,await iconPng(i,accent));
  zip.file('적용-안내.txt','NOCTURNE / Galaxy Z Fold5\n배경화면: 설정 > 배경화면 및 스타일에서 홈 화면/잠금화면에 각각 지정하세요. 내부 화면은 기기를 펼쳐 지정하세요.\n아이콘: Good Lock > Theme Park > 아이콘 > 새로 만들기에서 앱별 이미지 교체 후 저장하고 적용하세요. 메뉴는 One UI/Theme Park 버전에 따라 다릅니다.\n이 파일은 삼성 테마 설치 패키지가 아닙니다. 카카오톡 대화방·앱 내부 UI·상태바는 변경하지 않습니다. 시계와 위젯은 PNG에 포함되지 않습니다.\n잠금화면 PNG는 외부 화면 크기입니다. 내부 잠금화면은 내부 화면 PNG를 사용하세요.\n자세한 내용은 프로젝트 README.md를 확인하세요.');
  return zip.generateAsync({type:'blob'});
}
