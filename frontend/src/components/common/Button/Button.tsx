import React from "react";
import styles from "./Button.module.css";

interface ButtonProps {
  type?: "button" | "submit";
  icon?: React.ReactNode;
  label?: string | React.ReactNode;
  color?: string;
  background?: string;
  onClick?: () => void;
  isDisabled?: boolean;
}

function Button({
  type = "button",
  icon,
  label,
  color = "#000",
  background,
  onClick,
  isDisabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={styles.btn}
      onClick={onClick}
      style={{ color: color, background: background }}
      disabled={isDisabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {label && <span className={styles.label}>{label}</span>}
    </button>
  );
}

export default Button;
