import { createBrowserRouter } from "react-router-dom";
import ProductList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";
import SupplierLogin from "./pages/SupplierLogin";
import AdminLogin from "./pages/AdminLogin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProductList />,
  },
  {
    path: "/add-product",
    element: <ProductForm />,
  },
  {
    path: "/supplier-login",
    element: <SupplierLogin />,
  },
  {
    path: "/admin-login",
    element: <AdminLogin />,
  },
]);

export default router;