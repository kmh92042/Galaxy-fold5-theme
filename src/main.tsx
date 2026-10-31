import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  ExternalLink,
  ImagePlus,
  Layers3,
  LoaderCircle,
  MonitorSmartphone,
  Moon,
  Palette,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import {
  apps,
  iconSvg,
  surfaces,
  svgUrl,
  collections,
  type CollectionId,
  type Surface,
} from "./theme";
import { download, iconPng, loadImage, pack, wallpaper } from "./export";
import "./styles.css";
import { FullThemeStudio } from "./FullThemeStudio";
const initialEdits = Object.fromEntries(
  Object.entries(collections).map(([id, c]) => [
    id,
    {
      sources: { cover: c.artwork, inner: c.artwork, lock: c.artwork },
      dim: c.dim,
      position: c.position,
      accent: c.accent,
    },
  ]),
) as Record<
  CollectionId,
  {
    sources: Record<Surface, string>;
    dim: number;
    position: number;
    accent: string;
  }
>;

function App() {
  const [showFullTheme, setShowFullTheme] = useState(false);
  const [surface, setSurface] = useState<Surface>("cover");
  const [tab, setTab] = useState("wallpaper");
  const [collectionId, setCollectionId] = useState<CollectionId>("lostark");
  const [edits, setEdits] = useState(initialEdits);
  const collection = collections[collectionId];
  const artwork = collection.artwork;
  const { sources, dim, position, accent } = edits[collectionId];
  const setSources = (
    update: (prev: Record<Surface, string>) => Record<Surface, string>,
  ) =>
    setEdits((prev) => ({
      ...prev,
      [collectionId]: {
        ...prev[collectionId],
        sources: update(prev[collectionId].sources),
      },
    }));
  const setDim = (dim: number) =>
    setEdits((prev) => ({
      ...prev,
      [collectionId]: { ...prev[collectionId], dim },
    }));
  const setPosition = (position: number) =>
    setEdits((prev) => ({
      ...prev,
      [collectionId]: { ...prev[collectionId], position },
    }));
  const setAccent = (accent: string) =>
    setEdits((prev) => ({
      ...prev,
      [collectionId]: { ...prev[collectionId], accent },
    }));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [guide, setGuide] = useState(false);
  const [widgets, setWidgets] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const s = surfaces[surface];
  useEffect(() => {
    if (!guide) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>("button, a[href], input") ?? [],
      );
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGuide(false);
      if (event.key === "Tab") {
        const items = focusable(),
          first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [guide]);
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      setMessage(
        "다운로드가 준비되었습니다. 브라우저의 다운로드 목록을 확인하세요.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "내보내기에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setMessage("PNG, JPEG, WebP 이미지만 사용할 수 있습니다.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setMessage("25MB 이하의 이미지를 선택하세요.");
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const image = await loadImage(url);
      if (image.width * image.height > 40000000)
        throw new Error("4천만 픽셀 이하의 이미지를 선택하세요.");
      setSources((prev) => {
        if (prev[surface].startsWith("blob:"))
          URL.revokeObjectURL(prev[surface]);
        return { ...prev, [surface]: url };
      });
      setMessage(
        `${s.label} 이미지를 교체했습니다. 다른 화면의 이미지는 유지됩니다.`,
      );
    } catch (e) {
      URL.revokeObjectURL(url);
      setMessage(e instanceof Error ? e.message : "이미지 오류");
    }
  }
  return (
    <div className={`app-shell theme-${collectionId}`}>
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-mark">
            <Moon size={21} />
          </span>
          <span>
            NOCTURNE<small>THEME STUDIO</small>
          </span>
        </a>
        <div className="workspace-tag">PERSONAL WORKSPACE</div>
        <nav>
          <button
            className={tab === "wallpaper" ? "nav-item active" : "nav-item"}
            onClick={() => setTab("wallpaper")}
          >
            <MonitorSmartphone size={19} /> 테마 스튜디오
            <span className="nav-dot" />
          </button>
          <button
            className={tab === "icons" ? "nav-item active" : "nav-item"}
            onClick={() => setTab("icons")}
          >
            <Layers3 size={19} /> 아이콘 라이브러리
            <span className="count">08</span>
          </button>
          <button className="nav-item" onClick={() => setGuide(true)}>
            <CircleHelp size={19} /> 적용 가이드
            <ArrowUpRight size={15} />
          </button>
        </nav>
        <div className="side-collection">
          <span>YOUR COLLECTION</span>
          <div
            className="collection-thumb"
            style={{ backgroundImage: `url(${artwork})` }}
          />
          <strong>{collection.name}</strong>
          <p>{collection.korean}</p>
          <span className="edition">VOL. {collection.edition} / 2026</span>
        </div>
        <div className="side-bottom">
          <span className="status-light" /> Galaxy Z Fold5 전용
          <span className="side-version">v1.0</span>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div>
            워크스페이스 <ChevronRight size={13} />
            <span>
              {tab === "icons" ? "아이콘 라이브러리" : "테마 스튜디오"}
            </span>
          </div>
          <a
            href="https://www.samsung.com/uk/support/apps-services/how-to-use-the-theme-park-app/"
            target="_blank"
            rel="noreferrer"
          >
            Theme Park 알아보기 <ExternalLink size={13} />
          </a>
        </header>
        <div className="page">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span /> MADE FOR YOUR FOLD
              </div>
              <h1>
                {tab === "icons"
                  ? "작은 아이콘, 같은 세계관."
                  : "당신의 폴드에, 새로운 세계를."}
              </h1>
              <p>{collection.subtitle}</p>
            </div>
            <button
              className="primary"
              disabled={busy}
              onClick={() =>
                run(async () =>
                  download(
                    await pack(sources, dim, position, accent, collection),
                    `${collection.filename}.zip`,
                  ),
                )
              }
            >
              {busy ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <Download size={17} />
              )}{" "}
              테마 팩 다운로드
            </button>
          </div>
          <div
            className="collection-switcher"
            role="group"
            aria-label="테마 컬렉션 선택"
          >
            {(Object.keys(collections) as CollectionId[]).map((id) => (
              <button
                key={id}
                disabled={busy}
                aria-pressed={collectionId === id}
                onClick={() => {
                  setCollectionId(id);
                  setMessage("");
                }}
              >
                <span className={`collection-swatch ${id}`} />
                {id === "lostark"
                  ? "로스트아크 · 니나브"
                  : "NOCTURNE · 미드나잇"}
                {collectionId === id && <Check size={13} />}
              </button>
            ))}
            <span>테마별 편집값은 전환해도 유지됩니다.</span>
            <a
              className="static-download"
              href={`${import.meta.env.BASE_URL}downloads/${collection.filename}.zip`}
              download
            >
              <Download size={12} /> 기본 ZIP 바로 받기
            </a>
          </div>
          <section className="collection-banner">
            <div
              className="banner-art"
              style={{ backgroundImage: `url(${artwork})` }}
            />
            <div className="banner-copy">
              <div className="pill">
                <Sparkles size={11} /> {collection.label}
              </div>
              <h2>
                {collection.name}
                <span>{collection.korean}</span>
              </h2>
              <p>{collection.description}</p>
              <div className="banner-tags">
                <span>
                  {collectionId === "lostark"
                    ? "비공식 팬 콘셉트"
                    : "오리지널 캐릭터"}
                </span>
                <i />
                {collection.genre}
                <i />
                VOL. {collection.edition}
              </div>
            </div>
            <div className="banner-number">
              {collection.edition}
              <span>
                {collectionId === "lostark"
                  ? "WINGS OF DAWN"
                  : "NOCTURNE ORIGINALS"}
              </span>
            </div>
          </section>
          <div className="studio-grid">
            <section className="preview-panel">
              <div className="section-heading">
                <h3>
                  <MonitorSmartphone size={17} /> 디바이스 미리보기
                </h3>
                <span className="live">
                  <span /> LIVE PREVIEW
                </span>
              </div>
              <div className="preview-toolbar">
                <div className="segmented">
                  {(Object.keys(surfaces) as Surface[]).map((key) => (
                    <button
                      key={key}
                      className={surface === key ? "selected" : ""}
                      onClick={() => setSurface(key)}
                    >
                      {key === "inner" ? (
                        <Layers3 size={14} />
                      ) : key === "lock" ? (
                        <ShieldCheck size={14} />
                      ) : (
                        <Smartphone size={14} />
                      )}{" "}
                      {surfaces[key].label}
                    </button>
                  ))}
                </div>
                <button
                  className={"widget-toggle " + (widgets ? "on" : "")}
                  onClick={() => setWidgets(!widgets)}
                  aria-pressed={widgets}
                >
                  위젯 표시 <span />
                </button>
              </div>
              <div
                className={
                  "device-stage " + (surface === "inner" ? "unfolded" : "")
                }
              >
                <div
                  className={
                    "device " + (surface === "inner" ? "device-inner" : "")
                  }
                  style={{ aspectRatio: `${s.width}/${s.height}` }}
                >
                  <div
                    className="device-image"
                    style={{
                      backgroundImage: `url(${sources[surface]})`,
                      backgroundPosition: `${position}% center`,
                    }}
                  />
                  <div className="device-dim" style={{ opacity: dim / 100 }} />
                  {collection.iconStyle === "relic" && (
                    <div className="readability-veil" />
                  )}
                  {surface === "lock" && <div className="lock-veil" />}
                  <div className="camera-dot" />
                  <div className="phone-status">
                    <span>9:41</span>
                    <span>▮▮▮ ᯤ ▰</span>
                  </div>
                  {widgets && (
                    <>
                      <div
                        className={
                          "phone-clock " +
                          (surface === "lock" ? "lock-clock" : "")
                        }
                      >
                        <div>10월 31일 토요일</div>
                        <strong>
                          09<span>:</span>41
                        </strong>
                        <p>☾ 서울 · 18°</p>
                      </div>
                      {surface !== "lock" && (
                        <>
                          <div className="phone-widget">
                            <span>{collection.widget}</span>
                            <Sparkles size={15} />
                          </div>
                          <div className="phone-apps">
                            {apps
                              .slice(0, surface === "inner" ? 8 : 4)
                              .map((app, i) => (
                                <div key={app.id}>
                                  <img
                                    src={svgUrl(
                                      iconSvg(i, accent, collection.iconStyle),
                                    )}
                                    alt=""
                                  />
                                  <span>{app.name}</span>
                                </div>
                              ))}
                          </div>
                          <div className="phone-dock">
                            {[0, 1, 5].map((i) => (
                              <img
                                key={i}
                                src={svgUrl(
                                  iconSvg(i, accent, collection.iconStyle),
                                )}
                                alt={apps[i].name}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                  <div className="gesture-bar" />
                </div>
                <div className="stage-label">
                  SAMSUNG GALAXY Z FOLD5
                  <span>
                    {s.subtitle} <i /> {s.width} × {s.height} px
                  </span>
                </div>
              </div>
              <div className="preview-note">
                <CircleHelp size={14} /> 시계·위젯·앱 배치는 미리보기용이며
                배경화면 PNG에 포함되지 않습니다.
              </div>
            </section>
            <aside className="controls">
              <div className="editor-card">
                <div className="section-heading">
                  <h3>
                    <Settings2 size={17} /> 테마 커스터마이징
                  </h3>
                  <span className="mini-label">STUDIO</span>
                </div>
                <div className="editor-tabs">
                  <button
                    className={tab === "wallpaper" ? "selected" : ""}
                    onClick={() => setTab("wallpaper")}
                  >
                    배경화면
                  </button>
                  <button
                    className={tab === "icons" ? "selected" : ""}
                    onClick={() => setTab("icons")}
                  >
                    앱 아이콘
                  </button>
                </div>
                {tab === "wallpaper" ? (
                  <div className="editor-content">
                    <div className="field-heading">
                      <h4>배경 이미지</h4>
                      <span>{s.label}</span>
                    </div>
                    <button
                      className="image-choice"
                      onClick={() => fileRef.current?.click()}
                    >
                      <img src={sources[surface]} alt="현재 배경 이미지" />
                      <span>
                        <strong>
                          {sources[surface] === artwork
                            ? collection.name
                            : "나의 커스텀 이미지"}
                        </strong>
                        <small>
                          {sources[surface] === artwork
                            ? collection.label
                            : "이 화면에만 적용됨"}
                        </small>
                      </span>
                      <span className="selected-check">
                        <Check size={13} />
                      </span>
                    </button>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      ref={fileRef}
                      hidden
                      onChange={(e) => {
                        void upload(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    <button
                      className="upload-button"
                      onClick={() => fileRef.current?.click()}
                    >
                      <ImagePlus size={16} /> 내 이미지로 교체{" "}
                      <span>PNG, JPG, WebP · 최대 25MB</span>
                    </button>
                    <div className="slider-label">
                      <label htmlFor="dim">배경 어둡기</label>
                      <span>{dim}%</span>
                    </div>
                    <input
                      id="dim"
                      type="range"
                      min="0"
                      max="70"
                      value={dim}
                      onChange={(e) => setDim(+e.target.value)}
                    />
                    <div className="range-ticks">
                      <span>선명하게</span>
                      <span>차분하게</span>
                    </div>
                    <div className="slider-label">
                      <label htmlFor="position">가로 크롭 위치</label>
                      <span>{position}%</span>
                    </div>
                    <input
                      id="position"
                      type="range"
                      min="0"
                      max="100"
                      value={position}
                      onChange={(e) => setPosition(+e.target.value)}
                    />
                    <div className="range-ticks">
                      <span>왼쪽</span>
                      <span>오른쪽</span>
                    </div>
                  </div>
                ) : (
                  <div className="editor-content">
                    <div className="field-heading">
                      <h4>오리지널 앱 아이콘</h4>
                      <span>192 × 192 PNG</span>
                    </div>
                    <div className="icon-library">
                      {apps.map((app, i) => (
                        <button
                          key={app.id}
                          disabled={busy}
                          onClick={() =>
                            run(async () =>
                              download(
                                await iconPng(i, accent, collection.iconStyle),
                                `${app.id}-192.png`,
                              ),
                            )
                          }
                          title={`${app.name} PNG 다운로드`}
                        >
                          <img
                            src={svgUrl(
                              iconSvg(i, accent, collection.iconStyle),
                            )}
                            alt=""
                          />
                          <span>{app.name}</span>
                          <ArrowDownToLine size={12} />
                        </button>
                      ))}
                    </div>
                    <p className="small-note">
                      앱 실행용 아이콘 이미지입니다. 각 앱의 내부 디자인은
                      변경되지 않습니다.
                    </p>
                  </div>
                )}
                <div className="palette-field">
                  <div className="field-heading">
                    <h4>
                      <Palette size={14} /> 아이콘 포인트 컬러
                    </h4>
                    <span>{accent.toUpperCase()}</span>
                  </div>
                  <div className="swatches">
                    {collection.colors.map((c) => (
                      <button
                        key={c}
                        aria-label={`${c} 포인트 컬러`}
                        aria-pressed={accent === c}
                        style={{ background: c }}
                        onClick={() => setAccent(c)}
                      >
                        {accent === c && <Check size={15} />}
                      </button>
                    ))}
                    <span>
                      {
                        (
                          {
                            "#d8b77a": "Champagne gold",
                            "#88cfe8": "Celestial blue",
                            "#d9d9e5": "Moon ivory",
                            "#a6b9d2": "Steel blue",
                            "#a78bfa": "Neon violet",
                            "#65d5ff": "Electric blue",
                            "#ed9ae8": "Rose glow",
                            "#b5c2df": "Moon silver",
                          } as Record<string, string>
                        )[accent]
                      }
                    </span>
                  </div>
                </div>
                <div className="export-box">
                  <div>
                    <span>내보내기 해상도</span>
                    <strong>
                      {s.width} × {s.height}
                      <small>PNG</small>
                    </strong>
                  </div>
                  <button
                    disabled={busy}
                    onClick={() =>
                      run(async () =>
                        download(
                          await wallpaper(
                            sources[surface],
                            surface,
                            dim,
                            position,
                            collection.iconStyle,
                          ),
                          `${collection.id}-${surface}-${s.width}x${s.height}.png`,
                        ),
                      )
                    }
                  >
                    <Download size={16} /> 배경화면 다운로드
                  </button>
                </div>
              </div>
              <button className="guide-card" onClick={() => setGuide(true)}>
                <span className="guide-icon">
                  <ShieldCheck size={22} />
                </span>
                <div>
                  <strong>내 폰에 적용하는 방법</strong>
                  <p>Good Lock · Theme Park 가이드</p>
                </div>
                <ArrowUpRight size={18} />
              </button>
              <div className="compatibility">
                <Check size={13} /> Fold5 원본 해상도 지원 <span>·</span> 별도
                앱 설치 없이 PNG 내보내기
              </div>
            </aside>
          </div>
          <section className="resource-strip">
            <div>
              <span className="resource-icon">
                <Layers3 size={20} />
              </span>
              <div>
                <h3>하나의 무드, 모든 화면에.</h3>
                <p>배경화면 3종과 오리지널 아이콘 8종을 하나의 테마 팩으로.</p>
              </div>
            </div>
            <div className="mini-icons">
              {[0, 1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={svgUrl(iconSvg(i, accent, collection.iconStyle))}
                  alt={apps[i].name}
                />
              ))}
            </div>
            <span className="resource-badge">
              PNG ASSETS <ArrowUpRight size={13} />
            </span>
          </section>
          <div className="full-theme-entry">
            <div>
              <strong>
                원신 예시처럼 전체 화면의 디자인을 통일하고 싶다면
              </strong>
              <p>
                전화·삼성 메시지·키보드·알림창의 설계와 조립 리소스를
                확인하세요. 실제 기기 적용은 별도입니다.
              </p>
            </div>
            <button
              className="primary"
              aria-expanded={showFullTheme}
              onClick={() => setShowFullTheme(!showFullTheme)}
            >
              {showFullTheme ? "전체 테마 설계 닫기" : "전체 테마 설계 보기"}
            </button>
          </div>
          {showFullTheme && (
            <FullThemeStudio key={collectionId} collectionId={collectionId} />
          )}
          <footer>
            <span>
              NOCTURNE <i /> Designed for the way you unfold.
            </span>
            <span>
              {collectionId === "lostark"
                ? "로스트아크 비공식 팬 콘셉트 · Smilegate 공식 상품이 아닙니다."
                : "삼성 공식 테마가 아닌 개인 적용용 디자인 리소스입니다."}
            </span>
          </footer>
        </div>
      </main>
      {message && (
        <div className="toast" role="status">
          {message}
          <button aria-label="알림 닫기" onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {guide && (
        <div className="modal-backdrop" onClick={() => setGuide(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="가이드 닫기"
              onClick={() => setGuide(false)}
            >
              <X />
            </button>
            <div className="eyebrow">MAKE IT YOURS</div>
            <h2 id="guide-title">나의 폴드에 적용하기</h2>
            <p>PNG 디자인 리소스를 내보낸 뒤 기기에서 직접 적용하세요.</p>
            <ol>
              <li>
                <strong>테마 팩 다운로드·압축 해제</strong>
                <p>
                  ZIP을 폴드5에 옮겨 ‘내 파일’에서 압축을 풉니다. wallpapers와
                  icons 폴더를 확인하세요.
                </p>
              </li>
              <li>
                <strong>외부·내부 배경화면 설정</strong>
                <p>
                  기기를 접은 상태에서 설정 → 배경화면 및 스타일 → 배경화면
                  변경으로 cover PNG를 홈 화면에 지정합니다. 기기를 펼친 뒤
                  inner PNG를 내부 화면에 지정하세요.
                </p>
              </li>
              <li>
                <strong>잠금화면 설정</strong>
                <p>
                  lock PNG는 외부 잠금화면용입니다. 내부 잠금화면에는 inner
                  PNG를 선택하세요. 시계·알림은 기기에서 별도로 조절합니다.
                  화면별 설정 메뉴는 One UI 버전에 따라 다릅니다.
                </p>
              </li>
              <li>
                <strong>Good Lock → Theme Park → 아이콘</strong>
                <p>
                  Galaxy Store에서 Good Lock과 Theme Park를 설치합니다. 아이콘 →
                  새로 만들기에서 개별 앱 아이콘 이미지 변경 기능으로 icons
                  폴더의 PNG를 선택하고 저장·적용하세요. 메뉴와 지원 범위는
                  버전·지역별로 다릅니다.
                </p>
              </li>
            </ol>
            <div className="guide-warning">
              자동 설치되는 .apk/.mtpk 테마가 아닙니다. 시스템 UI, 카카오톡
              대화방, 앱 내부 화면은 변경하지 않습니다. 일부 앱의 알림 배지와
              아이콘 마스킹은 기기 설정에 따릅니다.
            </div>
            <button className="primary" onClick={() => setGuide(false)}>
              확인했어요 <Check size={16} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
