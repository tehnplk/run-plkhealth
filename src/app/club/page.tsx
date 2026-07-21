import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { loadClubData } from "@/lib/load-club-data";
import { ExcelExportLink } from "@/components/excel-export-link";
import styles from "./club.module.css";

export const dynamic = "force-dynamic";

export default function ClubPage() {
  const { activities, groups } = loadClubData();
  const summary = {
    activityCounts: Object.fromEntries(
      activities.map((activity) => [
        activity,
        groups.reduce((sum, group) => sum + (group.activityCounts[activity] ?? 0), 0),
      ]),
    ),
    registered: groups.reduce((sum, group) => sum + group.registered, 0),
  };

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
            <h2>ข้อมูลแยกรายชมรม</h2>
            <ExcelExportLink className={styles.exportLink} report="club" />
          </div>
          <div className={styles.tableScroll}>
            <table>
              <thead>
                <tr>
                  <th rowSpan={2}>ลำดับ</th>
                  <th rowSpan={2}>อำเภอ</th>
                  <th rowSpan={2}>ชมรม</th>
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
                {groups.flatMap((group, groupIndex) => {
                  return [
                    ...group.rows.map((row, index) => (
                      <tr key={`${row.district}-${row.label}`}>
                        <td>{index + 1}</td>
                        <td>{row.district}</td>
                        <td>{row.label}</td>
                        {activities.map((activity) => (
                          <td key={activity}>
                            {(row.activityCounts[activity] ?? 0).toLocaleString("th-TH")}
                          </td>
                        ))}
                        <td>{row.registered.toLocaleString("th-TH")}</td>
                      </tr>
                    )),
                    <tr className={styles.districtTotalRow} key={`${group.district}-total`}>
                      <td aria-hidden="true"></td>
                      <td colSpan={2}>{group.district} รวม</td>
                      {activities.map((activity) => (
                        <td key={activity}>
                          {(group.activityCounts[activity] ?? 0).toLocaleString("th-TH")}
                        </td>
                      ))}
                      <td>{group.registered.toLocaleString("th-TH")}</td>
                    </tr>,
                    groupIndex < groups.length - 1 ? (
                      <tr className={styles.districtSpacerRow} key={`${group.district}-spacer`}>
                        <td colSpan={activities.length + 4} aria-label="เว้นวรรคระหว่างอำเภอ" />
                      </tr>
                    ) : null,
                  ];
                })}
                <tr className={styles.totalRow}>
                  <td aria-hidden="true"></td>
                  <td colSpan={2}>รวม</td>
                  {activities.map((activity) => (
                    <td key={activity}>
                      {(summary.activityCounts[activity] ?? 0).toLocaleString("th-TH")}
                    </td>
                  ))}
                  <td>{summary.registered.toLocaleString("th-TH")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </section>
    </main>
  );
}
