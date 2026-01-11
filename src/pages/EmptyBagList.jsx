import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../api/axios.jsx";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${d.getFullYear()}`;
};

export default function EmptyBagList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ date: "", month: "", product: "" });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Fetch records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/api/empty-bag-record/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort by date ascending
      const sorted = (res.data.records || []).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setRecords(sorted);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load empty bag records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // ✅ Filters
  useEffect(() => {
    let filtered = records;

    // Filter by exact date
    if (filters.date) {
      filtered = filtered.filter((i) => i.date && i.date.slice(0, 10) === filters.date);
    }

    // Filter by month
    if (filters.month) {
      filtered = filtered.filter((i) => i.date && i.date.slice(0, 7) === filters.month);
    }

    // Filter by product
    if (filters.product) {
      filtered = filtered.filter((i) =>
        i.product.toLowerCase().includes(filters.product.toLowerCase())
      );
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
      date: item.date.slice(0, 10),
    });
    setError("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData({});
    setError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...editFormData, [name]: value };
    
    // Auto-calculate balanceQty using formula: (Opening Balance + Receipt QTY) - Issued QTY
    if (name === "openingBalance" || name === "receiptQty" || name === "issuedQty") {
      const opening = parseFloat(updated.openingBalance) || 0;
      const receipt = parseFloat(updated.receiptQty) || 0;
      const issued = parseFloat(updated.issuedQty) || 0;
      updated.balanceQty = opening + receipt - issued;
    }
    
    setEditFormData(updated);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const saveData = {
        ...editFormData,
        date: new Date(editFormData.date).toISOString(),
      };
      const res = await API.put(
        `/api/empty-bag-record/${editFormData._id}`,
        saveData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        const updated = res.data.updated;
        setRecords((prev) =>
          prev.map((i) => (i._id === updated._id ? updated : i))
        );
        setEditingId(null);
        setEditFormData({});
        setError("");
        
        // Refresh data to ensure consistency
        fetchRecords();
      }
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

  // ✅ Print Function (with small font size like pre-stationary)
  const handlePrint = () => {
    const selectedProduct =
      filters.product || (filteredData[0]?.product ?? "All Products");
    const selectedMonth = filters.month
      ? new Date(filters.month + "-01").toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
      : "All Dates";

    // Clone table & remove actions column for print
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
          <title>Empty Bag Records</title>
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
          <h2>Empty Bag Records</h2>
          
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
        <h1 className="text-3xl font-bold text-gray-800">Empty Bag Records</h1>
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

      {/* ✅ Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by Date
          </label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by Month
          </label>
          <input
            type="month"
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by Product
          </label>
          <input
            type="text"
            name="product"
            value={filters.product}
            onChange={handleFilterChange}
            placeholder="Enter product name"
            className="mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table with small font size like pre-stationary */}
      <div id="printableArea" className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="px-2 py-1 border">Date</th>
              <th className="px-2 py-1 border">Product</th>
              <th className="px-2 py-1 border">Opening Balance</th>
              <th className="px-2 py-1 border">Receipt Qty</th>
              <th className="px-2 py-1 border">Issued Qty</th>
              <th className="px-2 py-1 border">Issuance Purpose</th>
              <th className="px-2 py-1 border">Per Ref</th>
              <th className="px-2 py-1 border">Balance Qty</th>
              <th className="px-2 py-1 border">WHI Initial</th>
              <th className="px-2 py-1 border">DO Verified</th>
              <th className="px-2 py-1 border actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="11"
                  className="text-center px-4 py-3 border text-gray-500"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item._id} className="hover:bg-indigo-50 transition">
                  {editingId === item._id ? (
                    // Edit Mode
                    <>
                      <td className="px-3 py-1 border">
                        <input
                          type="date"
                          name="date"
                          value={editFormData.date || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="text"
                          name="product"
                          value={editFormData.product || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="number"
                          name="openingBalance"
                          value={editFormData.openingBalance || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="number"
                          name="receiptQty"
                          value={editFormData.receiptQty || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="number"
                          name="issuedQty"
                          value={editFormData.issuedQty || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="text"
                          name="issuencePurpose"
                          value={editFormData.issuencePurpose || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="text"
                          name="perRef"
                          value={editFormData.perRef || ""}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="number"
                          name="balanceQty"
                          value={editFormData.balanceQty || ""}
                          readOnly
                          className="border rounded px-2 py-1 w-full text-sm bg-gray-100 cursor-not-allowed"
                          title="Auto-calculated: (Opening Balance + Receipt QTY) - Issued QTY"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        <input
                          type="text"
                          name="whiInitial"
                          value={editFormData.whiInitial || ""}
                          readOnly
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full text-sm bg-gray-100 cursor-not-allowed"
                        />
                      </td>
                      <td className="px-3 py-1 border">
                        {item.doEmail || "DO Not Verified"}
                      </td>
                      <td className="px-3 py-1 border actions">
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <td className="px-3 py-1 border">{formatDate(item.date)}</td>
                      <td className="px-3 py-1 border">{item.product}</td>
                      <td className="px-3 py-1 border">{item.openingBalance}</td>
                      <td className="px-3 py-1 border">{item.receiptQty}</td>
                      <td className="px-3 py-1 border">{item.issuedQty}</td>
                      <td className="px-3 py-1 border">{item.issuencePurpose}</td>
                      <td className="px-3 py-1 border">{item.perRef}</td>
                      <td className="px-3 py-1 border">{item.balanceQty}</td>
                      <td className="px-3 py-1 border">{item.whiInitial}</td>
                      <td className="px-3 py-1 border">
                        {item.doEmail || "DO Not Verified"}
                      </td>
                      <td className="px-3 py-1 border actions">
                        {item.doVerified !== "Verified" ? (
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                          >
                            Edit
                          </button>
                        ) : (
                          <span className="text-green-600 font-semibold text-sm">Verified</span>
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