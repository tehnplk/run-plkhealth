"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "./upload.module.css";

export function UploadLoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      const result = await signIn("credentials", {
        accessCode: formData.get("accessCode"),
        redirect: false,
      });

      if (result?.error) {
        setError("รหัสผ่านไม่ถูกต้อง");
        return;
      }

      router.replace("/upload");
      router.refresh();
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.loginCard} onSubmit={handleSubmit}>
      <div className={styles.panelHeader}>
        <h2>พื้นที่สำหรับผู้ดูแล</h2>
        <p>กรอกรหัสผ่านเพื่อเข้าสู่หน้าอัปโหลดข้อมูล</p>
      </div>

      <label className={styles.passwordField}>
        <span>รหัสผ่าน</span>
        <input
          name="accessCode"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
        />
      </label>

      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"}
      </button>

      {error ? <p className={styles.error}>{error}</p> : null}
    </form>
  );
}
