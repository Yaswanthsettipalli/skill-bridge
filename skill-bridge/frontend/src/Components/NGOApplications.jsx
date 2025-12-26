import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NGOApplications.css";

const NGOApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/applications/ngo",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplications(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load applications");
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchApplications();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="ngo-applications-container">
      <h2>Applications Received</h2>

      {applications.length === 0 ? (
        <p>No applications received yet.</p>
      ) : (
        applications.map((app) => (
          <div key={app._id} className="ngo-app-card">
            <h3>{app.opportunity.title}</h3>

            <p><strong>Volunteer:</strong> {app.volunteer.fullName}</p>
            <p><strong>Email:</strong> {app.volunteer.email}</p>

            <p><strong>Motivation:</strong> {app.motivation}</p>
            <p><strong>Availability:</strong> {app.availability}</p>
            <p><strong>Skills:</strong> {app.skills || "N/A"}</p>

            <span className={`status-badge ${app.status.toLowerCase()}`}>
              {app.status}
            </span>

            {app.status === "PENDING" && (
              <div className="actions">
                <button
                  className="btn-accept"
                  onClick={() => updateStatus(app._id, "ACCEPTED")}
                >
                  Accept
                </button>
                <button
                  className="btn-reject"
                  onClick={() => updateStatus(app._id, "REJECTED")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default NGOApplications;
