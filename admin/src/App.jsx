import { Navigate, Route, Routes } from "react-router-dom";

import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddEditProduct from "./pages/AddEditProduct";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import Coupons from "./pages/Coupons";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<AddEditProduct />} />
          <Route path="/products/:id/edit" element={<AddEditProduct />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/users" element={<Users />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/coupons" element={<Coupons />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
