import React from "react";
import styles from "./Spinner.module.css";

interface SpinnerProps {
  color?: string;
  size?: "small" | "medium" | "large";
}

function Spinner({ color = "#0033ff", size = "medium" }: SpinnerProps) {
  return (
    <div
      className={`${styles.loadingSpinner} ${styles[`loadingSpinner-${size}`]} `}
      style={{ borderTopColor: color }}
    />
  );
}

export default Spinner;
