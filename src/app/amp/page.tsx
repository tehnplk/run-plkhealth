import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { loadPosterData } from "@/lib/load-poster-data";
import {
  DistrictPieChart,
  type DistrictChartRow,
} from "../district/district-pie-chart";
import styles from "../district/district.module.css";

export const dynamic = "force-dynamic";

const districtOrder = [
  "เมืองพิษณุโลก",
  "เนินมะปราง",
  "วังทอง",
  "วัดโบสถ์",
  "ชาติตระการ",
  "พรหมพิราม",
  "บางระกำ",
  "บางกระทุ่ม",
  "นครไทย",
];

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
];

export default async function AmpPage() {
  const posterData = await loadPosterData();
  const byLabel = new Map(
    posterData.districts.map((district) => [district.label, district.registered]),
  );
  const rows: DistrictChartRow[] = districtOrder.map((label, index) => ({
    label,
    value: byLabel.get(label) ?? 0,
    color: chartColors[index],
  }));
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/" aria-label="กลับไปหน้าโปสเตอร์">
        <ArrowLeftIcon size={18} weight="bold" aria-hidden="true" />
        <span>โปสเตอร์</span>
      </Link>

      <section className={styles.report} aria-labelledby="district-title">
        <h1 id="district-title" className={styles.srOnly}>
          ยอดสมัครรายอำเภอ
        </h1>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>อำเภอ</th>
                <th>จำนวน</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.label}>
                  <td>{index + 1}</td>
                  <td>{row.label}</td>
                  <td>{row.value.toLocaleString("th-TH")}</td>
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

        <div className={styles.chartCard}>
          <DistrictPieChart rows={rows} />
        </div>
      </section>
    </main>
  );
}
