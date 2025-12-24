import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import OpportunityCard from "./OpportunityCard";
import OpportunityModal from "./OpportunityModal";
import FilterBar from "./FilterBar";
import { useNavigate } from "react-router-dom";
import "./Opportunities.css";

const Opportunities = () => {
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [appliedOpportunities, setAppliedOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyError, setApplyError] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  /* ================= TOKEN VALIDATION ================= */
  const isValidToken = (token) => {
    return token && token !== "undefined" && token !== "null";
  };

  // ✅ Wrapped in useCallback to satisfy ESLint
  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!isValidToken(token)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/opportunities",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const cleanData = Array.isArray(res.data)
        ? res.data.filter((opp) => opp && opp._id)
        : [];

      cleanData.forEach((opp) => {
        if (opp.status) opp.status = opp.status.toUpperCase();
      });

      setAllOpportunities(cleanData);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
      setError("Failed to fetch opportunities.");
      setLoading(false);
    }
  }, [token, navigate]);

  /* ================= FETCH APPLIED OPPORTUNITIES ================= */
  const fetchAppliedOpportunities = async () => {
    try {
      if (!isValidToken(token)) return;

      const res = await axios.get(
        "http://localhost:5000/api/applications/my",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // backend returns array of opportunity IDs
      setAppliedOpportunities(res.data);
    } catch (err) {
      console.error("Failed to fetch applied opportunities");
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchAppliedOpportunities();
  }, [token]);

  const filteredOpportunities = allOpportunities.filter((opp) => {
    if (!opp || !opp.status) return false;
    if (filter === "ALL") return true;
    return opp.status === filter;
  });

  /* ================= APPLY (REDIRECT TO FORM) ================= */
  const handleApply = (opp) => {
    setApplyError("");

    const creatorId = opp.createdBy?._id || opp.createdBy;

    if (opp.status === "CLOSED") {
      setApplyError("This opportunity is closed.");
      return;
    }

    if (user?.userType === "NGO" && user?._id === creatorId) {
      setApplyError("You cannot apply to your own opportunity.");
      return;
    }

    navigate(`/apply/${opp._id}`);
  };

  const handleDelete = async (id) => {
    const opp = allOpportunities.find((o) => o._id === id);
    if (!opp) return;

    const creatorId = opp.createdBy?._id || opp.createdBy;

    if (user?._id !== creatorId) {
      alert("You are not authorized to delete this opportunity.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this opportunity?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/opportunities/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOpportunities();
    } catch (err) {
      alert("Failed to delete opportunity.");
    }
  };

  return (
    <div className="opportunities-container">
      <div className="opportunities-header">
        <div>
          <h2>Opportunities</h2>
          <p className="subtitle">Explore and manage volunteering opportunities</p>
        </div>

        {user?.userType === "NGO" && (
          <button
            className="btn-create-opportunity"
            onClick={() => navigate("/create-opportunity")}
          >
            + Create New Opportunity
          </button>
        )}
      </div>

      <div className="opportunities-filter-row">
        <FilterBar filter={filter} setFilter={setFilter} />
      </div>

      {applyError && <p className="error-text">{applyError}</p>}
      {error && <p className="error-text">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading &&
        filteredOpportunities.map((opp) => {
          const creatorId = opp.createdBy?._id || opp.createdBy;
          const isOwner = user?.userType === "NGO" && user?._id === creatorId;

          const isApplied = appliedOpportunities.includes(opp._id);

          return (
            <OpportunityCard
              key={opp._id}
              opportunity={opp}
              isOwner={isOwner}
              isApplied={isApplied}
              onView={() => {
                setSelectedOpportunity(opp);
                setIsEditMode(false);
              }}
              onApply={handleApply}
              onEdit={() => {
                setSelectedOpportunity(opp);
                setIsEditMode(true);
              }}
              onDelete={handleDelete}
            />
          );
        })}

      {selectedOpportunity && (
        <OpportunityModal
          opportunity={selectedOpportunity}
          isOwner={user?.userType === "NGO" && user?._id === (selectedOpportunity.createdBy?._id || selectedOpportunity.createdBy)}
          isEditMode={isEditMode}
          onClose={() => {
            setSelectedOpportunity(null);
            setIsEditMode(false);
            fetchOpportunities();
          }}
        />
      )}
    </div>
  );
};

export default Opportunities;
