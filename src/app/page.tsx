import Image from "next/image";
import posterImage from "../../resource/poster.png";
import { loadPosterData } from "@/lib/load-poster-data";
import { PosterViewport } from "./poster-viewport";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

function formatNumber(value: number | null) {
  return value === null ? "" : numberFormatter.format(value);
}

function formatPercent(value: number | null) {
  return value === null ? "" : value.toFixed(2);
}

function formatUpdatedAt(value: string) {
  if (!value) return "ยังไม่มีการอัปโหลดข้อมูล";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ยังไม่มีการอัปโหลดข้อมูล";

  const dateText = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
  const timeText = new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Bangkok",
  })
    .format(date)
    .replace(":", ".");

  return `ข้อมูลอัปเดต วันที่ ${dateText} เวลา ${timeText} น.`;
}

export default async function Home() {
  const posterData = await loadPosterData();
  const mainRows = [...posterData.districts, posterData.otherProvince, posterData.summary];
  const activityRows = [...posterData.activities, posterData.activitySummary];
  const activityLabels = [
    ...posterData.activities.map((activity) => activity.label),
    posterData.activitySummary.label,
  ];
  const progressWidth = Math.min(100, Math.max(0, posterData.completionPercent));

  return (
    <PosterViewport>
      <section
        className={styles.poster}
        aria-label="สรุปจำนวนผู้สมัคร เดิน วิ่ง ปั่น ป้องกันอัมพาต ครั้งที่ 11 จังหวัดพิษณุโลก"
      >
        <Image
          className={styles.posterImage}
          src={posterImage}
          alt="โปสเตอร์สรุปผู้สมัคร เดิน วิ่ง ปั่น ป้องกันอัมพาต ครั้งที่ 11 จังหวัดพิษณุโลก"
          fill
          priority
          sizes="(max-width: 1414px) 100vw, 1414px"
          quality={100}
        />

        <div
          id="district-registration"
          className={styles.districtNumbers}
          aria-label="ข้อมูลผู้สมัครแยกรายอำเภอ"
        >
          {mainRows.map((row) => (
            <div className={styles.districtRow} key={row.label}>
              <span className={styles.population}>{formatNumber(row.population)}</span>
              <span className={styles.target}>{formatNumber(row.target)}</span>
              <span className={styles.registered}>{formatNumber(row.registered)}</span>
              <span className={styles.percent}>{formatPercent(row.percent)}</span>
            </div>
          ))}
        </div>

        <div className={styles.posterStatus}>
          <p className={styles.updateText}>{formatUpdatedAt(posterData.updatedAt)}</p>
          <div className={styles.progressGroup}>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label="ความคืบหน้ายอดผู้สมัคร"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.min(100, Math.round(progressWidth))}
            >
              <span
                className={styles.progressFill}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            <output className={styles.progressPercent}>
              {posterData.completionPercent.toFixed(2)}%
            </output>
          </div>
        </div>

        <div
          id="age-groups"
          className={styles.activityNumbers}
          style={{ gridTemplateRows: `repeat(${activityRows.length}, 1fr)` }}
          aria-label="ข้อมูลผู้สมัครแยกตามประเภทกิจกรรม"
        >
          {activityRows.map((row) => (
            <div className={styles.activityRow} key={row.label}>
              <span>{row.children === null ? "-" : formatNumber(row.children)}</span>
              <span>{formatNumber(row.adults)}</span>
              <span>{formatNumber(row.total)}</span>
            </div>
          ))}
        </div>

        <div
          className={styles.activityLabels}
          style={{ gridTemplateRows: `repeat(${activityLabels.length}, 1fr)` }}
          aria-label="ชื่อประเภทกิจกรรม"
        >
          {activityLabels.map((label, index) => (
            <span
              className={styles.activityLabel}
              data-summary={index === activityLabels.length - 1 || undefined}
              key={`${label}-${index}`}
            >
              {label}
            </span>
          ))}
        </div>
      </section>
    </PosterViewport>
  );
}
