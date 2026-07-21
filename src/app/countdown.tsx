"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type CountdownValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const deadline = new Date("2026-08-31T23:59:59+07:00");

function getRemaining(): CountdownValue {
  const milliseconds = Math.max(0, deadline.getTime() - Date.now());

  return {
    days: Math.ceil(milliseconds / 86_400_000),
    hours: Math.floor(milliseconds / 3_600_000) % 24,
    minutes: Math.floor(milliseconds / 60_000) % 60,
    seconds: Math.floor(milliseconds / 1_000) % 60,
  };
}

function RollingDigits({ value }: { value: number }) {
  return (
    <span className={styles.countdownNumber}>
      {value
        .toString()
        .padStart(2, "0")
        .split("")
        .map((digit, index) => (
          <span className={styles.countdownDigit} key={`${index}-${digit}`}>
            {digit}
          </span>
        ))}
    </span>
  );
}

export function Countdown({ initialDays }: { initialDays: number }) {
  const [remaining, setRemaining] = useState<CountdownValue>({
    days: initialDays,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const update = () => setRemaining(getRemaining());
    update();

    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <span className={`${styles.cardValue} ${styles.countdownDayBadge}`}>
        <strong className={styles.cardNumber}>{remaining.days.toLocaleString("th-TH")}</strong>
        <span className={styles.cardUnit}>วัน</span>
      </span>
      <span className={styles.countdownLine} aria-live="polite">
        <span className={styles.countdownPart}>
          <RollingDigits value={remaining.hours} />
          <span>ชั่วโมง</span>
        </span>
        <span className={styles.countdownPart}>
          <RollingDigits value={remaining.minutes} />
          <span>นาที</span>
        </span>
        <span className={styles.countdownPart}>
          <RollingDigits value={remaining.seconds} />
          <span>วินาที</span>
        </span>
      </span>
    </>
  );
}
