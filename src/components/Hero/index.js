import styles from './styles.module.css';

export default function Hero({ children, className }) {
  return (
    <div className={`${styles.hero} hero--primary margin-bottom--lg`}>
      <div className="container">
        {children}
      </div>
    </div>
  );
}