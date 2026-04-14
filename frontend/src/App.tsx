import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import { Toaster } from "react-hot-toast";
import Customers from "./pages/Customers/Customers";

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/customers" element={<Customers />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
