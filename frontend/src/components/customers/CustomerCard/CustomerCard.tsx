import { useState } from "react";
import styles from "./CustomerCard.module.css";
import { motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaRegEdit } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";

import Modal from "../../common/Modal/Modal.tsx";
import { MdCall } from "react-icons/md";
import { MdOutlineEmail } from "react-icons/md";
import toast from "react-hot-toast";
import {
  deleteCustomer,
  type Customer,
} from "../../../API/customers/customersApi.ts";
import { ordersQueryOptions } from "../../../api/orders/ordersQueries.ts";
import { Link } from "react-router";
import EditCustomerForm from "./EditCustomerForm.tsx";
import Button from "../../common/Button/Button.tsx";

interface CustomerCardProps {
  customer: Customer;
  isExpanded: boolean;
  onExpand: () => void;
  isEditing: boolean;
  onEdit: () => void;
  onCloseEdit: () => void;
}

function CustomerCard({
  customer,
  isExpanded,
  onExpand,
  isEditing,
  onEdit,
  onCloseEdit,
}: CustomerCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const { data: orders } = useQuery(ordersQueryOptions());
  const queryClient = useQueryClient();
  const deleteCustomerMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsDeleteModalOpen(false);
      toast.success("Customer deleted.");
    },
  });

  const handleDelete = () => {
    deleteCustomerMutation.mutate(customer.id);
  };
  const filteredOrders =
    orders?.filter((order) => order.customer_id === customer.id) || [];
  return (
    <>
      {!isEditing && (
        <div className={styles.customerCard}>
          <div className={styles.cardHeader} onClick={onExpand}>
            <div className={styles.cardHeaderContent}>
              <p className={styles.name}>{customer.name}</p>

              {customer.type === "COMPANY" && (
                <p className={styles.type}>{customer.type}</p>
              )}
            </div>
          </div>
          {/* Customer detail and buttons */}
          {isExpanded && (
            <motion.div layout>
              <div className={styles.extraInfo}>
                <div className={styles.formRow}>
                  <label htmlFor="phone" className={styles.label}>
                    <MdCall />
                  </label>
                  <p>{customer.phone}</p>
                </div>
                <div className={styles.formRow}>
                  <label htmlFor="email" className={styles.label}>
                    <MdOutlineEmail />
                  </label>
                  <p>{customer.email}</p>
                </div>
                <div className={styles.formRow}>
                  <label htmlFor="orders">Orders: </label>
                  <div className={styles.orders}>
                    {filteredOrders.length !== 0 &&
                      filteredOrders.map((order) => (
                        <Link
                          to={`/orders/${order.id}`}
                          className={styles.orderLink}
                          style={{
                            background:
                              order.status === "pending"
                                ? "#ffff8f"
                                : order.status === "in_progress"
                                  ? "#e8eeff"
                                  : order.status === "completed"
                                    ? "#abfdab"
                                    : "",
                          }}
                        >
                          {order.id}
                        </Link>
                      ))}
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <Button label="Edit" icon={<FaRegEdit />} onClick={onEdit} />

                <Button
                  label="Delete"
                  icon={<FaRegTrashAlt />}
                  onClick={() => setIsDeleteModalOpen(true)}
                />
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Edit customer form*/}
      {isEditing && (
        <EditCustomerForm customer={customer} onClose={onCloseEdit} />
      )}

      {/* Delete modal */}

      <Modal title="Delete Customer" isOpen={isDeleteModalOpen}>
        <p>Delete this customer from the system?</p>
        <div className={styles.deleteActions}>
          <Button label="Cancel" onClick={() => setIsDeleteModalOpen(false)} />
          <Button
            label="Delete"
            onClick={handleDelete}
            isDisabled={deleteCustomerMutation.isPending}
          />
        </div>
      </Modal>
    </>
  );
}

export default CustomerCard;
