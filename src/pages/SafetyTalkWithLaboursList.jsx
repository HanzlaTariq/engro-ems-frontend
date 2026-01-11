import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${d.getFullYear()}`;
};

const formatTime12 = (time24) => {
  if (!time24) return "";
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
};

export default function SafetyTalkList() {
  const navigate = useNavigate();
  const [safetyTalks, setSafetyTalks] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    topic: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Fetch safety talks
  const fetchSafetyTalks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/api/safety-talk/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort by date descending (newest first)
      const sorted = (res.data.records || []).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setSafetyTalks(sorted);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load safety talks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafetyTalks();
  }, []);

  // Filters with date range
  useEffect(() => {
    let filtered = safetyTalks;

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter((i) =>
        i.date && i.date.slice(0, 10) >= filters.dateFrom
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter((i) =>
        i.date && i.date.slice(0, 10) <= filters.dateTo
      );
    }

    // Filter by topic
    if (filters.topic) {
      filtered = filtered.filter((i) =>
        i.topic && i.topic.toLowerCase().includes(filters.topic.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [filters, safetyTalks]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ dateFrom: "", dateTo: "", topic: "" });
  };

  // Edit Handlers
  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditFormData({
      ...item,
      date: item.date ? item.date.slice(0, 10) : "",
      time: item.time ? item.time.slice(0, 5) : "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const saveData = {
        ...editFormData,
        date: new Date(editFormData.date).toISOString(),
      };
      const res = await API.put(
        `/api/safety-talk/${editFormData._id}`,
        saveData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data.updated;

      setSafetyTalks((prev) =>
        prev.map((i) => (i._id === updated._id ? updated : i))
      );

      setEditingId(null);
      setEditFormData({});
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save changes");
    }
  };

  // ✅ Updated Print function - header info hidden in print
  const handlePrint = () => {
    const originalTable = document.getElementById("printableArea");
    if (!originalTable) return;

    const tableClone = originalTable.cloneNode(true);

    // Remove actions column from print
    const headerRow = tableClone.querySelector("thead tr");
    if (headerRow) {
      const headers = Array.from(headerRow.querySelectorAll("th"));
      headers.forEach((th, idx) => {
        if (th.textContent && th.textContent.trim().toLowerCase().includes("action")) {
          th.remove();
        }
      });
    }

    // Remove actions column from all rows
    tableClone.querySelectorAll("tbody tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      const headers = Array.from(headerRow.querySelectorAll("th"));
      headers.forEach((th, idx) => {
        if (th.textContent && th.textContent.trim().toLowerCase().includes("action")) {
          if (cells[idx]) cells[idx].remove();
        }
      });
    });

    const printContent = tableClone.innerHTML;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
    <html>
      <head>
        <title>Safety Talk Records</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            margin:0; 
          }
          h2 { 
            text-align: center; 
            margin-bottom: 5px; 
            color: #374254; 
            font-size: 24px; 
            font-weight: bold; 
          }
          .header-info {
            display: none; /* Hide header info in print */
          }
          table { 
            border-collapse: collapse; 
            width:100%; 
            font-size:11px; 
            margin-bottom:30px; 
            margin-top: 20px;
          }
          th, td { 
            border:1px solid #000; 
            padding:6px; 
            text-align:left; 
            white-space:nowrap; 
          }
          th { 
            background-color:#374254; 
            color:#fff; 
          }
          tr:nth-child(even) { 
            background-color:#f7fafc; 
          }
          .logo { 
            position: fixed; 
            bottom:10px; 
            left:50%; 
            transform:translateX(-50%); 
            max-width:200px; 
          }
          @media print { 
            .header-info {
              display: none !important;
            }
            .actions, .actions * { 
              display: none !important; 
            } 
            body { 
              -webkit-print-color-adjust: exact; 
            }
            table { 
              page-break-inside:auto; 
            }
            tr { 
              page-break-inside:avoid; 
              page-break-after:auto; 
            }
          }
        </style>
      </head>
      <body>
        <h2>SAFETY TALK RECORD (WITH LABORERS)</h2>
        ${printContent}
        <img src="https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/stu02ugqvwjmdxhl3foe" 
             alt="Engro Logo" class="logo" id="printLogo" />
      </body>
    </html>
  `);
    doc.close();

    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">SAFETY TALK RECORD (WITH LABORERS)</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Back
          </button>
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-yellow-500 transition"
          >
            Print
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters with Date Range */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear Filters
          </button>
        </div>
        <div className="flex gap-4 mb-6 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Topic
            </label>
            <input
              type="text"
              name="topic"
              placeholder="Enter topic"
              value={filters.topic}
              onChange={handleFilterChange}
              className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-gray-600">
          <div>
            <span className="font-semibold">Total Records:</span> {safetyTalks.length}
          </div>
          <div>
            <span className="font-semibold">Filtered:</span> {filteredData.length}
          </div>
          {(filters.dateFrom || filters.dateTo) && (
            <div>
              <span className="font-semibold">Date Range:</span> {filters.dateFrom || '...'} to {filters.dateTo || '...'}
            </div>
          )}
        </div>
      </div>

      {/* Table with Sr No */}
      <div id="printableArea" className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="px-2 py-1 border">Sr</th>
              <th className="px-2 py-1 border">Date</th>
              <th className="px-2 py-1 border">Time</th>
              <th className="px-2 py-1 border">Conducted By</th>
              <th className="px-2 py-1 border">No. of Labours</th>
              <th className="px-2 py-1 border">H/C Present</th>
              <th className="px-2 py-1 border">Topic</th>
              <th className="px-2 py-1 border">Remarks</th>
              <th className="px-2 py-1 border actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center px-4 py-3 border text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item._id} className="hover:bg-indigo-50 transition">
                  <td className="px-3 py-1 border text-center">{index + 1}</td>
                  <td className="px-3 py-1 border">
                    {editingId === item._id ? (
                      <input
                        type="date"
                        name="date"
                        value={editFormData.date}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full text-sm"
                      />
                    ) : (
                      formatDate(item.date)
                    )}
                  </td>
                  <td className="px-3 py-1 border">
                    {editingId === item._id ? (
                      <input
                        type="time"
                        name="time"
                        value={editFormData.time}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full text-sm"
                      />
                    ) : (
                      formatTime12(item.time)
                    )}
                  </td>
                  <td className="px-3 py-1 border">
                    {editingId === item._id ? (
                      <input
                        type="text"
                        name="conductedBy"
                        value={editFormData.conductedBy}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full text-sm"
                      />
                    ) : (
                      item.conductedBy
                    )}
                  </td>
                  <td className="px-3 py-1 border">
                    {editingId === item._id ? (
                      <input
                        type="number"
                        name="noOfLabours"
                        value={editFormData.noOfLabours}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full text-sm"
                      />
                    ) : (
                      item.noOfLabours
                    )}
                  </td>
                  <td className="px-3 py-1 border">
                    {editingId === item._id ? (
                      <input
                        type="text"
                        name="hcPresent"
                        value={editFormData.hcPresent}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full text-sm"
                      />
                    ) : (
                      item.hcPresent
                    )}
                  </td>
                  <td className="px-3 py-1 border">
                    {editingId === item._id ? (
                      <input
                        type="text"
                        name="topic"
                        value={editFormData.topic}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full text-sm"
                      />
                    ) : (
                      item.topic
                    )}
                  </td>
                  <td className="px-3 py-1 border">
                    {editingId === item._id ? (
                      <input
                        type="text"
                        name="remarks"
                        value={editFormData.remarks}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full text-sm"
                      />
                    ) : (
                      item.remarks
                    )}
                  </td>
                  <td className="px-3 py-1 border actions">
                    {editingId === item._id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}