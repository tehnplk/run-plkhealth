import Image from "next/image";
import posterImage from "../../resource/poster2.png";
import { PosterViewport } from "./poster-viewport";
import styles from "./page.module.css";

export default function Home() {
  return (
    <PosterViewport>
      <section
        className={styles.poster}
        aria-label="โปสเตอร์เชิญชวนเข้าร่วมกิจกรรม เดิน วิ่ง ปั่น ป้องกันอัมพาต ครั้งที่ 12"
      >
        <Image
          className={styles.posterImage}
          src={posterImage}
          alt="โปสเตอร์เชิญชวนเข้าร่วมกิจกรรม เดิน วิ่ง ปั่น ป้องกันอัมพาต ครั้งที่ 12 จังหวัดพิษณุโลก"
          fill
          priority
          sizes="(max-width: 1414px) 100vw, 1414px"
          quality={100}
        />
      </section>
    </PosterViewport>
  );
}
