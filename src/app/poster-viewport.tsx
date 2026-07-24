"use client";

import Link from "next/link";
import { GearSixIcon } from "@phosphor-icons/react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./page.module.css";

export function PosterViewport({
  children,
  sidePanel,
  posterFooter,
}: {
  children: ReactNode;
  sidePanel?: ReactNode;
  posterFooter?: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!viewerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setViewerOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [viewerOpen]);

  return (
    <main className={styles.page}>
      <div className={styles.backgroundPhoto} aria-hidden="true" />

      <div className={styles.stage}>
        <div className={styles.stageInner}>
          {sidePanel}
          <div className={styles.zoomSurface}>
            <div
              className={styles.posterTrigger}
              role="button"
              tabIndex={0}
              aria-label="เปิดดูโปสเตอร์ขนาดใหญ่"
              onClick={() => setViewerOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setViewerOpen(true);
                }
              }}
            >
              {children}
            </div>
            {posterFooter}
          </div>
        </div>
      </div>

      {viewerOpen ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="โปสเตอร์กิจกรรมขนาดใหญ่"
          onClick={() => setViewerOpen(false)}
        >
          <button
            className={styles.lightboxClose}
            type="button"
            aria-label="ปิดโปสเตอร์"
            autoFocus
            onClick={() => setViewerOpen(false)}
          >
            ×
          </button>
          <div className={styles.lightboxPoster} onClick={(event) => event.stopPropagation()}>
            {children}
          </div>
        </div>
      ) : null}

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
              สถิติการสมัคร
            </Link>
            <Link href="/upload" onClick={() => setMenuOpen(false)}>
              Upload
            </Link>
          </nav>
        ) : null}
      </div>

    </main>
  );
}
