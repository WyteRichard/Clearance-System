import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword"
import VerifyOTP from "./pages/VerifyOTP";
import StudentDashboard from "./pages/StudentDashboard";
import RequestClearance from "./pages/RequestClearance";
import StudentClearanceStatus from "./pages/StudentClearanceStatus";
import StudentAccount from "./pages/StudentAccount";
import DepartmentClearanceRequest from "./pages/Department/SSCClearanceRequest";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDeptAccounts from "./pages/AdminDeptAccounts";
import AdminStudentAccounts from "./pages/AdminStudentAccounts";
import AdminAnnouncement from "./pages/AdminAnnouncement";

import AdviserClearanceRequest from "./pages/Department/AdviserClearanceRequest";
import CashierClearanceRequest from "./pages/Department/CashierClearanceRequest";
import ClinicClearanceRequest from "./pages/Department/ClinicClearanceRequest";
import ClusterCoordinatorClearanceRequest from "./pages/Department/ClusterCoordinatorClearanceRequest";
import DeanClearanceRequest from "./pages/Department/DeanClearanceRequest";
import GuidanceClearanceRequest from "./pages/Department/GuidanceClearanceRequest";
import LaboratoryClearanceRequest from "./pages/Department/LaboratoryClearanceRequest";
import LibraryClearanceRequest from "./pages/Department/LibraryClearanceRequest";
import RegistrarClearanceRequest from "./pages/Department/RegistrarClearanceRequest";
import SpiritualAffairsClearanceRequest from "./pages/Department/SpiritualAffairsClearanceRequest";
import StudentAffairsClearanceRequest from "./pages/Department/StudentAffairsClearanceRequest";
import StudentDisciplineClearanceRequest from "./pages/Department/StudentDisciplineClearanceRequest";

import AdviserDashboard from "./pages/Dashboard/AdviserDashboard";
import CashierDashboard from "./pages/Dashboard/CashierDashboard";
import ClinicDashboard from "./pages/Dashboard/ClinicDashboard";
import ClusterCoordinatorDashboard from "./pages/Dashboard/ClusterCoordinatorDashboard";
import DeanDashboard from "./pages/Dashboard/DeanDashboard";
import GuidanceDashboard from "./pages/Dashboard/GuidanceDashboard";
import LaboratoryDashboard from "./pages/Dashboard/LaboratoryDashboard";
import LibraryDashboard from "./pages/Dashboard/LibraryDashboard";
import RegistrarDashboard from "./pages/Dashboard/RegistrarDashboard";
import SpiritualAffairsDashboard from "./pages/Dashboard/SpiritualAffairsDashboard";
import StudentAffairsDashboard from "./pages/Dashboard/StudentAffairsDashboard";
import StudentDisciplineDashboard from "./pages/Dashboard/StudentDisciplineDashboard";
import SSCDashboard from "./pages/Dashboard/SSCDashboard"


const App = () => {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/create-account" element={<CreateAccount/>} />
              <Route path="/forgot-password" element={<ForgotPassword/>} />
              <Route path="/verify-otp" element={<VerifyOTP/>} />

              <Route path="/student-dashboard" element={<StudentDashboard/>} />
              <Route path="/request-clearance" element={<RequestClearance/>} />
              <Route path="/student-clearance-status" element={<StudentClearanceStatus/>} />
              <Route path="/student-account" element={<StudentAccount/>} />


              <Route path="/adviser-dashboard" element={<AdviserDashboard/>} />
              <Route path="/cashier-dashboard" element={<CashierDashboard/>} />
              <Route path="/clinic-dashboard" element={<ClinicDashboard/>} />
              <Route path="/cluster-dashboard" element={<ClusterCoordinatorDashboard/>} />
              <Route path="/dean-dashboard" element={<DeanDashboard/>} />
              <Route path="/guidance-dashboard" element={<GuidanceDashboard/>} />
              <Route path="/laboratory-dashboard" element={<LaboratoryDashboard/>} />
              <Route path="/library-dashboard" element={<LibraryDashboard/>} />
              <Route path="/registrar-dashboard" element={<RegistrarDashboard/>} />
              <Route path="/spiritual-dashboard" element={<SpiritualAffairsDashboard/>} />
              <Route path="/student-affairs-dashboard" element={<StudentAffairsDashboard/>} />
              <Route path="/discipline-dashboard" element={<StudentDisciplineDashboard/>} />
              <Route path="/ssc-dashboard" element={<SSCDashboard/>} />


              <Route path="/adviser-clearance-request" element={<AdviserClearanceRequest/>} />
              <Route path="/cashier-clearance-request" element={<CashierClearanceRequest/>} />
              <Route path="/clinic-clearance-request" element={<ClinicClearanceRequest/>} />
              <Route path="/cluster-clearance-request" element={<ClusterCoordinatorClearanceRequest/>} />
              <Route path="/dean-clearance-request" element={<DeanClearanceRequest/>} />
              <Route path="/guidance-clearance-request" element={<GuidanceClearanceRequest/>} />
              <Route path="/laboratory-clearance-request" element={<LaboratoryClearanceRequest/>} />
              <Route path="/library-clearance-request" element={<LibraryClearanceRequest/>} />
              <Route path="/registrar-clearance-request" element={<RegistrarClearanceRequest/>} />
              <Route path="/spiritual-clearance-request" element={<SpiritualAffairsClearanceRequest/>} />
              <Route path="/student-affairs-clearance-request" element={<StudentAffairsClearanceRequest/>} />
              <Route path="/discipline-clearance-request" element={<StudentDisciplineClearanceRequest/>} />
              <Route path="/ssc-clearance-request" element={<DepartmentClearanceRequest/>} />


              <Route path="/admin-dashboard" element={<AdminDashboard/>} />
              <Route path="/admin-dept-accounts" element={<AdminDeptAccounts/>} />
              <Route path="/admin-student-accounts" element={<AdminStudentAccounts/>} />
              <Route path="/admin-announcements" element={<AdminAnnouncement/>} />

              <Route path="*" element={<Navigate to="/" />} />
          </Routes>
      </Router>
  );
};

export default App;
