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

<<<<<<< HEAD
  /* ================= TOKEN VALIDATION ================= */
  const isValidToken = (token) => {
    return token && token !== "undefined" && token !== "null";
  };
=======
  const isValidToken = (token) => token && token !== "undefined" && token !== "null";
>>>>>>> 7f2afbe5719fc60228142c53090e99886b029097

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

<<<<<<< HEAD
      const res = await axios.get(
        "http://localhost:5000/api/opportunities",
        { headers: { Authorization: `Bearer ${token}` } }
      );
=======
      const res = await axios.get("http://localhost:5000/api/opportunities", {
        headers: { Authorization: `Bearer ${token}` },
      });
>>>>>>> 7f2afbe5719fc60228142c53090e99886b029097

      const cleanData = Array.isArray(res.data)
        ? res.data.filter((opp) => opp && opp._id)
        : [];

      cleanData.forEach((opp) => {
        if (opp.status) opp.status = opp.status.toUpperCase();
      });

      setAllOpportunities(cleanData);
      setLoading(false);
    } catch (err) {
<<<<<<< HEAD
=======
      console.error("Fetch error:", err.response || err.message);

>>>>>>> 7f2afbe5719fc60228142c53090e99886b029097
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
      setError("Failed to fetch opportunities.");
      setLoading(false);
    }
  }, [token, navigate]);

<<<<<<< HEAD
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
=======
  // ✅ useEffect now safely depends on fetchOpportunities
  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);
>>>>>>> 7f2afbe5719fc60228142c53090e99886b029097

  const filteredOpportunities = allOpportunities.filter((opp) => {
    if (!opp || !opp.status) return false;
    if (filter === "ALL") return true;
    return opp.status === filter;
  });

<<<<<<< HEAD
  /* ================= APPLY (REDIRECT TO FORM) ================= */
  const handleApply = (opp) => {
=======
  const handleApply = async (opp) => {
>>>>>>> 7f2afbe5719fc60228142c53090e99886b029097
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

<<<<<<< HEAD
    navigate(`/apply/${opp._id}`);
=======
    try {
      await axios.post(
        "http://localhost:5000/api/applications/apply",
        { opportunityId: opp._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/applications");
    } catch (err) {
      setApplyError(err.response?.data?.message || "Failed to apply for opportunity.");
    }
>>>>>>> 7f2afbe5719fc60228142c53090e99886b029097
  };

  const handleDelete = async (id) => {
    const opp = allOpportunities.find((o) => o._id === id);
    if (!opp) return;

    const creatorId = opp.createdBy?._id || opp.createdBy;

    if (user?._id !== creatorId) {
      alert("You are not authorized to delete this opportunity.");
      return;
    }

<<<<<<< HEAD
    if (!window.confirm("Are you sure you want to delete this opportunity?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/opportunities/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
=======
    const confirmDelete = window.confirm("Are you sure you want to delete this opportunity?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/opportunities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
>>>>>>> 7f2afbe5719fc60228142c53090e99886b029097
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
