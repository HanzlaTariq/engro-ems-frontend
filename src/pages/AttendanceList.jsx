import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../utils/api.js";
const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
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

const toMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function AttendanceList() {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ date: "", signature: "" });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

// Fetch data – ✅ /my endpoint use karo
const fetchAttendance = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to view attendance.");
      return;
    }

    const res = await API.get(
      "/api/attendance/my?page=1&limit=1000",  // ✅ /my add kar
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setAttendanceData(res.data.attendances);  // attendances array
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Failed to load attendance data.");
  } finally {
    setLoading(false);
  }
};

// Edit save – ✅ Header add kar
const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");
    const saveData = {
      ...editFormData,
      date: new Date(editFormData.date).toISOString(),
    };

    const res = await API.put(
      `/api/attendance/${editFormData._id}`,
      saveData,
      { 
        headers: { Authorization: `Bearer ${token}` }  // ✅ Token add
      }
    );

    const updatedRecord = res.data.updated;

    // Update state
    setAttendanceData((prevData) =>
      prevData.map((item) => (item._id === updatedRecord._id ? updatedRecord : item))
    );

    setEditingId(null);
    setEditFormData({});
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Failed to save changes");
  }
};

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Apply filters automatically
  useEffect(() => {
    let filtered = attendanceData;

    // Filter by exact ISO date (YYYY-MM-DD)
    if (filters.date) {
      filtered = filtered.filter((i) => i.date.slice(0, 10) === filters.date);
    }

    // Filter by signature (case-insensitive)
    if (filters.signature) {
      filtered = filtered.filter((i) =>
        i.whiSignature.toLowerCase().includes(filters.signature.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [attendanceData, filters]);

  // Filter change handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Edit handlers
  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditFormData({
      ...item,
      date: item.date.slice(0, 10),
      timeIn: item.timeIn.slice(0, 5),
      timeOut: item.timeOut.slice(0, 5),
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...editFormData, [name]: value };

    if (name === "timeIn" || name === "timeOut") {
      const timeIn = name === "timeIn" ? value : editFormData.timeIn;
      const timeOut = name === "timeOut" ? value : editFormData.timeOut;
      if (timeIn && timeOut) {
        const outMinutes = toMinutes(timeOut);
        const routineEnd = toMinutes("17:30");
        newFormData.extraTime = outMinutes > routineEnd ? outMinutes - routineEnd : 0;
      } else {
        newFormData.extraTime = 0;
      }
    }

    setEditFormData(newFormData);
  };

  

  // Print
 const handlePrint = () => {
    const printContent = document.getElementById("printableArea").innerHTML;
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
          <title>WHI Attendance Register</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; margin:0; }
            h2 { 
              text-align: center; 
              margin-bottom: 5px; 
              color: #374254; 
              font-size: 24px; 
              font-weight: bold; 
            }
            .info-boxes { 
              display:flex; 
              flex-wrap:wrap; 
              justify-content:space-between; 
              margin-bottom:20px; 
              gap:10px; 
            }
            .info-box { 
              border:1px solid #000; 
              padding:8px; 
              flex:1; 
              min-width:120px; 
              text-align:center; 
              font-weight:600; 
              font-size:12px; 
            }
            table { 
              border-collapse: collapse; 
              width:100%; 
              font-size:11px; 
              margin-bottom:30px; 
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
          <h2>WHI Attendance Register</h2>
          <div class="info-boxes">
            <div class="info-box">Month: __________</div>
            <div class="info-box">Year: __________</div>
            <div class="info-box">WH Location: __________</div>
            <div class="info-box">WHI: __________</div>
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
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">WHI Attendance Register</h1>
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

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700">Filter by Date</label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Filter by Signature</label>
          <input
            type="text"
            name="signature"
            placeholder="Enter email"
            value={filters.signature}
            onChange={handleFilterChange}
            className="mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div id="printableArea" className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="px-4 py-3 border">Date</th>
              <th className="px-4 py-3 border">Time In</th>
              <th className="px-4 py-3 border">Time Out</th>
              <th className="px-4 py-3 border">Extra Time(minute)</th>
              <th className="px-4 py-3 border">Direct Diversion</th>
              <th className="px-4 py-3 border">Total Handling(Met)</th>
              <th className="px-4 py-3 border">WHI Signature</th>
              <th className="px-4 py-3 border actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center px-4 py-3 border text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item._id}
                  className={`${filteredData.indexOf(item) % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-indigo-50 transition`}
                >
                  <td className="px-4 py-2 border">
                    {editingId === item._id ? (
                      <input
                        type="date"
                        name="date"
                        value={editFormData.date}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      formatDate(item.date)
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editingId === item._id ? (
                      <input
                        type="time"
                        name="timeIn"
                        value={editFormData.timeIn}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      formatTime12(item.timeIn)
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editingId === item._id ? (
                      <input
                        type="time"
                        name="timeOut"
                        value={editFormData.timeOut}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      formatTime12(item.timeOut)
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editingId === item._id ? (
                      <input
                        type="text"
                        name="extraTime"
                        value={editFormData.extraTime}
                        readOnly
                        className="border rounded px-2 py-1 bg-gray-100"
                      />
                    ) : (
                      item.extraTime
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editingId === item._id ? (
                      <input
                        type="text"
                        name="directDiversion"
                        value={editFormData.directDiversion}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      item.directDiversion
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editingId === item._id ? (
                      <input
                        type="text"
                        name="totalHandling"
                        value={editFormData.totalHandling}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      item.totalHandling
                    )}
                  </td>
                  <td className="px-4 py-2 border">{item.whiSignature}</td>
                  <td className="px-4 py-2 border actions">
                    {editingId === item._id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-500 text-white px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
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
