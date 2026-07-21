import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BackHomeLink } from "@/components/report-navigation";
import { UploadLoginForm } from "../login-form";
import styles from "../upload.module.css";

export default async function UploadLoginPage() {
  if (await auth()) redirect("/upload");

  return (
    <main className={styles.page}>
      <BackHomeLink />
      <section className={styles.loginShell}>
        <UploadLoginForm />
      </section>
    </main>
  );
}
