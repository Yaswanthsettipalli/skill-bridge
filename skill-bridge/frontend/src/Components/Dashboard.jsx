import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [dashboardError, setDashboardError] = useState("");
  const [stats, setStats] = useState({
    activeOpportunities: 0,
    applications: 0,
    activeVolunteers: 0,
    pendingApplications: 0,
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.userType?.trim().toUpperCase();

  /* ================= FETCH DASHBOARD DATA ================= */
  useEffect(() => {
    if (!token || !user) {
      setDashboardError("Please login to access dashboard.");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        /* ---- Fetch Opportunities ---- */
        const oppRes = await axios.get(
          "http://localhost:5000/api/opportunities",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const opportunities = Array.isArray(oppRes.data)
          ? oppRes.data
          : [];

        const activeOpps = opportunities.filter(
          (opp) => opp.status === "OPEN"
        ).length;

        /* ---- Fetch Applications based on role ---- */
        let applications = [];

        if (userRole === "NGO") {
          const appRes = await axios.get(
            "http://localhost:5000/api/applications/ngo",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          applications = appRes.data || [];
        } else {
          const appRes = await axios.get(
            "http://localhost:5000/api/applications/my-status",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          applications = appRes.data || [];
        }

        const pendingApps = applications.filter(
          (app) => app.status === "PENDING"
        ).length;

        setStats({
          activeOpportunities: activeOpps,
          applications: applications.length,
          activeVolunteers:
            userRole === "NGO"
              ? new Set(
                  applications.map((app) => app.volunteer?._id)
                ).size
              : 0,
          pendingApplications: pendingApps,
        });
      } catch (err) {
        console.error(err);
        setDashboardError("Failed to load dashboard data.");
      }
    };

    fetchDashboardData();
  }, [token, userRole]);

  /* ================= UI ================= */
  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="org-name">
          {user?.organizationName || user?.fullName || "User"}
        </h2>
        <p className="org-type">{userRole}</p>

        <nav className="menu">
          <button className="menu-item active">Dashboard</button>

          <button
            className="menu-item"
            onClick={() => navigate("/opportunities")}
          >
            Opportunities
          </button>

          <button
            className="menu-item"
            onClick={() =>
              navigate(
                userRole === "NGO"
                  ? "/ngo/applications"
                  : "/my-applications"
              )
            }
          >
            Applications
          </button>

          <button className="menu-item">Messages</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <h1 className="welcome">
          Welcome {user?.fullName || "User"} 👋
        </h1>

        {dashboardError && (
          <p className="error-msg">{dashboardError}</p>
        )}

        {/* OVERVIEW */}
        <section className="overview">
          <div className="card blue">
            <h2>{stats.activeOpportunities}</h2>
            <p>Active Opportunities</p>
          </div>

          <div className="card green">
            <h2>{stats.applications}</h2>
            <p>Total Applications</p>
          </div>

          <div className="card purple">
            <h2>{stats.activeVolunteers}</h2>
            <p>Active Volunteers</p>
          </div>

          <div className="card yellow">
            <h2>{stats.pendingApplications}</h2>
            <p>Pending Applications</p>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="section">
          <h3>Quick Actions</h3>

          <div className="quick-actions">
            {userRole === "NGO" && (
              <button
                className="action-btn"
                onClick={() => navigate("/create-opportunity")}
              >
                ➕ Create New Opportunity
              </button>
            )}

            <button
              className="action-btn"
              onClick={() =>
                navigate(
                  userRole === "NGO"
                    ? "/ngo/applications"
                    : "/my-applications"
                )
              }
            >
              📄 View Applications
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
