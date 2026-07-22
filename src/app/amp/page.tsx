import { loadDistrictData } from "@/lib/load-district-data";
import { ExcelExportLink } from "@/components/excel-export-link";
import { BackHomeLink, StatisticsTabs } from "@/components/report-navigation";
import {
  DistrictPieChart,
  type DistrictChartRow,
} from "../district/district-pie-chart";
import styles from "../district/district.module.css";

export const dynamic = "force-dynamic";

const chartColors = [
  "#4e79a7",
  "#f28e2b",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc948",
  "#b07aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ab",
];

export default async function AmpPage() {
  const { activities, rows: districtRows } = loadDistrictData();
  const rows: DistrictChartRow[] = districtRows.map((row, index) => ({
    label: row.label,
    value: row.registered,
    color: chartColors[index],
  }));
  const summary = {
    activityCounts: Object.fromEntries(
      activities.map((activity) => [
        activity,
        districtRows.reduce(
          (sum, row) => sum + (row.activityCounts[activity] ?? 0),
          0,
        ),
      ]),
    ),
    registered: districtRows.reduce((sum, row) => sum + row.registered, 0),
    target: districtRows.reduce((sum, row) => sum + row.target, 0),
  };
  const summaryPercentage =
    summary.target === 0 ? 0 : (summary.registered / summary.target) * 100;

  return (
    <main className={styles.page}>
      <BackHomeLink />

      <section className={styles.report} aria-labelledby="district-title">
        <h1 id="district-title" className={styles.srOnly}>
          ยอดสมัครรายอำเภอ
        </h1>
        <StatisticsTabs current="district" />

        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}>
            <h2>ยอดสมัครรายอำเภอ</h2>
            <ExcelExportLink className={styles.exportLink} report="amp" />
          </div>
          <table>
            <thead>
              <tr>
                <th rowSpan={2}>ลำดับ</th>
                <th rowSpan={2}>อำเภอ</th>
                <th colSpan={activities.length}>ประเภทกิจกรรม</th>
                <th rowSpan={2}>รวมยอดผู้สมัคร</th>
                <th rowSpan={2}>เป้าหมายที่ต้องการ</th>
                <th rowSpan={2}>คิดเป็นร้อยละ</th>
              </tr>
              <tr>
                {activities.map((activity) => (
                  <th key={activity}>{activity}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {districtRows.map((row, index) => (
                <tr key={row.label}>
                  <td>{index + 1}</td>
                  <td>{row.label}</td>
                  {activities.map((activity) => (
                    <td key={activity}>
                      {(row.activityCounts[activity] ?? 0).toLocaleString("th-TH")}
                    </td>
                  ))}
                  <td>
                    <strong>{row.registered.toLocaleString("th-TH")}</strong>
                  </td>
                  <td>{row.target.toLocaleString("th-TH")}</td>
                  <td>
                    <strong>
                      {row.percentage.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td aria-hidden="true"></td>
                <td>รวม</td>
                {activities.map((activity) => (
                  <td key={activity}>
                    {(summary.activityCounts[activity] ?? 0).toLocaleString("th-TH")}
                  </td>
                ))}
                <td>{summary.registered.toLocaleString("th-TH")}</td>
                <td>{summary.target.toLocaleString("th-TH")}</td>
                <td>
                  <strong>
                    {summaryPercentage.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.chartCard}>
          <DistrictPieChart rows={rows} />
        </div>
      </section>
    </main>
  );
}
