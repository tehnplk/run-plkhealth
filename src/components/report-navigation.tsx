import Link from "next/link";
import styles from "./report-navigation.module.css";

const statisticsTabs = [
  { href: "/amp", label: "ยอดสมัครรายอำเภอ", id: "district" },
  { href: "/age", label: "ข้อมูลตามกลุ่มอายุ", id: "age" },
  { href: "/club", label: "ข้อมูลแยกรายชมรม", id: "club" },
] as const;

type StatisticsTabId = (typeof statisticsTabs)[number]["id"];

export function BackHomeLink() {
  return (
    <Link className={styles.backHome} href="/">
      ← กลับหน้าแรก
    </Link>
  );
}

export function StatisticsTabs({ current }: { current: StatisticsTabId }) {
  return (
    <nav className={styles.tabs} aria-label="เมนูสถิติการสมัคร">
      {statisticsTabs.map((tab) => (
        <Link
          key={tab.id}
          className={`${styles.tab} ${tab.id === current ? styles.tabActive : ""}`}
          href={tab.href}
          aria-current={tab.id === current ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
