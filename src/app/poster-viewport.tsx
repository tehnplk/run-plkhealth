"use client";

import Link from "next/link";
import { GearSixIcon } from "@phosphor-icons/react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./page.module.css";

const minZoom = 60;
const maxZoom = 200;
const zoomStep = 10;

export function PosterViewport({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState(100);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const zoomStyle = {
    "--poster-zoom": zoom / 100,
  } as CSSProperties;

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <main className={styles.page}>
      <div className={styles.stage}>
        <div className={styles.stageInner}>
          <div className={styles.zoomSurface} style={zoomStyle}>
            {children}
          </div>
        </div>
      </div>

      <div className={styles.settings} ref={menuRef}>
        <button
          className={styles.settingsButton}
          type="button"
          aria-label="เปิดเมนู"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <GearSixIcon size={22} weight="bold" aria-hidden="true" />
        </button>

        {menuOpen ? (
          <nav className={styles.settingsMenu} aria-label="เมนูโปสเตอร์">
            <Link href="/amp" onClick={() => setMenuOpen(false)}>
              ยอดสมัครรายอำเภอ
            </Link>
            <Link href="/age" onClick={() => setMenuOpen(false)}>
              ข้อมูลตามกลุ่มอายุ
            </Link>
            <Link href="/upload" onClick={() => setMenuOpen(false)}>
              Upload
            </Link>
          </nav>
        ) : null}
      </div>

      <div className={styles.zoomControl} aria-label="Poster zoom controls">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setZoom((value) => Math.min(maxZoom, value + zoomStep))}
          disabled={zoom === maxZoom}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setZoom((value) => Math.max(minZoom, value - zoomStep))}
          disabled={zoom === minZoom}
        >
          −
        </button>
      </div>
    </main>
  );
}
