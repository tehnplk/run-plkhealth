import Link from "next/link";
import { getUploadHistory } from "@/lib/database";
import { UploadForm } from "./upload-form";
import styles from "./upload.module.css";

export const dynamic = "force-dynamic";

function formatUploadedAt(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export default function UploadPage() {
  const uploadHistory = getUploadHistory();

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <h1>อัปโหลดข้อมูล</h1>
          <Link className={styles.posterLink} href="/">
            กลับหน้าโปสเตอร์
          </Link>
        </header>

        <div className={styles.grid}>
          <UploadForm />

          <section className={styles.historyCard} aria-labelledby="upload-history-title">
            <div className={styles.historyHeader}>
              <h2 id="upload-history-title">ประวัติอัปโหลด</h2>
              <span>{uploadHistory.length.toLocaleString("th-TH")} ครั้ง</span>
            </div>

            <div className={styles.historyTableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>ไฟล์</th>
                    <th>จำนวนข้อมูล</th>
                    <th>วันเวลาอัปโหลด</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadHistory.length > 0 ? (
                    uploadHistory.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.filename}</td>
                        <td>{entry.rowCount.toLocaleString("th-TH")}</td>
                        <td>
                          <time dateTime={entry.uploadedAt}>
                            {formatUploadedAt(entry.uploadedAt)}
                          </time>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className={styles.emptyHistory} colSpan={3}>
                        ยังไม่มีประวัติอัปโหลด
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
