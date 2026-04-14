import axios from "axios";
import { API } from "../api";

const orderApi = API.orders;

export interface Order {
  id: string;
  device_id: string;
  customer_id: string;
  status?: string;
  scheduled_date?: string;
  technician_id: 2;
  created_at?: string;
  updated_at?: string;
  notes?: string;
}

export const fetchOrders = async (): Promise<Order[]> => {
  const res = await axios.get(orderApi);
  return res.data;
};

export const fetchOrder = async (id: string): Promise<Order> => {
  const res = await axios.get(`${orderApi}/${id}`);
  return res.data;
};
