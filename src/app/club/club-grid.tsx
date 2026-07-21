"use client";

import { useMemo, useState } from "react";
import type { ClubDistrictGroup } from "@/lib/load-club-data";
import styles from "./club.module.css";

type ClubGridProps = {
  activities: string[];
  groups: ClubDistrictGroup[];
};

export function ClubGrid({ activities, groups }: ClubGridProps) {
  const [district, setDistrict] = useState("");
  const visibleGroups = useMemo(
    () => (district ? groups.filter((group) => group.district === district) : groups),
    [district, groups],
  );
  const summary = {
    activityCounts: Object.fromEntries(
      activities.map((activity) => [
        activity,
        visibleGroups.reduce(
          (sum, group) => sum + (group.activityCounts[activity] ?? 0),
          0,
        ),
      ]),
    ),
    registered: visibleGroups.reduce((sum, group) => sum + group.registered, 0),
  };
  const exportHref = district
    ? `/api/export/club?district=${encodeURIComponent(district)}`
    : "/api/export/club";

  return (
    <div className={styles.tableWrap}>
      <div className={styles.tableHeader}>
        <h2>ข้อมูลแยกรายชมรม</h2>
        <div className={styles.tableTools}>
          <label className={styles.srOnly} htmlFor="club-district-filter">
            กรองอำเภอ
          </label>
          <select
            className={styles.districtFilter}
            id="club-district-filter"
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
          >
            <option value="">ทุกอำเภอ</option>
            {groups.map((group) => (
              <option key={group.district} value={group.district}>
                {group.district}
              </option>
            ))}
          </select>
          <a className={styles.exportLink} href={exportHref}>
            ส่งออก Excel
          </a>
        </div>
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
            {visibleGroups.flatMap((group, groupIndex) => [
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
              groupIndex < visibleGroups.length - 1 ? (
                <tr className={styles.districtSpacerRow} key={`${group.district}-spacer`}>
                  <td colSpan={activities.length + 4} aria-label="เว้นวรรคระหว่างอำเภอ" />
                </tr>
              ) : null,
            ])}
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
  );
}
