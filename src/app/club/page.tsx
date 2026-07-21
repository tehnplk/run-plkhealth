import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { ClubBarChart } from "./club-bar-chart";
import { loadClubData } from "@/lib/load-club-data";
import styles from "./club.module.css";

export const dynamic = "force-dynamic";

const chartLimit = 15;

export default function ClubPage() {
  const rows = loadClubData();
  const chartRows = rows.slice(0, chartLimit);
  const total = rows.reduce((sum, row) => sum + row.registered, 0);

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

        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}>
            <h2>รายชื่อชมรม</h2>
            <span>{rows.length.toLocaleString("th-TH")} ชมรม</span>
          </div>
          <div className={styles.tableScroll}>
            <table>
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>ชมรม</th>
                  <th>จำนวนผู้สมัคร</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.label}>
                    <td>{index + 1}</td>
                    <td>{row.label}</td>
                    <td>{row.registered.toLocaleString("th-TH")}</td>
                  </tr>
                ))}
                <tr className={styles.totalRow}>
                  <td aria-hidden="true"></td>
                  <td>รวม</td>
                  <td>{total.toLocaleString("th-TH")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <section className={styles.chartCard} aria-labelledby="club-chart-title">
          <div className={styles.chartHeader}>
            <h2 id="club-chart-title">15 อันดับชมรมที่มีผู้สมัครสูงสุด</h2>
            <span>เรียงจากมากไปน้อย</span>
          </div>
          <ClubBarChart rows={chartRows} />
        </section>
      </section>
    </main>
  );
}
