import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Home from "../pages/Home/Home";
import MainLayout from "../layout/MainLayout";
import Login from "../pages/Login/Login";
import AdminPage from "../pages/AdminPage/AdminPage";
import ProtectRoute from "../pages/protectRoute/ProtectRoute";
import AdminBusiness from "../components/AdminBusiness/AdminBusiness"
import AdminCategories from "../components/AdminCategories/AdminCategories";
import AdminBanners from "../components/AdminBanners/AdminBanners";
import ErrorPage from "../pages/ErrorPage/ErrorPage";

export const router = createBrowserRouter([
  { 
    path: "/",
    element: <MainLayout/>,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home/>
      },
      {
        path: "/login",
        element: <Login/>
      },
      {
        path: "/admin",
        element: <ProtectRoute/>
        ,children: [
          {
            element: <AdminPage/>,
            children: [
              {
                index: true,
                element: <Navigate to="business" replace/>
              },
              {
                path: "business",
                element: <AdminBusiness/>
              },
              {
                path: "categories",
                element: <AdminCategories/>
              },
              {
                path: "discounts",
                element: <AdminBanners/>
              }
            ]
          }
        ]
      }
    ]    
  },
  ]);
