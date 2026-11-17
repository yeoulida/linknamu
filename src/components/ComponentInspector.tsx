"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 개발 전용 구성요소 검사 도구.
 * - 오른쪽 아래 버튼(또는 Alt+Shift+C)으로 켜고 끕니다. Esc로도 끌 수 있습니다.
 * - 켜진 상태에서 마우스를 올리면 구성요소 이름과 파일이 표시됩니다.
 * - 클릭하면 Claude에 붙여넣을 수정 요청 문구가 클립보드에 복사됩니다.
 *   Shift+클릭은 한 단계 바깥(부모) 구성요소를 고릅니다.
 */

type Target = {
  el: HTMLElement;
  name: string;
  file: string;
  rect: DOMRect;
  path: string[];
};

function findTarget(start: EventTarget | null, parent = false): Target | null {
  if (!(start instanceof Element)) return null;
  let el = start.closest<HTMLElement>("[data-component]");
  if (el && parent) {
    el = el.parentElement?.closest<HTMLElement>("[data-component]") ?? el;
  }
  if (!el) return null;

  const path: string[] = [];
  let cur: HTMLElement | null = el;
  while (cur) {
    path.push(cur.dataset.component!);
    cur = cur.parentElement?.closest<HTMLElement>("[data-component]") ?? null;
  }
  return {
    el,
    name: el.dataset.component!,
    file: el.dataset.file ?? "",
    rect: el.getBoundingClientRect(),
    path,
  };
}

function snippet(el: HTMLElement) {
  const text = (el.innerText || el.getAttribute("alt") || "").replace(/\s+/g, " ").trim();
  return text.length > 40 ? `${text.slice(0, 40)}…` : text;
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

export default function ComponentInspector() {
  const [on, setOn] = useState(false);
  const [hover, setHover] = useState<Target | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const toggle = useCallback(() => {
    setOn((v) => !v);
    setHover(null);
  }, []);

  // 단축키: Alt+Shift+C 켜기/끄기, Esc 끄기
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey && e.shiftKey && e.code === "KeyC") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape") {
        setOn(false);
        setHover(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  useEffect(() => {
    if (!on) return;

    const isOwnUi = (t: EventTarget | null) =>
      t instanceof Element && t.closest("[data-inspector-ui]") !== null;

    function onMove(e: MouseEvent) {
      if (isOwnUi(e.target)) return setHover(null);
      setHover(findTarget(e.target, e.shiftKey));
    }

    // 검사 모드에서는 링크 이동·버튼 클릭·입력창 포커스가 일어나지 않도록 막는다
    function block(e: Event) {
      if (isOwnUi(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    }

    function onClick(e: MouseEvent) {
      if (isOwnUi(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const t = findTarget(e.target, e.shiftKey);
      if (!t) return;

      const text = [
        `[구성요소 수정] ${t.name}`,
        `- 파일: ${t.file}`,
        `- 화면 경로: ${window.location.pathname}`,
        `- 위치: ${[...t.path].reverse().join(" > ")}`,
        snippet(t.el) ? `- 화면 내용: "${snippet(t.el)}"` : null,
        `- 요청: `,
      ]
        .filter(Boolean)
        .join("\n");

      void copy(text).then(() => {
        setToast(`${t.name} 복사됨 — Claude 입력창에 붙여넣고 요청을 적어 주세요`);
        setTimeout(() => setToast(null), 3000);
      });
    }

    function onScroll() {
      setHover((h) => (h ? { ...h, rect: h.el.getBoundingClientRect() } : h));
    }

    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("click", onClick, true);
    window.addEventListener("pointerdown", block, true);
    window.addEventListener("mousedown", block, true);
    window.addEventListener("auxclick", block, true);
    window.addEventListener("submit", block, true);
    window.addEventListener("scroll", onScroll, true);
    document.body.style.cursor = "crosshair";
    return () => {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("pointerdown", block, true);
      window.removeEventListener("mousedown", block, true);
      window.removeEventListener("auxclick", block, true);
      window.removeEventListener("submit", block, true);
      window.removeEventListener("scroll", onScroll, true);
      document.body.style.cursor = "";
    };
  }, [on]);

  const r = hover?.rect;
  const labelTop = r ? (r.top > 28 ? r.top - 26 : r.bottom + 4) : 0;

  return (
    <>
      {on && r && hover && (
        <div aria-hidden="true" style={{ pointerEvents: "none" }}>
          <div
            style={{
              position: "fixed",
              left: r.left,
              top: r.top,
              width: r.width,
              height: r.height,
              outline: "2px solid #8b5cf6",
              background: "rgba(139, 92, 246, 0.12)",
              borderRadius: 6,
              zIndex: 2147483646,
              transition: "all 60ms ease-out",
            }}
          />
          <div
            style={{
              position: "fixed",
              left: Math.max(4, Math.min(r.left, window.innerWidth - 260)),
              top: labelTop,
              maxWidth: 256,
              zIndex: 2147483647,
              background: "#6d28d9",
              color: "#fff",
              font: "500 12px/1.4 system-ui, sans-serif",
              padding: "3px 8px",
              borderRadius: 6,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {hover.name}
            <span style={{ opacity: 0.75, fontWeight: 400 }}> · {hover.file.split("/").pop()}</span>
          </div>
        </div>
      )}

      <div
        data-inspector-ui
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 2147483647,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
          font: "500 13px/1.4 system-ui, sans-serif",
        }}
      >
        {toast && (
          <div
            role="status"
            style={{
              background: "#1f2937",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: 8,
              maxWidth: 280,
            }}
          >
            {toast}
          </div>
        )}
        {on && !toast && (
          <div
            style={{
              background: "#1f2937",
              color: "#d1d5db",
              padding: "6px 10px",
              borderRadius: 8,
              fontWeight: 400,
              fontSize: 12,
            }}
          >
            클릭: 복사 · Shift+클릭: 바깥 구성요소 · Esc: 끄기
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          title="구성요소 검사 (Alt+Shift+C)"
          style={{
            minHeight: 40,
            padding: "0 14px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            color: "#fff",
            background: on ? "#6d28d9" : "#374151",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          {on ? "검사 중 ✕" : "구성요소 검사"}
        </button>
      </div>
    </>
  );
}
