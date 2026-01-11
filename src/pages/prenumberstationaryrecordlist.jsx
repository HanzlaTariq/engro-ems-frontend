import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../api/axios.jsx";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

export default function PreNumberStationaryRecordList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ date: "", receiptFrom: "", receiptTo: "", month: "" });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Fetch records
  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/api/pre-number-stationary-record/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sorted = (res.data.records || []).sort(
        (a, b) => new Date(a.receiptDate) - new Date(b.receiptDate)
      );
      setRecords(sorted);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load pre number stationary records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filters
  useEffect(() => {
    let filtered = records;

    if (filters.date) {
      filtered = filtered.filter((i) => i.date && i.date.slice(0, 10) === filters.date);
    }
    if (filters.receiptFrom) {
      filtered = filtered.filter((i) => i.receiptDate && i.receiptDate.slice(0, 10) >= filters.receiptFrom);
    }
    if (filters.receiptTo) {
      filtered = filtered.filter((i) => i.receiptDate && i.receiptDate.slice(0, 10) <= filters.receiptTo);
    }
    if (filters.month) {
      // filters.month is in YYYY-MM format from <input type="month" />
      filtered = filtered.filter((i) => i.receiptDate && i.receiptDate.slice(0, 7) === filters.month);
    }

    setFilteredData(filtered);
  }, [filters, records]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Edit handlers
  const handleEdit = (item) => {
    // Check if record is verified
    if (item.doVerified === "Verified") {
      setError("This record has been verified by DO and cannot be edited.");
      return;
    }
    
    setEditingId(item._id);
    setEditFormData({
      ...item,
      receiptDate: item.receiptDate.slice(0, 10),
      startDate: item.startDate.slice(0, 10),
      endDate: item.endDate.slice(0, 10),
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData({});
    setError("");
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
        receiptDate: new Date(editFormData.receiptDate).toISOString(),
        startDate: new Date(editFormData.startDate).toISOString(),
        endDate: new Date(editFormData.endDate).toISOString(),
      };
      const res = await API.put(
        `/api/pre-number-stationary-record/${editFormData._id}`,
        saveData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data.updated;

      setRecords((prev) =>
        prev.map((i) => (i._id === updated._id ? updated : i))
      );

      setEditingId(null);
      setEditFormData({});
      setError("");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to save changes";
      setError(errorMsg);
      
      // If error is about verified record, refresh the data
      if (errorMsg.includes("Cannot edit a verified record")) {
        fetchRecords();
      }
    }
  };

  // Print function (simple)
  const handlePrint = () => {
    const selectedProduct =
      filters.product || (filteredData[0]?.product ?? "All Products");
    const selectedMonth = filters.month
      ? new Date(filters.month + "-01").toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
      : "All Dates";
    const receiptRange = (filters.receiptFrom || filters.receiptTo)
      ? `${filters.receiptFrom ? formatDate(filters.receiptFrom) : '...'} to ${filters.receiptTo ? formatDate(filters.receiptTo) : '...'}`
      : 'All Receipt Dates';

    // Clone table & remove only a real "Product" column (by header text).
    const originalTable = document.getElementById("printableArea");
    if (!originalTable) return;
    const tableClone = originalTable.cloneNode(true);

    // detect product column index by header text (case-insensitive)
    let productColumnIndex = -1;
    const headerRow = tableClone.querySelector("thead tr");
    if (headerRow) {
      const headers = Array.from(headerRow.querySelectorAll("th"));
      headers.forEach((th, idx) => {
        if (th.textContent && th.textContent.trim().toLowerCase() === "product") {
          productColumnIndex = idx;
        }
      });
    }

    // If a Product column was found, remove that column from all rows.
    if (productColumnIndex !== -1) {
      tableClone.querySelectorAll("tr").forEach((row) => {
        const cells = row.querySelectorAll("th, td");
        if (cells[productColumnIndex]) cells[productColumnIndex].remove();
      });
    }

    // Also remove actions column from print
    tableClone.querySelectorAll(".actions").forEach(el => {
      el.style.display = "none";
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
          <title>Pre Number Stationary Record</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; margin:0; }
            h2 { text-align: center; margin-bottom: 5px; color: #374254; font-size: 24px; font-weight: bold; }
            .header-line {
              text-align: left;
              font-size: 16px;
              margin-bottom: 20px;
              line-height: 1.8;
            }
            .product-line {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .dots {
              flex-grow: 1;
              border-bottom: 1px dotted #000;
              height: 0;
              margin: 0 10px;
            }
            .product-name {
              font-weight: bold;
            }
            .month-line {
              margin-top: 5px;
            }
            table { border-collapse: collapse; width:100%; font-size:11px; margin-bottom:30px; }
            th, td { border:1px solid #000; padding:6px; text-align:left; white-space:nowrap; }
            th { background-color:#374254; color:#fff; }
            tr:nth-child(even) { background-color:#f7fafc; }
            .logo { position: fixed; bottom:10px; left:50%; transform:translateX(-50%); max-width:200px; }
            @media print { 
              .actions, .actions * { display: none !important; } 
              body { -webkit-print-color-adjust: exact; }
              table { page-break-inside:auto; }
              tr { page-break-inside:avoid; page-break-after:auto; }
            }
          </style>
        </head>
        <body>
          <h2>Pre Number Stationary Record</h2>
            <div class="header-line">
            <div class="product-line">
              <strong>Product:</strong>
              <span class="dots"></span>
              <span class="product-name">${selectedProduct}</span>
            </div>
            ${(filters.month || filters.receiptFrom || filters.receiptTo) ? `<div class="month-line"><strong>Month:</strong> ${selectedMonth} &nbsp; <strong>Receipt:</strong> ${receiptRange}</div>` : ''}
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

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (error && !editingId) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Pre Number Stationary Records</h1>
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition">
            Back
          </button>
          <button onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-yellow-500 transition">
            Print
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && editingId && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700">Receipt From</label>
          <input
            type="date"
            name="receiptFrom"
            value={filters.receiptFrom}
            onChange={handleFilterChange}
            className="mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Receipt To</label>
          <input
            type="date"
            name="receiptTo"
            value={filters.receiptTo}
            onChange={handleFilterChange}
            className="mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Filter by Month</label>
          <input
            type="month"
            name="month"
            value={filters.month}
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
              <th className="px-2 py-1 border">Sr</th>
              <th className="px-2 py-1 border">Book No</th>
              <th className="px-2 py-1 border">Receipt Date</th>
              <th className="px-2 py-1 border">From</th>
              <th className="px-2 py-1 border">To</th>
              <th className="px-2 py-1 border">Start Date</th>
              <th className="px-2 py-1 border">End Date</th>
              <th className="px-2 py-1 border">Purpose</th>
              <th className="px-2 py-1 border">WHI Initial</th>
              <th className="px-2 py-1 border">DO Verified</th>
              <th className="px-2 py-1 border actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center px-4 py-3 border text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item._id} className="hover:bg-indigo-50 transition">
                  {editingId === item._id ? (
                    // Edit Mode
                    <>
                      <td className="px-3 py-1 border">{index + 1}</td>
                      <td className="px-3 py-1 border">
                        <input
                          type="text"
                          name="bookNo"
                          value={editFormData.bookNo || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="date"
                          name="receiptDate"
                          value={editFormData.receiptDate || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="text"
                          name="from"
                          value={editFormData.from || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="text"
                          name="to"
                          value={editFormData.to || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="date"
                          name="startDate"
                          value={editFormData.startDate || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="date"
                          name="endDate"
                          value={editFormData.endDate || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="text"
                          name="purpose"
                          value={editFormData.purpose || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="text"
                          name="whiInitial"
                          value={editFormData.whiInitial || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        {item.doEmail || "DO Not Verified"}
                      </td>
                      <td className="px-3 py-1 border actions">
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <td className="px-3 py-1 border">{index + 1}</td>
                      <td className="px-3 py-1 border">{item.bookNo}</td>
                      <td className="px-3 py-1 border">{formatDate(item.receiptDate)}</td>
                      <td className="px-3 py-1 border">{item.from}</td>
                      <td className="px-3 py-1 border">{item.to}</td>
                      <td className="px-3 py-1 border">{formatDate(item.startDate)}</td>
                      <td className="px-3 py-1 border">{formatDate(item.endDate)}</td>
                      <td className="px-3 py-1 border">{item.purpose}</td>
                      <td className="px-3 py-1 border">{item.whiInitial}</td>
                      <td className="px-3 py-1 border">
                        {item.doEmail || "DO Not Verified"}
                      </td>
                      <td className="px-3 py-1 border actions">
                        {item.doVerified !== "Verified" ? (
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Edit
                          </button>
                        ) : (
                          <span className="text-green-600 font-semibold">Verified</span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}