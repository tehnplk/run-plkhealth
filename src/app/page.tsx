import Image from "next/image";
import posterImage from "../../resource/poster2.png";
import { loadPosterData } from "@/lib/load-poster-data";
import { Countdown } from "./countdown";
import { PosterViewport } from "./poster-viewport";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function daysRemaining() {
  const deadline = new Date("2026-08-31T23:59:59+07:00");
  return Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86_400_000));
}

function CardIcon({ type }: { type: "register" | "check" | "person" | "calendar" }) {
  const paths = {
    register: (
      <>
        <path d="m5 3 14 8-6.5 2.2L10.3 20 5 3Z" />
        <path d="m13 14 4 5" />
      </>
    ),
    check: (
      <>
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="m15 15 4.5 4.5M8 10.5l1.6 1.6 3.2-3.3" />
      </>
    ),
    person: (
      <>
        <circle cx="12" cy="7.5" r="3.5" />
        <path d="M5.5 20c.7-4.2 3-6.5 6.5-6.5s5.8 2.3 6.5 6.5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
        <path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17" />
        <circle cx="8" cy="14" r=".9" fill="currentColor" stroke="none" />
        <circle cx="12" cy="14" r=".9" fill="currentColor" stroke="none" />
        <circle cx="16" cy="14" r=".9" fill="currentColor" stroke="none" />
      </>
    ),
  };

  return (
    <svg className={styles.cardIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[type]}
    </svg>
  );
}

export default async function Home() {
  const posterData = await loadPosterData();

  return (
    <PosterViewport
      sidePanel={
        <aside className={styles.infoCards} aria-label="Event information">
          <a
            className={`${styles.infoCard} ${styles.registrationCard}`}
            href="https://wrb12.thai.run/event/PLK"
            target="_blank"
            rel="noreferrer"
          >
            <CardIcon type="register" />
            <span className={styles.cardContent}>
              <strong>สมัครกิจกรรม</strong>
            </span>
          </a>

          <a
            className={`${styles.infoCard} ${styles.checkCard}`}
            href="https://wrb12.thai.run/check"
            target="_blank"
            rel="noreferrer"
          >
            <CardIcon type="check" />
            <span className={styles.cardContent}>
              <strong>ตรวจสอบการสมัคร</strong>
            </span>
          </a>

          <section className={`${styles.infoCard} ${styles.participantCard}`} aria-label="Registered participants">
            <CardIcon type="person" />
            <span className={styles.cardContent}>
              <span className={styles.cardEyebrow}>เข้าร่วมแล้ว</span>
              <span className={styles.cardValue}>
                <strong className={styles.cardNumber}>
                  {posterData.summary.registered.toLocaleString("th-TH")}
                </strong>
                <span className={styles.cardUnit}>คน</span>
              </span>
            </span>
          </section>

          <section className={`${styles.infoCard} ${styles.countdownCard}`} aria-label="Time remaining">
            <CardIcon type="calendar" />
            <span className={styles.cardContent}>
              <span className={styles.cardEyebrow}>ยังเหลือเวลา</span>
              <Countdown initialDays={daysRemaining()} />
            </span>
          </section>
        </aside>
      }
    >
      <section
        className={styles.poster}
        aria-label="โปสเตอร์เชิญชวนเข้าร่วมกิจกรรม เดิน วิ่ง ปั่น ป้องกันอัมพาต ครั้งที่ 12"
      >
        <Image
          className={styles.posterImage}
          src={posterImage}
          alt="โปสเตอร์เชิญชวนเข้าร่วมกิจกรรม เดิน วิ่ง ปั่น ป้องกันอัมพาต ครั้งที่ 12 จังหวัดพิษณุโลก"
          fill
          priority
          sizes="(max-width: 1414px) 100vw, 1414px"
          quality={100}
        />
      </section>
    </PosterViewport>
  );
}
