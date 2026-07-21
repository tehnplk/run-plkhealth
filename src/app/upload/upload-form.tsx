"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import styles from "./upload.module.css";

type UploadResult = {
  success?: boolean;
  error?: string;
  filename?: string;
  rowCount?: number;
};

const uploadAccessCode = "112233";

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setResult({ error: "กรุณาเลือกไฟล์ .xlsx" });
      return;
    }

    const confirmation = await Swal.fire({
      title: "ยืนยันการนำเข้าข้อมูล",
      text: "กรอกรหัสเพื่อแทนที่ข้อมูลเดิม",
      input: "password",
      inputLabel: "รหัสผ่าน",
      inputPlaceholder: "กรอกรหัส 6 หลัก",
      inputAttributes: {
        inputMode: "numeric",
        autoComplete: "one-time-code",
        maxLength: "6",
      },
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#176da8",
      inputValidator: (value) => {
        if (!value) return "กรุณากรอกรหัส";
        if (value !== uploadAccessCode) return "รหัสไม่ถูกต้อง";
      },
    });

    if (!confirmation.isConfirmed) return;

    setPending(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("accessCode", confirmation.value);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as UploadResult;

      if (!response.ok) {
        setResult({ error: payload.error ?? "ไม่สามารถนำเข้าข้อมูลได้" });
        return;
      }

      setResult(payload);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setResult({ error: "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.uploadCard} onSubmit={handleSubmit}>
      <div className={styles.panelHeader}>
        <h2>อัปโหลดไฟล์ Excel</h2>
        <p>รองรับ .xlsx สูงสุด 20 MB และจะแทนที่ข้อมูลเดิมทั้งหมด</p>
      </div>

      <label className={styles.dropzone} htmlFor="excel-file">
        <span className={styles.fileBadge}>XLSX</span>
        <span className={styles.dropTitle}>
          {file ? file.name : "เลือกไฟล์ Excel"}
        </span>
        <span className={styles.dropHint}>
          {file
            ? `${(file.size / 1024).toLocaleString("th-TH", { maximumFractionDigits: 1 })} KB`
            : "ไฟล์ .xlsx ขนาดไม่เกิน 20 MB"}
        </span>
        <input
          ref={inputRef}
          id="excel-file"
          name="file"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          required
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setResult(null);
          }}
        />
      </label>

      <button className={styles.submit} type="submit" disabled={pending || !file}>
        {pending ? "กำลังตรวจสอบและนำเข้า…" : "นำเข้าข้อมูลใหม่"}
      </button>

      {result?.error ? (
        <p className={styles.error} role="alert">
          {result.error}
        </p>
      ) : null}

      {result?.success ? (
        <div className={styles.success} role="status">
          <div>
            <strong>นำเข้าสำเร็จ</strong>
            <span>
              {result.rowCount?.toLocaleString("th-TH")} รายการ จาก {result.filename}
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
