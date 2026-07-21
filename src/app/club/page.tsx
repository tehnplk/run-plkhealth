import { loadClubData } from "@/lib/load-club-data";
import { BackHomeLink, StatisticsTabs } from "@/components/report-navigation";
import { ClubGrid } from "./club-grid";
import styles from "./club.module.css";

export const dynamic = "force-dynamic";

export default function ClubPage() {
  const { activities, groups } = loadClubData();

  return (
    <main className={styles.page}>
      <BackHomeLink />

      <section className={styles.report} aria-labelledby="club-title">
        <h1 id="club-title" className={styles.srOnly}>
          ข้อมูลตามชมรม
        </h1>
        <StatisticsTabs current="club" />

        <ClubGrid activities={activities} groups={groups} />

      </section>
    </main>
  );
}
