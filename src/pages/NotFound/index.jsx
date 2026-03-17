/* ─────────────────────────────────────────
   pages/NotFound/index.jsx
───────────────────────────────────────── */
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <div className={styles.code}>404</div>
      <h2 className={styles.title}>페이지를 찾을 수 없습니다</h2>
      <p className={styles.desc}>요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link to="/"><Button>홈으로 돌아가기</Button></Link>
    </div>
  );
}
