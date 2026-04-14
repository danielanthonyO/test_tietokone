import { queryOptions } from "@tanstack/react-query";
import { fetchOrder, fetchOrders } from "./ordersApi";

export const ordersQueryOptions = () => {
  return queryOptions({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });
};

export const orderQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
  });
};
