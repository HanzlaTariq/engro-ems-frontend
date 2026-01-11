import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// User Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/AttendanceForm";
import AttendanceList from "./pages/AttendanceList";
import SafetyTalkWithLabour from "./pages/SafetyTalkWithLabours";
import SafetyTalkList from "./pages/SafetyTalkWithLaboursList";
import SafetyTalkRecordWithTrucker from "./pages/SafetyTalkRecordWithTrucker";
import SafetyTalkTruckerList from "./pages/SafetyTalkRecordWithTruckerList";
import EmptyBagRecord from "./pages/EmptyBagRecord";
import EmptyBagList from "./pages/EmptyBagList";
import WeeklySpotCheckForm from "./pages/WeeklySpotCheckForm";
import WeeklySpotCheckList from "./pages/WeeklySpotCheckList";
import PreNumberStationaryRecordForm from "./pages/prenumberstationaryrecordform";
import PreNumberStationaryRecordList from "./pages/prenumberstationaryrecordlist";
import QuarterlySpotCheckForm from "./pages/QuarterlySpotCheckForm";
import QuarterlySpotCheckList from "./pages/QuarterlySpotCheckList";


// Admin Pages
import AdminLogin from "./admin/AdminLogin";
import DashboardAdmin from "./admin/Dashboard";
import ManageWarehouses from "./admin/ManageWarehouses";
import User from "./admin/User";
import ManageEmptyBagRecords from "./admin/ManageEmptyBagRecords";
import ManagePreStationaryRecord from "./admin/managePreStationaryRecord";
import WeeklyReports from "./admin/ManageWeeklySpotCheck";
import QuarterlyReports from "./admin/ManageQuarterlySpotCheck";

// Route Guards
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ----------------- User Routes ----------------- */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance-list"
          element={
            <ProtectedRoute>
              <AttendanceList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety-talk"
          element={
            <ProtectedRoute>
              <SafetyTalkWithLabour />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety-talk-list"
          element={
            <ProtectedRoute>
              <SafetyTalkList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety-talk-trucker"
          element={
            <ProtectedRoute>
              <SafetyTalkRecordWithTrucker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety-talk-trucker-list"
          element={
            <ProtectedRoute>
              <SafetyTalkTruckerList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/empty-bag-record"
          element={
            <ProtectedRoute>
              <EmptyBagRecord />
            </ProtectedRoute>
          }
        />
        <Route
          path="/empty-bag-list"
          element={
            <ProtectedRoute>
              <EmptyBagList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weekly-spot-check"
          element={
            <ProtectedRoute>
              <WeeklySpotCheckForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weekly-spot-check-list"
          element={
            <ProtectedRoute>
              <WeeklySpotCheckList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quarterly-spot-check"
          element={
            <ProtectedRoute>
              <QuarterlySpotCheckForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quarterly-spot-check-list"
          element={
            <ProtectedRoute>
              <QuarterlySpotCheckList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pre-number-stationary-record"
          element={
            <ProtectedRoute>
              <PreNumberStationaryRecordForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pre-number-stationary-record-list"
          element={
            <ProtectedRoute>
              <PreNumberStationaryRecordList />
            </ProtectedRoute>
          }
        />

        {/* ----------------- Admin Routes ----------------- */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <DashboardAdmin />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-warehouses"
          element={
            <AdminProtectedRoute>
              <ManageWarehouses />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <User />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-empty-bags"
          element={
            <AdminProtectedRoute>
              <ManageEmptyBagRecords />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-pre-stationary-record"
          element={
            <AdminProtectedRoute>
              <ManagePreStationaryRecord />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/weekly-reports"
          element={
            <AdminProtectedRoute>
              <WeeklyReports />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/quarterly-reports"
          element={
            <AdminProtectedRoute>
              <QuarterlyReports />
            </AdminProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
