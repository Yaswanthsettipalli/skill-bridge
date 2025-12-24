import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./Components/NavBar";
import Hero from "./Components/Hero";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import AccountSettings from "./Components/AccountSettings";
import CreateOpportunity from "./Components/CreateOpportunity";
import Opportunities from "./Components/Opportunities";
import ApplyOpportunity from "./Components/ApplyOpportunity";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user"));
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      setCurrentUser(user);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <NavBar user={currentUser} />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Create Opportunity Route – Standalone Page */}
        <Route
          path="/create-opportunity"
          element={
            <ProtectedRoute>
              <CreateOpportunity />
            </ProtectedRoute>
          }
        />

        {/* Other Routes */}
        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          }
        />

        <Route
          path="/apply/:id"
          element={
            <ProtectedRoute>
              <ApplyOpportunity />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account-settings"
          element={
            <ProtectedRoute>
              <AccountSettings onUserUpdate={setCurrentUser} />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
