import { queryOptions } from "@tanstack/react-query";
import { fetchCustomer, fetchCustomers } from "./customersApi";

export const customersQueryOptions = () => {
  return queryOptions({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });
};

export const customerQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ["customer", id],
    queryFn: () => fetchCustomer(id),
  });
};
