import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { loadClubData } from "@/lib/load-club-data";
import { ClubGrid } from "./club-grid";
import styles from "./club.module.css";

export const dynamic = "force-dynamic";

export default function ClubPage() {
  const { activities, groups } = loadClubData();

  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/" aria-label="กลับไปหน้าโปสเตอร์">
        <ArrowLeftIcon size={18} weight="bold" aria-hidden="true" />
        <span>โปสเตอร์</span>
      </Link>

      <section className={styles.report} aria-labelledby="club-title">
        <h1 id="club-title" className={styles.srOnly}>
          ข้อมูลตามชมรม
        </h1>

        <ClubGrid activities={activities} groups={groups} />

      </section>
    </main>
  );
}
