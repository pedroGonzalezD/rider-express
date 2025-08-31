import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import {router} from "./router";
import { BusinessProvider } from './context/BusinessContext';
import { AuthProvider } from './context/AuthContext';
import { LoaderProvider } from './context/LoaderContext';
import "./i18n";
import 'leaflet/dist/leaflet.css';
import "./styles/index.scss"


createRoot(document.getElementById('root')).render(
  <LoaderProvider>
    <StrictMode>
      <AuthProvider>
        <BusinessProvider>
          <RouterProvider router={router} />
        </BusinessProvider>
      </AuthProvider>
    </StrictMode>
  </LoaderProvider>
)
