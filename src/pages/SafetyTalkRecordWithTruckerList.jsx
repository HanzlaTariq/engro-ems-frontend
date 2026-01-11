import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";
import { 
  FiEdit, 
  FiSave, 
  FiX, 
  FiPrinter, 
  FiArrowLeft, 
  FiSearch, 
  FiFilter,
  FiDownload,
  FiEye,
  FiTrash2,
  FiCalendar,
  FiUser,
  FiTruck,
  FiMessageSquare
} from "react-icons/fi";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
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

export default function SafetyTalkTruckerList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ 
    date: "", 
    topic: "", 
    month: "",
    driverName: "",
    truckNo: "",
    conductedBy: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [viewMode, setViewMode] = useState("table");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

  // Advanced filtering with useMemo for performance
  const filteredData = useMemo(() => {
    let filtered = [...records];

    // Global search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(term)
        )
      );
    }

    // Apply individual filters
    if (filters.date) {
      filtered = filtered.filter((i) => i.date.slice(0, 10) === filters.date);
    }

    if (filters.topic) {
      filtered = filtered.filter((i) =>
        i.topic.toLowerCase().includes(filters.topic.toLowerCase())
      );
    }

    if (filters.month) {
      filtered = filtered.filter(
        (i) => new Date(i.date).getMonth() + 1 === parseInt(filters.month)
      );
    }

    if (filters.driverName) {
      filtered = filtered.filter((i) =>
        i.driverName.toLowerCase().includes(filters.driverName.toLowerCase())
      );
    }

    if (filters.truckNo) {
      filtered = filtered.filter((i) =>
        i.truckNo.toLowerCase().includes(filters.truckNo.toLowerCase())
      );
    }

    if (filters.conductedBy) {
      filtered = filtered.filter((i) =>
        i.conductedBy.toLowerCase().includes(filters.conductedBy.toLowerCase())
      );
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [records, filters, searchTerm, sortConfig]);

  const fetchRecords = useCallback(async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await API.get("/api/safety-talk-trucker/my", {  // ✅ /my add kar
      headers: { Authorization: `Bearer ${token}` }
    });
    setRecords(res.data.records);  // records array
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Failed to load trucker safety talks.");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ date: "", topic: "", month: "", driverName: "", truckNo: "", conductedBy: "" });
    setSearchTerm("");
  };

  // Edit handlers
  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditFormData({
      ...item,
      date: item.date.slice(0, 10),
      time: item.time.slice(0, 5),
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
      `/api/safety-talk-trucker/${editFormData._id}`,
      saveData,
      { headers: { Authorization: `Bearer ${token}` } }  // ✅ Header add
    );
    const updated = res.data.updated;

    setRecords((prev) =>
      prev.map((i) => (i._id === updated._id ? updated : i))
    );

    setEditingId(null);
    setEditFormData({});
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Failed to save changes");
  }
};

  

  const handleRowSelect = (id) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(filteredData.map(item => item._id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const exportToCSV = () => {
    const headers = ["No.", "Date", "Time", "Conducted By", "Truck No", "Driver Name", "Topic", "Remarks"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((item, index) => [
        index + 1,
        formatDate(item.date),
        formatTime12(item.time),
        `"${item.conductedBy}"`,
        `"${item.truckNo}"`,
        `"${item.driverName}"`,
        `"${item.topic}"`,
        `"${item.remarks}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `safety-talks-trucker-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

 const handlePrint = () => {
    const printContent = document.getElementById("printableArea").innerHTML;
    const originalContent = document.getElementById("mainContent").innerHTML;
    
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
          <title>Safety Talk (Trucker) Records</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              margin: 0; 
            }
            h2 { 
              text-align: center; 
              margin-bottom: 5px; 
              color: #374254; 
              font-size: 24px; 
              font-weight: bold; 
            }
            h3 {
              text-align: center;
              margin-bottom: 15px;
              color: #374254;
              font-size: 18px;
              font-weight: normal;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              font-size: 11px; 
              margin-bottom: 30px; 
            }
            th, td { 
              border: 1px solid #000; 
              padding: 6px; 
              text-align: left; 
              white-space: nowrap; 
            }
            th { 
              background-color: #374254; 
              color: #fff; 
            }
            tr:nth-child(even) { 
              background-color: #f7fafc; 
            }
            .logo { 
              position: fixed; 
              bottom: 10px; 
              left: 50%; 
              transform: translateX(-50%); 
              max-width: 200px; 
            }
            .print-header { 
              text-align: center; 
              margin-bottom: 15px; 
              border-bottom: 1px solid #ccc; 
              padding-bottom: 10px; 
            }
            .print-footer { 
              text-align: center; 
              margin-top: 20px; 
              font-size: 10px; 
              color: #666; 
            }
            .serial-no { 
              text-align: center; 
            }
            .generated-date {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-bottom: 15px;
            }
            @media print { 
              .actions, .actions * { 
                display: none !important; 
              } 
              body { 
                -webkit-print-color-adjust: exact; 
                margin: 0;
                padding: 15px;
              }
              table { 
                page-break-inside: auto; 
              }
              tr { 
                page-break-inside: avoid; 
                page-break-after: auto; 
              }
              .print-footer {
                position: fixed;
                bottom: 10px;
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h3>SAFETY TALK RECORD (WITH TRUCKERS)</h3>
          </div>
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

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  );

  return (
    <div id="mainContent" className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <FiTruck className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Safety Talk Records - Truckers
                </h1>
                <p className="text-gray-600">Engro Fertilizers Limited</p>
              </div>
            </div>
            <p className="text-gray-500 mt-1">Manage and monitor trucker safety discussions</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/safety-talk-trucker")}
              className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-md"
            >
              <FiEdit className="text-lg" />
              New Record
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-md"
            >
              <FiPrinter className="text-lg" />
              Print
            </button>
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-md"
            >
              <FiArrowLeft className="text-lg" />
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Records</p>
              <p className="text-2xl font-bold text-gray-800">{records.length}</p>
            </div>
            <FiCalendar className="text-blue-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Filtered Records</p>
              <p className="text-2xl font-bold text-gray-800">{filteredData.length}</p>
            </div>
            <FiFilter className="text-green-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-2xl font-bold text-gray-800">
                {records.filter(item => new Date(item.date).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
            <FiUser className="text-purple-500 text-2xl" />
          </div>
        </div>
        {/* <div className="bg-white p-4 rounded-xl shadow border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Selected</p>
              <p className="text-2xl font-bold text-gray-800">{selectedRows.size}</p>
            </div>
            <FiEye className="text-orange-500 text-2xl" />
          </div>
        </div> */}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiFilter className="text-blue-500" />
            Filters & Search
          </h2>
          <div className="flex gap-3">
            <button
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800 px-3 py-1 border rounded-lg text-sm hover:bg-black hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={exportToCSV}
              className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <FiDownload className="text-sm" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Global Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search across all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Topic</label>
            <input
              type="text"
              name="topic"
              placeholder="Enter topic"
              value={filters.topic}
              onChange={handleFilterChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Month</label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
            <input
              type="text"
              name="driverName"
              placeholder="Filter by driver"
              value={filters.driverName}
              onChange={handleFilterChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Truck Number</label>
            <input
              type="text"
              name="truckNo"
              placeholder="Filter by truck number"
              value={filters.truckNo}
              onChange={handleFilterChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conducted By</label>
            <input
              type="text"
              name="conductedBy"
              placeholder="Filter by conductor"
              value={filters.conductedBy}
              onChange={handleFilterChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{filteredData.length} records found</span>
          {selectedRows.size > 0 && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {selectedRows.size} selected
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-lg ${viewMode === "table" ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`px-4 py-2 rounded-lg ${viewMode === "card" ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Card View
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div id="printableArea" className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  
                  <th className="px-4 py-4 text-left w-16">S.NO</th>
                  <th 
                    className="px-4 py-4 text-left cursor-pointer hover:bg-blue-700 transition"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      {sortConfig.key === "date" && (
                        <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left">Time</th>
                  <th 
                    className="px-4 py-4 text-left cursor-pointer hover:bg-blue-700 transition"
                    onClick={() => handleSort("conductedBy")}
                  >
                    <div className="flex items-center gap-2">
                      Conducted By
                      {sortConfig.key === "conductedBy" && (
                        <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left">Truck No</th>
                  <th className="px-4 py-4 text-left">Driver Name</th>
                  <th className="px-4 py-4 text-left">Topic</th>
                  <th className="px-4 py-4 text-left">Remarks</th>
                  <th className="px-4 py-4 text-left actions">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      <FiMessageSquare className="mx-auto text-4xl text-gray-300 mb-2" />
                      No records found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item._id} className={`hover:bg-blue-50 transition ${selectedRows.has(item._id) ? 'bg-blue-50' : ''}`}>
                      
                      <td className="px-4 py-3 font-medium text-gray-900 text-center">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {editingId === item._id ? (
                          <input 
                            type="date" 
                            name="date" 
                            value={editFormData.date} 
                            onChange={handleEditChange} 
                            className="border rounded-lg px-2 py-1 w-full"
                          />
                        ) : formatDate(item.date)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {editingId === item._id ? (
                          <input 
                            type="time" 
                            name="time" 
                            value={editFormData.time} 
                            onChange={handleEditChange} 
                            className="border rounded-lg px-2 py-1 w-full"
                          />
                        ) : formatTime12(item.time)}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item._id ? (
                          <input 
                            type="text" 
                            name="conductedBy" 
                            value={editFormData.conductedBy} 
                            onChange={handleEditChange} 
                            className="border rounded-lg px-2 py-1 w-full"
                          />
                        ) : item.conductedBy}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-700">
                        {editingId === item._id ? (
                          <input 
                            type="text" 
                            name="truckNo" 
                            value={editFormData.truckNo} 
                            onChange={handleEditChange} 
                            className="border rounded-lg px-2 py-1 w-full"
                          />
                        ) : item.truckNo}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item._id ? (
                          <input 
                            type="text" 
                            name="driverName" 
                            value={editFormData.driverName} 
                            onChange={handleEditChange} 
                            className="border rounded-lg px-2 py-1 w-full"
                          />
                        ) : item.driverName}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item._id ? (
                          <input 
                            type="text" 
                            name="topic" 
                            value={editFormData.topic} 
                            onChange={handleEditChange} 
                            className="border rounded-lg px-2 py-1 w-full"
                          />
                        ) : (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {item.topic}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {editingId === item._id ? (
                          <textarea 
                            name="remarks" 
                            value={editFormData.remarks} 
                            onChange={handleEditChange} 
                            className="border rounded-lg px-2 py-1 w-full"
                            rows="2"
                          />
                        ) : (
                          <span className="text-gray-600">{item.remarks}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 actions">
                        {editingId === item._id ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={handleSave} 
                              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition"
                              title="Save"
                            >
                              <FiSave className="text-sm" />
                            </button>
                            <button 
                              onClick={handleCancel} 
                              className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition"
                              title="Cancel"
                            >
                              <FiX className="text-sm" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(item)} 
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                              title="Edit"
                            >
                              <FiEdit className="text-sm" />
                            </button>
                          
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item, index) => (
            <div key={item._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-white text-blue-600 px-2 py-1 rounded text-sm font-bold">#{index + 1}</span>
                      <span className="text-blue-100 text-sm">{formatDate(item.date)}</span>
                    </div>
                    <h3 className="font-semibold text-lg">{item.topic}</h3>
                    <p className="text-blue-100 text-sm">{formatTime12(item.time)}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(item._id)}
                    onChange={() => handleRowSelect(item._id)}
                    className="rounded border-gray-300"
                  />
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-gray-400" />
                    <span className="font-medium">Driver:</span>
                    <span>{editingId === item._id ? (
                      <input 
                        type="text" 
                        name="driverName" 
                        value={editFormData.driverName} 
                        onChange={handleEditChange} 
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                    ) : item.driverName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FiTruck className="text-gray-400" />
                    <span className="font-medium">Truck No:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                      {editingId === item._id ? (
                        <input 
                          type="text" 
                          name="truckNo" 
                          value={editFormData.truckNo} 
                          onChange={handleEditChange} 
                          className="border rounded px-2 py-1 text-sm w-full"
                        />
                      ) : item.truckNo}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FiUser className="text-gray-400" />
                    <span className="font-medium">Conducted By:</span>
                    <span>{editingId === item._id ? (
                      <input 
                        type="text" 
                        name="conductedBy" 
                        value={editFormData.conductedBy} 
                        onChange={handleEditChange} 
                        className="border rounded px-2 py-1 text-sm w-full"
                      />
                    ) : item.conductedBy}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium block mb-1">Remarks:</span>
                    {editingId === item._id ? (
                      <textarea 
                        name="remarks" 
                        value={editFormData.remarks} 
                        onChange={handleEditChange} 
                        className="border rounded px-2 py-1 text-sm w-full"
                        rows="2"
                      />
                    ) : (
                      <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded-lg">{item.remarks}</p>
                    )}
                  </div>

                  {editingId === item._id && (
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium block mb-1">Date:</span>
                        <input 
                          type="date" 
                          name="date" 
                          value={editFormData.date} 
                          onChange={handleEditChange} 
                          className="border rounded px-2 py-1 text-sm w-full"
                        />
                      </div>
                      <div>
                        <span className="font-medium block mb-1">Time:</span>
                        <input 
                          type="time" 
                          name="time" 
                          value={editFormData.time} 
                          onChange={handleEditChange} 
                          className="border rounded px-2 py-1 text-sm w-full"
                        />
                      </div>
                      <div>
                        <span className="font-medium block mb-1">Topic:</span>
                        <input 
                          type="text" 
                          name="topic" 
                          value={editFormData.topic} 
                          onChange={handleEditChange} 
                          className="border rounded px-2 py-1 text-sm w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  {editingId === item._id ? (
                    <>
                      <button 
                        onClick={handleSave} 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
                      >
                        <FiSave className="text-sm" />
                        Save
                      </button>
                      <button 
                        onClick={handleCancel} 
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
                      >
                        <FiX className="text-sm" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition text-sm flex items-center justify-center gap-1"
                      >
                        <FiEdit className="text-sm" />
                        Edit
                      </button>
                      
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state for card view */}
      {viewMode === "card" && filteredData.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <FiMessageSquare className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No records found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}