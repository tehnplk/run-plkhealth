"use client";

import { useEffect, useState } from "react";
import styles from "./visit-counter.module.css";

export function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/visits", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { count?: number } | null) => {
        if (typeof data?.count === "number") setCount(data.count);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  return (
    <aside className={styles.counter} aria-live="polite" aria-label="จำนวนผู้เข้าใช้งาน">
      <span>เข้าใช้งาน</span>
      <strong>{count === null ? "—" : count.toLocaleString("th-TH")}</strong>
      <span>ครั้ง</span>
    </aside>
  );
}
