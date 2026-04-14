import React, { useState } from "react";
import styles from "../CustomerCard/CustomerCard.module.css";
import { MdCall } from "react-icons/md";
import { MdOutlineEmail } from "react-icons/md";
import Button from "../../common/Button/Button";
import {
  updateCustomer,
  type Customer,
} from "../../../API/customers/customersApi";
import _ from "lodash";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { FaRegUser } from "react-icons/fa";

interface EditCustomerFormProps {
  customer: Customer;
  onClose: () => void;
}

function EditCustomerForm({ customer, onClose }: EditCustomerFormProps) {
  const [editedCustomer, setEditedCustomer] = useState<Customer>(customer);

  const queryClient = useQueryClient();
  const updateCustomerMutation = useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      onClose();
      toast.success("Update saved");
    },
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditedCustomer((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleCancel = () => {
    setEditedCustomer(customer);
    onClose();
  };
  const isSaveDisable =
    _.isEqual(editedCustomer, customer) || !editedCustomer.name;

  const handleSave = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (editedCustomer.email && !emailRegex.test(editedCustomer.email)) {
      toast.error("Invalid email");
      return;
    }
    updateCustomerMutation.mutate(editedCustomer);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.editMode}
    >
      <form onSubmit={handleSave} className={styles.formWrapper}>
        <div className={styles.formRow}>
          <label htmlFor="name" className={styles.label}>
            <FaRegUser />
          </label>
          <input
            value={editedCustomer.name}
            name="name"
            onChange={handleChange}
            className={styles.input}
          />{" "}
          <select
            name="type"
            value={editedCustomer.type}
            id="type"
            onChange={handleChange}
            className={styles.customerTypeInput}
          >
            <option value="INDIVIDUAL">Individual</option>
            <option value="COMPANY">Company</option>
          </select>
        </div>

        <div className={styles.formRow}>
          <label htmlFor="phone" className={styles.label}>
            <MdCall />
          </label>
          <input
            type="tel"
            minLength={5}
            value={editedCustomer.phone ?? ""}
            name="phone"
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="email" className={styles.label}>
            <MdOutlineEmail />
          </label>
          <input
            type="email"
            value={editedCustomer.email ?? ""}
            name="email"
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.editActions}>
          <Button label="Cancel" onClick={handleCancel} />
          <Button
            label="Save"
            type="submit"
            isDisabled={isSaveDisable || updateCustomerMutation.isPending}
          />
        </div>
      </form>
    </motion.div>
  );
}

export default EditCustomerForm;
