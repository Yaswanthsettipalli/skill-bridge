import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyApplications.css";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchMyApplications = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/applications/my-status",
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

  useEffect(() => {
    fetchMyApplications();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="my-applications-container">
      <h2>My Applications</h2>

      {applications.length === 0 ? (
        <p>You haven’t applied to any opportunities yet.</p>
      ) : (
        applications.map((app) => (
          <div key={app._id} className="application-card">
            <h3>{app.opportunity.title}</h3>

            <span className={`status-badge ${app.status.toLowerCase()}`}>
              {app.status}
            </span>

            <p className="date">
              Applied on {new Date(app.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyApplications;
