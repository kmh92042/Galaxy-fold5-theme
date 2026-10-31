import { useEffect, useState } from "react";
import { Download, Layers3, LoaderCircle } from "lucide-react";
import { collections, type CollectionId } from "./theme";
import { download } from "./export";
import {
  artData,
  fullThemeKit,
  systemScreens,
  systemSvg,
  themeTokens,
  themeParkMappings,
} from "./fullTheme";
import "./full-theme.css";

export function FullThemeStudio({
  collectionId,
}: {
  collectionId: CollectionId;
}) {
  const [art, setArt] = useState("");
  const [images, setImages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    setArt("");
    setImages({});
    setError("");
    artData(collections[collectionId].artwork)
      .then((data) => {
        if (cancelled) return;
        const previews = Object.fromEntries(
          systemScreens.map((screen) => {
            const url = URL.createObjectURL(
              new Blob([systemSvg(screen.id, collectionId, data)], {
                type: "image/svg+xml",
              }),
            );
            urls.push(url);
            return [screen.id, url];
          }),
        );
        setArt(data);
        setImages(previews);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "리소스 로드 실패");
      });
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [collectionId]);
  const colors = themeTokens(collectionId);
  async function exportKit() {
    setBusy(true);
    setError("");
    try {
      download(
        await fullThemeKit(collectionId, art),
        `${collections[collectionId].filename}-Design-Kit.zip`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "내보내기 실패");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="full-theme-studio" aria-labelledby="full-theme-title">
      <div className="full-theme-heading">
        <div>
          <div className="eyebrow">ONE UI 8.5 · THEME PARK 적용 목표</div>
          <h2 id="full-theme-title">
            <Layers3 size={24} /> 전체 테마 디자인
          </h2>
          <p>
            배경부터 전화·메시지·키보드·알림창·음량패널까지 하나의 무드로
            설계합니다.
          </p>
        </div>
        <button className="primary" onClick={exportKit} disabled={!art || busy}>
          {busy ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <Download size={16} />
          )}{" "}
          제작자료 ZIP 다운로드
        </button>
      </div>
      {collectionId === "lostark" && (
        <a
          className="manual-pack-link"
          href={`${import.meta.env.BASE_URL}downloads/LOSTARK-Nineveh-ThemePark-Manual.zip`}
          download
        >
          <Download size={14} /> Theme Park 수동 적용팩 바로 받기 ·
          배경·아이콘·색상표
        </a>
      )}
      <div className="full-theme-status">
        <strong>현재 단계: 디자인·리소스 제작 완료 / 기기 적용 전</strong>
        <p>
          아래 설계는 컬렉션 기본값 기준이며 위 배경 편집과 독립적입니다. 아래는
          디자인 시안입니다. Theme Park가 지원하는 항목에 수동으로 적용해야
          하며, 기기의 실제 UI와 동일하다고 보장하지 않습니다. 제작자료 ZIP은
          설치 파일이나 Theme Park 가져오기 파일이 아닙니다.
        </p>
      </div>
      {error && (
        <p className="full-theme-error" role="alert">
          {error}
        </p>
      )}
      <div className="system-screen-grid">
        {systemScreens.map((screen) => (
          <figure key={screen.id}>
            <div className="system-screen-frame">
              {images[screen.id] ? (
                <img
                  src={images[screen.id]}
                  alt={`${screen.label} 디자인 시안`}
                  loading="lazy"
                />
              ) : (
                <span>시안 준비 중…</span>
              )}
            </div>
            <figcaption>
              <strong>{screen.label}</strong>
              <span>디자인 시안 · 적용 미검증</span>
              <p>{screen.scope}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="full-theme-palette">
        <h3>Theme Park 수동 입력용 팔레트 · 사용자 확인된 5개 탭</h3>
        <div>
          {Object.entries(colors).map(([name, color]) => (
            <span key={name}>
              <i style={{ background: color }} />
              <strong>{name}</strong>
              <code>{color}</code>
            </span>
          ))}
        </div>
        <p>
          JSON은 색상 명세 문서입니다. Theme Park에서 자동 가져오기·전체
          적용하는 기능은 제공하지 않습니다.
        </p>
      </div>
      <div className="theme-park-map">
        <h3>내 폴드5 적용표 · Theme Park에서 직접 지정</h3>
        <p>
          One UI 8.5와 5개 탭은 사용자 확인 정보입니다. 아래 항목명은 실제
          편집기 슬롯명이 아닌 색상의 역할이며, 지원되는 항목에 대응시켜
          입력하세요.
        </p>
        <div>
          {Object.entries(themeParkMappings).map(([tab, rows]) => (
            <section key={tab}>
              <h4>{tab}</h4>
              {rows.map(([label, key]) => (
                <div key={label}>
                  <span>{label}</span>
                  <code>
                    <i style={{ background: colors[key] }} />
                    {colors[key]}
                  </code>
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
      <details className="full-theme-instructions">
        <summary>One UI 8.5에서 적용하는 순서와 지원 범위</summary>
        <ol>
          <li>홈·잠금 배경 및 아이콘은 기존 PNG 팩으로 먼저 적용합니다.</li>
          <li>
            Theme Park에 ‘테마’ 탭이 있으면 새 테마를 만들고 지원 색상 항목에 위
            팔레트를 입력합니다. 전화·삼성 메시지 미리보기에 실제 반영되는
            범위를 확인하세요.
          </li>
          <li>
            키보드·퀵패널·음량패널 탭에서 같은 팔레트로 각각 만들고 적용합니다.
            키보드는 삼성 키보드 기준입니다.
          </li>
          <li>
            임의의 앱 배경·버튼 이미지·말풍선 이미지 삽입은 편집기가 지원하는
            경우에만 가능합니다. 제공 SVG/PNG를 모든 항목에 넣을 수 있다고
            가정하지 마세요.
          </li>
          <li>
            접힘·펼침, 라이트·다크 모드에서 전화·삼성 메시지·키보드·알림을
            확인해야 실제 적용 완료입니다. 전화·메시지는 현재 디자인 시안이며
            One UI 8.5에서 동일 적용은 미검증입니다.
          </li>
        </ol>
        <p>
          삼성 메시지 시안은 Google 메시지·카카오톡에 적용되지 않습니다. 삼성
          키보드 시안은 Gboard에 적용되지 않습니다. 설치형 삼성 테마
          프로젝트·빌드·서명은 수행하지 않았습니다.
        </p>
      </details>
    </section>
  );
}
