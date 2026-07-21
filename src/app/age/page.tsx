import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { loadAgeGroupData } from "@/lib/load-age-data";
import { AgeBarChart } from "./age-bar-chart";
import styles from "./age.module.css";

export const dynamic = "force-dynamic";

export default function AgePage() {
  const rows = loadAgeGroupData();
  const summary = rows.reduce(
    (total, row) => ({
      cycling: total.cycling + row.cycling,
      running: total.running + row.running,
      walking: total.walking + row.walking,
      total: total.total + row.total,
    }),
    { cycling: 0, running: 0, walking: 0, total: 0 },
  );

  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/" aria-label="กลับไปหน้าโปสเตอร์">
        <ArrowLeftIcon size={18} weight="bold" aria-hidden="true" />
        <span>โปสเตอร์</span>
      </Link>

      <section className={styles.report} aria-labelledby="age-title">
        <h1 id="age-title" className={styles.srOnly}>
          ข้อมูลตามกลุ่มอายุ
        </h1>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Age Group</th>
                <th>ปั่น 17 กม.</th>
                <th>วิ่ง 10 กม.</th>
                <th>เดิน 5 กม.</th>
                <th>รวม</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.cycling.toLocaleString("th-TH")}</td>
                  <td>{row.running.toLocaleString("th-TH")}</td>
                  <td>{row.walking.toLocaleString("th-TH")}</td>
                  <td>{row.total.toLocaleString("th-TH")}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td>รวม</td>
                <td>{summary.cycling.toLocaleString("th-TH")}</td>
                <td>{summary.running.toLocaleString("th-TH")}</td>
                <td>{summary.walking.toLocaleString("th-TH")}</td>
                <td>{summary.total.toLocaleString("th-TH")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.chartCard}>
          <AgeBarChart rows={rows} />
        </div>
      </section>
    </main>
  );
}
