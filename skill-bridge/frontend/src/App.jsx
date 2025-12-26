import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./Components/NavBar";
import Hero from "./Components/Hero";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import AccountSettings from "./Components/Accountsettings";
import CreateOpportunity from "./Components/CreateOpportunity";
import Opportunities from "./Components/Opportunities";
import ApplicationForm from "./Components/ApplicationForm";
import MyApplications from "./Components/MyApplications";          // ✅ ADD
import NGOApplications from "./Components/NGOApplications";        // ✅ ADD

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user"));
  });

  /* ================= KEEP USER IN SYNC ================= */
  useEffect(() => {
    const handleStorageChange = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      setCurrentUser(user);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /* ================= PROTECTED ROUTE ================= */
  const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  /* ================= NGO ONLY ROUTE ================= */
  const NGORoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.userType?.trim().toUpperCase();

    if (role !== "NGO") {
      alert("Access Denied: NGO users only.");
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <>
      <NavBar user={currentUser} />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Hero />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* OPPORTUNITIES (ALL USERS) */}
        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          }
        />

        {/* APPLY FORM (VOLUNTEER) */}
        <Route
          path="/apply/:id"
          element={
            <ProtectedRoute>
              <ApplicationForm />
            </ProtectedRoute>
          }
        />

        {/* VOLUNTEER: MY APPLICATIONS */}
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          }
        />

        {/* NGO: VIEW APPLICATIONS */}
        <Route
          path="/ngo/applications"
          element={
            <ProtectedRoute>
              <NGORoute>
                <NGOApplications />
              </NGORoute>
            </ProtectedRoute>
          }
        />

        {/* NGO: CREATE OPPORTUNITY */}
        <Route
          path="/create-opportunity"
          element={
            <ProtectedRoute>
              <NGORoute>
                <CreateOpportunity />
              </NGORoute>
            </ProtectedRoute>
          }
        />

        {/* ACCOUNT SETTINGS */}
        <Route
          path="/account-settings"
          element={
            <ProtectedRoute>
              <AccountSettings onUserUpdate={setCurrentUser} />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
