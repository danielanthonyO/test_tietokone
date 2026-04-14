import React from "react";
import styles from "./Modal.module.css";
import { motion } from "motion/react";

interface ModalProps {
  title?: string;
  isOpen: boolean;
  children: React.ReactNode;
  background?: string;
  padding?: string;
}

function Modal({ title, background, isOpen, children, padding }: ModalProps) {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={styles.overlay}
    >
      <div
        className={styles.modal}
        style={{ backgroundColor: background, padding: padding }}
      >
        {title && <h3 className={styles.title}>{title}</h3>}
        {children}
      </div>
    </motion.div>
  );
}

export default Modal;
