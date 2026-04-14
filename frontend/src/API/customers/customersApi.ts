import axios from "axios";
import { API } from "../api";

const customerApi = API.customers;

export interface Customer {
  id: string;
  name: string;
  type: string;
  phone?: string | null;
  email?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
export type NewCustomer = Omit<Customer, "id" | "createdAt" | "updatedAt">;

export type UpdateCustomer = Omit<Customer, "createdAt" | "updatedAt"> & {
  password?: string;
};

export const fetchCustomers = async (): Promise<Customer[]> => {
  const res = await axios.get(customerApi);
  return res.data;
};

export const fetchCustomer = async (id: string): Promise<Customer> => {
  const res = await axios.get(`${customerApi}/${id}`);
  return res.data;
};

export const createCustomer = async (
  newCustomer: NewCustomer,
): Promise<Customer> => {
  const res = await axios.post(customerApi, newCustomer).catch((err) => {
    console.log("POST error response:", err.response?.data);
    throw err;
  });
  return res.data;
};

export const updateCustomer = async (
  updatedCustomer: UpdateCustomer,
): Promise<Customer> => {
  const { id, createdAt, updatedAt, ...body } = updatedCustomer;
  console.log("PATCH body:", body);
  const res = await axios.patch(`${customerApi}/${id}`, body).catch((err) => {
    console.log("POST error response:", err.response?.data);
    throw err;
  });
  return res.data;
};

export const deleteCustomer = async (id: string): Promise<string> => {
  await axios.delete(`${customerApi}/${id}`);
  return id;
};
