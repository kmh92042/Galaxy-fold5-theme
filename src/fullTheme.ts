import JSZip from "jszip";
import { canvasBlob, loadImage, wallpaper, iconPng } from "./export";
import { apps, collections, iconSvg, svgUrl, type CollectionId } from "./theme";

export const systemScreens = [
  { id: "home", label: "홈 화면", scope: "배경·아이콘을 수동 지정" },
  { id: "lock", label: "잠금화면", scope: "배경과 시계는 기기에서 설정" },
  {
    id: "dialer",
    label: "전화 · 다이얼러",
    scope: "디자인 시안 · 도구 지원 확인 필요",
  },
  {
    id: "messages",
    label: "삼성 메시지",
    scope: "디자인 시안 · 앱·버전 지원 확인 필요",
  },
  {
    id: "keyboard",
    label: "삼성 키보드",
    scope: "디자인 시안 · 기기의 편집 범위 확인 필요",
  },
  {
    id: "volume",
    label: "음량패널",
    scope: "디자인 시안 · 지원 색상 수동 지정",
  },
  {
    id: "quickpanel",
    label: "빠른 설정 · 알림",
    scope: "디자인 시안 · 버전별 형태 상이",
  },
] as const;
export type SystemScreen = (typeof systemScreens)[number]["id"];
export function themeTokens(id: CollectionId) {
  const gold = id === "lostark";
  return {
    background: gold ? "#0C1726" : "#130F20",
    surface: gold ? "#192B40" : "#29203C",
    elevated: gold ? "#223A51" : "#3C2C54",
    accent: gold ? "#DFC38E" : "#C5ABF4",
    onAccent: gold ? "#241A0A" : "#211333",
    text: "#F5F3ED",
    secondary: "#BBC7D7",
    outline: gold ? "#617187" : "#756789",
    received: gold ? "#253A50" : "#352A4D",
    sent: gold ? "#DCC18D" : "#C1A5ED",
    disabled: "#728094",
  };
}
export const themeParkMappings = {
  테마: [
    ["화면 배경", "background"],
    ["카드", "surface"],
    ["강조색", "accent"],
    ["기본 글자", "text"],
    ["보조 글자", "secondary"],
  ],
  키보드: [
    ["바탕", "background"],
    ["일반 키", "surface"],
    ["키 글자", "text"],
    ["액션 키", "accent"],
    ["액션 키 글자", "onAccent"],
  ],
  퀵패널: [
    ["패널 배경", "background"],
    ["켜진 버튼", "accent"],
    ["켜진 아이콘", "onAccent"],
    ["꺼진 버튼·알림 카드", "surface"],
    ["꺼진 아이콘", "secondary"],
    ["알림 글자", "text"],
  ],
  아이콘: [["기존 팩의 개별 PNG 사용", "accent"]],
  음량패널: [
    ["패널", "surface"],
    ["슬라이더 바탕", "background"],
    ["슬라이더 채움", "accent"],
    ["아이콘", "text"],
  ],
} as const;
export function recipeHtml(id: CollectionId) {
  const colors = themeTokens(id);
  return `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Theme Park 색상 입력표</title><style>body{max-width:850px;margin:0 auto;padding:28px 18px;font:15px/1.8 system-ui;background:#0C1726;color:#F5F3ED}h1{font-size:26px}h2{color:#DFC38E}p{color:#BBC7D7}section{padding:18px;border:1px solid #617187;border-radius:15px;margin:22px 0}table{width:100%;border-collapse:collapse}td{border-bottom:1px solid #61718755;padding:12px 2px}i{display:inline-block;width:24px;height:24px;border:1px solid #617187;border-radius:7px;vertical-align:middle;margin-right:10px}code{font-size:17px;color:#F5F3ED;user-select:all}</style><h1>${collections[id].korean} · Theme Park 입력표</h1><p>폴드5 / One UI 8.5 사용자 확인 메뉴 기준. 이 파일은 색상 참조 문서이며 가져오기·설치 파일이 아닙니다. 항목명은 의미에 따른 권장 매핑으로 실제 편집기 슬롯명과 다를 수 있습니다.</p>${Object.entries(
    themeParkMappings,
  )
    .map(
      ([tab, rows]) =>
        `<section><h2>${tab}</h2><table>${rows.map(([label, key]) => `<tr><td>${label}</td><td><i style="background:${colors[key]}"></i><code>${colors[key]}</code></td></tr>`).join("")}</table></section>`,
    )
    .join(
      "",
    )}<p>편집기에서 지원하는 항목만 설정하고, 각 탭에서 저장·적용하세요. 전화·삼성 메시지의 색상과 캐릭터 배경 삽입 기능은 별개입니다. 캐릭터 배경/말풍선 이미지/레이아웃을 시안처럼 임의 변경할 수 있다고 보장하지 않습니다. 실제 적용 후 접힘·펼침과 라이트·다크 모드에서 확인해야 합니다.</p></html>`;
}
const xml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const image = (
  href: string,
  x: number,
  y: number,
  w: number,
  h: number,
  opacity = 1,
) =>
  `<image href="${xml(href)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" opacity="${opacity}"/>`;
export async function artData(src: string) {
  const response = await fetch(src);
  if (!response.ok) throw new Error("원화를 불러오지 못했습니다.");
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
export function systemSvg(screen: SystemScreen, id: CollectionId, art: string) {
  const t = themeTokens(id);
  const c = collections[id];
  const text = (
    x: number,
    y: number,
    value: string,
    size = 32,
    fill = t.text,
    anchor = "start",
  ) =>
    `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${xml(value)}</text>`;
  const rect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r = 28,
    fill = t.surface,
  ) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
  const line = (y: number) =>
    `<path d="M64 ${y}H840" stroke="${t.outline}" stroke-opacity=".35"/>`;
  let body = "";
  if (screen === "home" || screen === "lock") {
    body =
      image(art, 0, 0, 904, 2316) +
      '<rect width="904" height="2316" fill="url(#shade)"/>';
    body +=
      text(452, 300, "10월 31일 토요일", 31, t.text, "middle") +
      text(452, 485, "09:41", 143, t.text, "middle");
    body += text(
      452,
      548,
      id === "lostark" ? "WINGS OF DAWN" : "MIDNIGHT AWAKENING",
      22,
      t.accent,
      "middle",
    );
    if (screen === "home") {
      body +=
        rect(65, 1475, 774, 137, 32, t.background) +
        text(101, 1556, c.widget, 27, t.text);
      for (let i = 0; i < 4; i++) {
        body += image(
          svgUrl(iconSvg(i, c.accent, c.iconStyle)),
          80 + i * 198,
          1730,
          144,
          144,
        );
        body += text(152 + i * 198, 1920, apps[i].name, 26, t.text, "middle");
      }
      for (let i = 0; i < 3; i++)
        body += image(
          svgUrl(iconSvg([0, 1, 5][i], c.accent, c.iconStyle)),
          145 + i * 235,
          2070,
          144,
          144,
        );
    } else {
      body +=
        rect(65, 1770, 774, 154, 32, t.background) +
        text(104, 1823, "메시지  ·  지금", 25, t.accent) +
        text(104, 1879, "새로운 알림이 여기에 표시됩니다.", 30);
      body += text(452, 2160, "화면을 밀어 잠금 해제", 25, t.text, "middle");
    }
  } else {
    body =
      `<rect width="904" height="2316" fill="${t.background}"/>` +
      image(art, 0, 0, 904, 2316, 0.13) +
      `<rect width="904" height="2316" fill="${t.background}" opacity=".64"/>`;
    if (screen === "dialer") {
      body +=
        text(66, 230, "전화", 63) +
        text(840, 230, "⌕  ⋮", 42, t.accent, "end") +
        text(452, 675, "010 1234 5678", 62, t.text, "middle");
      const keys = [
        ["1", ""],
        ["2", "ABC"],
        ["3", "DEF"],
        ["4", "GHI"],
        ["5", "JKL"],
        ["6", "MNO"],
        ["7", "PQRS"],
        ["8", "TUV"],
        ["9", "WXYZ"],
        ["*", ""],
        ["0", "+"],
        ["#", ""],
      ];
      keys.forEach(([num, letters], i) => {
        const x = 202 + (i % 3) * 250,
          y = 960 + Math.floor(i / 3) * 225;
        body +=
          text(x, y, num, 77, t.text, "middle") +
          text(x, y + 52, letters, 23, t.secondary, "middle");
      });
      body +=
        rect(320, 1870, 264, 132, 66, t.accent) +
        image(svgUrl(iconSvg(0, c.accent, c.iconStyle)), 406, 1891, 88, 88);
      body +=
        line(2115) +
        text(180, 2195, "키패드", 29, t.accent, "middle") +
        text(452, 2195, "최근 기록", 29, t.secondary, "middle") +
        text(725, 2195, "연락처", 29, t.secondary, "middle");
    }
    if (screen === "messages" || screen === "keyboard") {
      body +=
        text(64, 220, "‹", 70, t.accent) +
        text(150, 220, "모험가", 48) +
        text(840, 220, "⋮", 48, t.accent, "end") +
        line(280) +
        text(452, 360, "10월 31일 토요일", 25, t.secondary, "middle");
      body +=
        rect(64, 450, 630, 145, 30, t.received) +
        text(96, 536, "오늘은 어디로 모험을 떠날까요?", 30);
      body +=
        rect(260, 668, 580, 145, 30, t.sent) +
        text(295, 753, "별빛이 닿는 곳으로 가요.", 30, t.onAccent);
      body +=
        rect(64, 895, 610, 145, 30, t.received) +
        text(96, 980, "좋아요. 제가 곁에 있을게요.", 30);
      if (screen === "messages")
        body +=
          image(art, 582, 1200, 230, 500, 0.27) +
          text(452, 1775, "빛이 이끄는 곳으로.", 28, t.secondary, "middle");
      const inputY = screen === "keyboard" ? 1370 : 2070;
      body +=
        rect(64, inputY, 776, 120, 44, t.elevated) +
        text(98, inputY + 75, "＋", 44, t.accent) +
        text(175, inputY + 73, "메시지 입력", 31, t.secondary) +
        text(790, inputY + 75, "↑", 40, t.accent, "middle");
      if (screen === "keyboard") {
        body +=
          rect(0, 1540, 904, 776, 0, t.background) +
          text(
            452,
            1610,
            "추천 단어    ·    모험    ·    니나브",
            25,
            t.secondary,
            "middle",
          );
        const rows = [
          "ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ",
          "ㅁㄴㅇㄹㅎㅗㅓㅏㅣ",
          "ㅋㅌㅊㅍㅠㅜㅡ",
        ];
        rows.forEach((row, r) =>
          Array.from(row).forEach((key, i) => {
            const w = r === 0 ? 80 : r === 1 ? 86 : 94,
              x = 16 + (904 - row.length * w) / 2 + i * w,
              y = 1670 + r * 131;
            body +=
              rect(x, y, w - 10, 112, 17, t.surface) +
              text(x + (w - 10) / 2, y + 76, key, 39, t.text, "middle");
          }),
        );
        body +=
          rect(36, 2080, 135, 119, 17, t.elevated) +
          text(104, 2156, "123", 30, t.accent, "middle") +
          rect(192, 2080, 520, 119, 17, t.surface) +
          text(452, 2156, "한국어", 29, t.secondary, "middle") +
          rect(736, 2080, 132, 119, 17, t.accent) +
          text(802, 2156, "↵", 41, t.onAccent, "middle");
      }
    }
    if (screen === "volume") {
      body +=
        image(art, 0, 0, 904, 2316, 0.7) +
        `<rect width="904" height="2316" fill="${t.background}" opacity=".4"/>`;
      body +=
        rect(180, 490, 544, 1290, 80, t.surface) +
        text(452, 620, "음량", 43, t.text, "middle");
      const values = [0.64, 0.82, 0.38];
      values.forEach((value, i) => {
        const x = 242 + i * 154;
        body +=
          rect(x, 730, 114, 750, 57, t.background) +
          rect(x, 730 + 750 * (1 - value), 114, 750 * value, 57, t.accent) +
          text(x + 57, 1550, ["♪", "♬", "♧"][i], 40, t.text, "middle");
      });
      body += text(
        452,
        1655,
        "미디어 · 벨소리 · 알림",
        27,
        t.secondary,
        "middle",
      );
    }
    if (screen === "quickpanel") {
      body +=
        text(64, 260, "09:41", 99) +
        text(66, 325, "10월 31일 토요일", 31, t.secondary) +
        text(838, 300, "⚙", 47, t.accent, "end");
      const labels = [
        "Wi-Fi",
        "블루투스",
        "소리",
        "손전등",
        "자동 회전",
        "비행기 모드",
      ];
      labels.forEach((label, i) => {
        const x = 200 + (i % 3) * 252,
          y = 540 + Math.floor(i / 3) * 260,
          on = i < 3;
        body += `<circle cx="${x}" cy="${y}" r="83" fill="${on ? t.accent : t.surface}"/>`;
        body +=
          text(
            x,
            y + 20,
            ["ᯤ", "ᛒ", "♪", "☼", "↻", "✈"][i],
            57,
            on ? t.onAccent : t.secondary,
            "middle",
          ) + text(x, y + 139, label, 27, t.secondary, "middle");
      });
      body +=
        rect(64, 1040, 776, 125, 50, t.surface) +
        rect(64, 1040, 490, 125, 50, t.accent) +
        text(110, 1121, "☼", 48, t.onAccent) +
        text(64, 1305, "알림", 35) +
        text(840, 1305, "모두 지우기", 26, t.secondary, "end");
      body +=
        rect(64, 1370, 776, 242, 32, t.surface) +
        text(100, 1437, "삼성 메시지  ·  지금", 26, t.accent) +
        text(100, 1511, "모험가", 34) +
        text(100, 1568, "오늘은 어디로 모험을 떠날까요?", 29, t.secondary);
      body +=
        rect(64, 1650, 776, 242, 32, t.surface) +
        text(100, 1717, "캘린더  ·  오늘", 26, t.accent) +
        text(100, 1791, "새로운 여정을 기록하세요.", 34) +
        text(100, 1848, "설계용 예시 알림", 29, t.secondary);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="904" height="2316" viewBox="0 0 904 2316"><defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${t.background}" stop-opacity=".6"/><stop offset=".36" stop-color="${t.background}" stop-opacity=".1"/><stop offset="1" stop-color="${t.background}" stop-opacity=".76"/></linearGradient></defs>${body}${text(60, 79, "9:41", 27)}${text(840, 79, "LTE  ▰", 24, t.text, "end")}<rect x="322" y="2275" width="260" height="8" rx="4" fill="${t.text}" opacity=".75"/></svg>`;
}
export function componentSvgs(id: CollectionId) {
  const t = themeTokens(id);
  const svg = (w: number, h: number, body: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
  return {
    "bubble-received": svg(
      630,
      145,
      `<rect x="1" y="1" width="628" height="143" rx="30" fill="${t.received}"/>`,
    ),
    "bubble-sent": svg(
      630,
      145,
      `<rect x="1" y="1" width="628" height="143" rx="30" fill="${t.sent}"/>`,
    ),
    "key-normal": svg(
      84,
      112,
      `<rect x="1" y="1" width="82" height="110" rx="17" fill="${t.surface}"/>`,
    ),
    "key-action": svg(
      132,
      119,
      `<rect x="1" y="1" width="130" height="117" rx="17" fill="${t.accent}"/>`,
    ),
    "tile-active": svg(
      170,
      170,
      `<circle cx="85" cy="85" r="83" fill="${t.accent}"/>`,
    ),
    "tile-inactive": svg(
      170,
      170,
      `<circle cx="85" cy="85" r="83" fill="${t.surface}"/>`,
    ),
    "volume-track": svg(
      114,
      750,
      `<rect x="1" y="1" width="112" height="748" rx="56" fill="${t.background}"/>`,
    ),
    "volume-fill": svg(
      114,
      480,
      `<rect x="1" y="1" width="112" height="478" rx="56" fill="${t.accent}"/>`,
    ),
    "notification-card": svg(
      776,
      242,
      `<rect x="1" y="1" width="774" height="240" rx="32" fill="${t.surface}"/>`,
    ),
  };
}
export async function svgPng(svg: string) {
  const img = await loadImage(svgUrl(svg));
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas를 지원하지 않습니다.");
  ctx.drawImage(img, 0, 0);
  return canvasBlob(canvas);
}
export const assemblyGuide = `# 전체 테마 제작자료 — 설치 파일 아님

이 ZIP은 원신 예시처럼 여러 시스템 화면의 디자인을 통일하기 위한 설계와 리소스입니다. 삼성 테마 패키지, Theme Studio 프로젝트, Theme Park 가져오기 파일이 아닙니다. JSON을 Theme Park에 가져와 적용할 수 없습니다.

## 포함 파일
- source-art.png: SVG 시안들이 상대 경로로 참조하는 공통 원화. 폴더 구조를 유지하세요.
- design-previews: 홈/잠금/전화/메시지/키보드/빠른설정/음량패널의 PNG·SVG 시안. 시계·텍스트·버튼이 그려진 참조용 화면입니다. 배경화면으로 적용하지 마세요.
- assembly-assets: 말풍선·키·토글·알림 카드의 편집 가능한 SVG와 PNG. 삼성 템플릿 규격이나 9-patch가 아니며, 도구의 항목에 맞춰 재작업이 필요합니다.
- device-resources: 실제 수동 지정용 배경 3종과 런처 아이콘 8종. 실제 앱 내부를 변경하지 않습니다.
- palette.json: 색상 명세. 디자인 문서이며 자동 설치/가져오기 형식이 아닙니다.

## 대상과 확인된 상태
사용자 기기: Galaxy Z Fold5, One UI 8.5 (사용자 제공 정보).
Theme Park 탭: 테마/키보드/퀵패널/아이콘/음량패널 (사용자 확인).
클라우드에서 기기 원격 조작·실제 적용은 수행하지 않았습니다.
색상은 사용자가 Theme Park에서 직접 지정합니다. 아래 매핑은 의미를 기준으로 한 권장값이며 편집기 슬롯 이름을 확인한 기록이 아닙니다. 이름이 다른 경우 대응되는 색상 항목을 선택하세요.

## 니나브 권장 색상 입력표
- 화면 바탕: #0C1726
- 카드·일반 키·말풍선 바탕: #192B40 (수신 말풍선은 #253A50)
- 입력창·보조 패널: #223A51
- 활성 버튼·토글·슬라이더 채움: #DFC38E
- 골드 위 글자·아이콘: #241A0A
- 기본 글자: #F5F3ED
- 보조 글자·꺼진 아이콘: #BBC7D7
- 테두리: #617187
- 발신 말풍선: #DCC18D, 발신 글자: #241A0A

## 탭별 수동 적용
1. 테마: 새 테마를 만들 때 배경은 device-resources/wallpapers에서 선택합니다. 주색상(강조)은 #DFC38E, 배경은 #0C1726, 전경 글자는 #F5F3ED로 설정하는 것을 목표로 합니다. 앱별 세부 색상 편집이 제공될 때만 카드/말풍선 색상을 세부 조정합니다. 편집기에 없는 항목은 강제로 적용할 수 없습니다.
2. 키보드: 삼성 키보드용 새 테마를 만들고 바탕 #0C1726, 일반 키 #192B40, 글자 #F5F3ED, 액션 키 #DFC38E, 액션 키 글자 #241A0A를 사용합니다. 키 이미지/캐릭터 배경 삽입은 해당 버전의 편집기가 제공하는 경우에만 사용합니다.
3. 퀵패널: 바탕 #0C1726, 켜진 원 #DFC38E, 켜진 아이콘 #241A0A, 꺼진 원 #192B40, 꺼진 아이콘 #BBC7D7, 알림 카드 #192B40, 글자 #F5F3ED. 밝기 슬라이더 채움은 #DFC38E.
4. 아이콘: 기존 PNG 8종을 개별 앱에 매핑하고 저장·적용합니다.
5. 음량패널: 패널 #192B40, 슬라이더 바탕 #0C1726, 채움 #DFC38E, 아이콘 #F5F3ED. 편집기가 제공하는 색상 항목만 지정합니다.
각 탭의 결과를 별도 이름으로 저장하고 적용하세요. 이 표는 클라우드에서 실제 기기에 입력해 검증한 값이 아닙니다.

## 내 기기에 적용할 경우
1. 폴드5의 One UI 버전, Good Lock/Theme Park 버전과 실제 제공 탭을 확인합니다.
2. device-resources의 배경과 아이콘은 기존 안내대로 수동 지정합니다.
3. Theme Park에 테마 만들기 기능이 제공되면 배경에서 새 테마를 만들고 지원되는 색상 항목에 palette.json의 색상을 수동 입력합니다. 미리보기에서 삼성 전화·삼성 메시지에 실제 반영되는 항목을 확인한 후 저장·적용합니다. 색상 변경과 임의의 배경/레이아웃 변경은 서로 다릅니다.
4. 키보드/빠른설정 등 별도 항목이 제공되면 동일한 팔레트로 각각 제작·적용합니다. 삼성 키보드를 사용해야 합니다. 버전에 없는 기능은 지원한다고 간주하지 마세요.
5. 전화 앱의 통화 배경 이미지 설정이 제공되면 일반 갤러리 이미지로 배경을 선택할 수 있습니다. 이는 발신 키패드 배경이나 전체 전화 앱 테마가 아닙니다.
6. Google 메시지·Gboard·카카오톡 등 타사 앱은 삼성 메시지·삼성 키보드 시안과 다르게 동작합니다. 해당 앱을 이 자료로 테마화할 수 없습니다.
7. 전화/문자/키보드/알림창의 실제 화면을 접힘·펼침, 라이트·다크 모드에서 확인하기 전에는 적용 완료가 아닙니다.

## Galaxy Themes 형태의 설치형 테마가 필요할 경우
삼성 Galaxy Themes Studio의 현재 제공 조건과 디자이너 권한, 사용 가능한 PC 및 도구의 Fold5/One UI 지원을 먼저 확인해야 합니다. 공식 도구: https://developer.samsung.com/galaxy-themes/overview.html
이 클라우드에서는 해당 사이트 접근이 차단되었고, 도구 실행·삼성 프로젝트 생성·패키지 빌드·서명·실물 설치를 수행하지 않았습니다. 디자이너 프로그램 조건은 공식 사이트에서 확인하세요. 이 자료를 도구에서 수동 매핑하고 지원 화면을 조립한 뒤 패키지 빌드 및 실제 기기 검증이 필요합니다.

## 남은 작업
One UI/도구 버전 확정 → 지원 항목 매핑 → 도구 내 조립 → 실제 적용 → 접힘·펼침 및 다크모드 검증. 현재 화면의 배열/서체/위젯은 설계용 예시이며 One UI의 실제 구조를 보장하지 않습니다. 내부 앱 화면 시안은 외부 화면 크기인 904×2316 기준입니다. 펼친 화면의 실제 앱 레이아웃은 별도 검증이 필요합니다.

니나브는 AI 생성 비공식 팬아트이며 로스트아크 관련 권리는 원 권리자에게 있습니다. 공식 상품·배포 허가를 의미하지 않습니다.
`;
export async function fullThemeKit(id: CollectionId, art: string) {
  const c = collections[id];
  const zip = new JSZip();
  zip.file("source-art.png", art.slice(art.indexOf(",") + 1), { base64: true });
  for (const screen of systemScreens) {
    const svg = systemSvg(screen.id, id, art);
    zip.file(
      `design-previews/${screen.id}.svg`,
      svg.replaceAll(art, "../source-art.png"),
    );
    zip.file(`design-previews/${screen.id}.png`, await svgPng(svg));
  }
  for (const [name, svg] of Object.entries(componentSvgs(id))) {
    zip.file(`assembly-assets/${name}.svg`, svg);
    zip.file(`assembly-assets/${name}.png`, await svgPng(svg));
  }
  for (const surface of ["cover", "inner", "lock"] as const)
    zip.file(
      `device-resources/wallpapers/${surface}.png`,
      await wallpaper(c.artwork, surface, c.dim, c.position, c.iconStyle),
    );
  for (let i = 0; i < apps.length; i++)
    zip.file(
      `device-resources/icons/${apps[i].id}.png`,
      await iconPng(i, c.accent, c.iconStyle),
    );
  zip.file("ThemePark-색상입력표.html", recipeHtml(id));
  zip.file(
    "palette.json",
    JSON.stringify(
      {
        targetOneUi: "8.5",
        targetSource: "user-reported",
        reportedTabs: Object.keys(themeParkMappings),
        recommendedMappings: themeParkMappings,
        format: "nocturne-design-kit-v1",
        collection: c.korean,
        installable: false,
        themeParkImport: false,
        deviceValidated: false,
        previewSize: { width: 904, height: 2316 },
        colors: themeTokens(id),
      },
      null,
      2,
    ),
  );
  const defaultColors = themeTokens("lostark");
  const currentColors = themeTokens(id);
  let guide = assemblyGuide;
  if (id === "nocturne") {
    guide = guide
      .replaceAll("니나브", "NOCTURNE")
      .replace(
        "NOCTURNE는 AI 생성 비공식 팬아트이며 로스트아크 관련 권리는 원 권리자에게 있습니다. 공식 상품·배포 허가를 의미하지 않습니다.",
        "NOCTURNE는 AI 생성 오리지널 판타지 캐릭터 디자인이며 삼성 공식 테마가 아닙니다.",
      );
    // Match each original value once, so replacement colors never cascade.
    guide = guide.replace(/#[0-9A-F]{6}/g, (hex) => {
      const entry = Object.entries(defaultColors).find(
        ([, value]) => value === hex,
      );
      return entry
        ? currentColors[entry[0] as keyof typeof currentColors]
        : hex;
    });
  }
  zip.file("조립-및-적용-안내.md", guide);
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}
