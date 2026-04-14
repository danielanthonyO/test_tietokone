import React, { useState } from "react";
import styles from "./Customers.module.css";
import Spinner from "../../components/common/Spinner/Spinner";
import { useQuery } from "@tanstack/react-query";

import CustomerCard from "../../components/customers/CustomerCard/CustomerCard";
import Button from "../../components/common/Button/Button";
import CreateCustomerModal from "../../components/customers/CreateCustomerModal/CreateCustomerModal";
import { customersQueryOptions } from "../../API/customers/customersQueries";

function Customers() {
  const {
    data: customers,
    error,
    isPending,
  } = useQuery(customersQueryOptions());
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(
    null,
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredCustomers =
    customers?.filter((customer) => {
      const search = searchText.toLowerCase();
      const matchedSearch =
        customer.name.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.phone?.toLowerCase().includes(search) ||
        customer.type?.toLowerCase().includes(search);
      return matchedSearch;
    }) || [];

  if (isPending) return <Spinner />;
  if (error) return <p>{error.message}</p>;
  return (
    <div className={styles.customersContainer}>
      <h3>Customer</h3>
      <div className={styles.searchAndCreate}>
        <input
          type="text"
          value={searchText}
          placeholder="🔍 Search customer name, email,..."
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <div className={styles.createBtn}>
          <Button
            label="Create New Customer"
            onClick={() => {
              setIsCreateModalOpen(true);
              setEditingId(null);
              setExpandedCustomerId(null);
            }}
          />
        </div>
        <CreateCustomerModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>

      {/* --------Customer list------- */}
      {filteredCustomers.length == 0 && <p>No customers found</p>}
      {filteredCustomers.length !== 0 &&
        filteredCustomers.map((customer) => (
          <CustomerCard
            customer={customer}
            key={customer.id}
            isExpanded={expandedCustomerId === customer.id}
            onExpand={() => {
              setExpandedCustomerId((prev) =>
                prev === customer.id ? null : customer.id,
              );
              setEditingId(null);
            }} //allow only one card expand at a time
            isEditing={editingId === customer.id}
            onEdit={() => {
              setEditingId(customer.id);
            }}
            onCloseEdit={() => setEditingId(null)}
          />
        ))}
    </div>
  );
}

export default Customers;
