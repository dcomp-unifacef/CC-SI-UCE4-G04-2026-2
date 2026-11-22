import { Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "./components/layout/AuthLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import AppLayout from "./components/layout/AppLayout";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import PatientsListPage from "./pages/PatientsListPage";
import PatientFormPage from "./pages/PatientFormPage";
import PatientDetailsPage from "./pages/PatientDetailsPage";
import MessagesListPage from "./pages/MessagesListPage";
import WhatsAppReconnect from "./pages/WhatsAppReconnect";
import MessageTemplateForm from "./pages/MessageTemplateForm";
import MessageDetails from "./pages/MessageDetails";

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
        </Route>
        <Route path="/recuperar-acesso" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/inicio" element={<DashboardPage />} />

          <Route path="/pacientes" element={<PatientsListPage />} />
          <Route path="/pacientes/novo" element={<PatientFormPage />} />
          <Route path="/pacientes/:id" element={<PatientDetailsPage />} />
          <Route path="/pacientes/:id/editar" element={<PatientFormPage />} />

          <Route path="/mensagens" element={<MessagesListPage />} />
          <Route path="/mensagens/reconectar" element={<WhatsAppReconnect />} />
          <Route path="/mensagens/modelos/:id/editar" element={<MessageTemplateForm />} />
          <Route path="/mensagens/:id" element={<MessageDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}

export default App;
