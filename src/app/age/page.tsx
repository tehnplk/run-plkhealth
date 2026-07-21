import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { loadAgeGroupData } from "@/lib/load-age-data";
import { AgeBarChart } from "./age-bar-chart";
import styles from "./age.module.css";

export const dynamic = "force-dynamic";

export default function AgePage() {
  const { activities, rows } = loadAgeGroupData();
  const summary = {
    activityCounts: Object.fromEntries(
      activities.map((activity) => [
        activity,
        rows.reduce((sum, row) => sum + (row.activityCounts[activity] ?? 0), 0),
      ]),
    ),
    total: rows.reduce((sum, row) => sum + row.total, 0),
  };

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
                <th rowSpan={2}>กลุ่มอายุ</th>
                <th colSpan={activities.length}>ประเภทกิจกรรม</th>
                <th rowSpan={2}>รวมยอดผู้สมัคร</th>
              </tr>
              <tr>
                {activities.map((activity) => (
                  <th key={activity}>{activity}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  {activities.map((activity) => (
                    <td key={activity}>
                      {(row.activityCounts[activity] ?? 0).toLocaleString("th-TH")}
                    </td>
                  ))}
                  <td>{row.total.toLocaleString("th-TH")}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td>รวม</td>
                {activities.map((activity) => (
                  <td key={activity}>
                    {(summary.activityCounts[activity] ?? 0).toLocaleString("th-TH")}
                  </td>
                ))}
                <td>{summary.total.toLocaleString("th-TH")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.chartCard}>
          <AgeBarChart activities={activities} rows={rows} />
        </div>
      </section>
    </main>
  );
}
