import React, { useState } from "react";
import {
  createCustomer,
  type NewCustomer,
} from "../../../API/customers/customersApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../common/Modal/Modal";
import styles from "./CreateCustomerModal.module.css";
import Button from "../../common/Button/Button";
import { FaRegUser } from "react-icons/fa";
import { MdCall, MdOutlineEmail } from "react-icons/md";
import toast from "react-hot-toast";

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialNewCustomer = {
  name: "",
  email: null,
  phone: null,
  type: "INDIVIDUAL",
};
function CreateCustomerModal({ isOpen, onClose }: CreateCustomerModalProps) {
  const [newCustomer, setNewCustomer] =
    useState<NewCustomer>(initialNewCustomer);
  const queryClient = useQueryClient();
  const createCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };
  const handleAddCustomer = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (newCustomer.email && !emailRegex.test(newCustomer.email)) {
      toast.error("Invalid email");
      return;
    }
    createCustomerMutation.mutate(newCustomer);
    setNewCustomer(initialNewCustomer);
    onClose();
  };
  return (
    <Modal isOpen={isOpen} padding=".5rem">
      <form onSubmit={handleAddCustomer} className={styles.createWrapper} noValidate>
        <h3>Add a new customer</h3>
        <div className={styles.formWrapper}>
          <div className={styles.formRow}>
            <label htmlFor="name" className={styles.label}>
              <FaRegUser />
            </label>
            <input
              type="text"
              name="name"
              value={newCustomer.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <select
              name="type"
              value={newCustomer.type}
              id="type"
              onChange={handleChange}
              className={styles.customerTypeInput}
            >
              <option value="COMPANY">Company</option>
              <option value="INDIVIDUAL">Individual</option>
            </select>
          </div>
          <div className={styles.formRow}>
            <label htmlFor="phone" className={styles.label}>
              <MdCall />
            </label>
            <input
              type="tel"
              name="phone"
              value={newCustomer.phone ?? ""}
              onChange={handleChange}
              className={styles.input}
              minLength={5}
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="email" className={styles.label}>
              <MdOutlineEmail />
            </label>
            <input
              type="email"
              name="email"
              value={newCustomer.email ?? ""}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.modalActions}>
            <Button label="Cancel" onClick={onClose} />
            <Button type="submit" label="Add" color="#043de7" />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default CreateCustomerModal;
