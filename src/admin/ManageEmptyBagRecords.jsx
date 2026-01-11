import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminAuthContext } from "./context/AdminAuthContext";
import Swal from 'sweetalert2';
import API from "../utils/api";


export default function ManageEmptyBagRecords() {
  const { admin, adminToken, loading: authLoading } = useContext(AdminAuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      if (!adminToken) {
        alert("Admin token missing – re-login.");
        return;
      }

      const res = await API.get("/api/empty-bag-record", {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setRecords(res.data.records || res.data);
    } catch (err) {
      console.error("Failed to fetch:", err.response?.data || err);
      alert("Failed to fetch records: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, verify it!',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    try {
      if (!admin?.email || !adminToken) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Admin details missing. Please re-login.',
        });
        return;
      }

      await API.put(
        `/api/empty-bag-record/verify/${id}`,
        { adminEmail: admin.email },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Verified!',
        text: 'The record has been verified successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      fetchRecords();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: err.response?.data?.message || err.message,
      });
      console.error("Verify failed:", err.response?.data || err);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete Record?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    });

    if (!confirm.isConfirmed) return;

    try {
      if (!adminToken) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Admin token missing. Please re-login.',
        });
        return;
      }

      await API.delete(
        `/api/empty-bag-record/${id}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'The record has been deleted successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      fetchRecords();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: err.response?.data?.message || err.message,
      });
      console.error("Delete failed:", err.response?.data || err);
    }
  };

  useEffect(() => {

    fetchRecords();

  }, []);

  // Date formatter
  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };



  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🧾 Manage Empty Bag Records
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading records...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
          <table className="min-w-full text-xs text-gray-700">
            <thead className="bg-gray-200 text-gray-800 uppercase text-[10px]">
              <tr>
                <th className="py-1 px-2 border">Date</th>
                <th className="py-1 px-2 border">Product</th>
                <th className="py-1 px-2 border">Opening</th>
                <th className="py-1 px-2 border">Receipt</th>
                <th className="py-1 px-2 border">Issued</th>
                <th className="py-1 px-2 border">Purpose</th>
                <th className="py-1 px-2 border">Per Ref</th>
                <th className="py-1 px-2 border">Balance Qty</th>
                <th className="py-1 px-2 border">WHI Initial</th>
                <th className="py-1 px-2 border">Status</th>
                <th className="py-1 px-2 border">DO Email</th>
                <th className="py-1 px-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-3 text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr
                    key={rec._id}
                    className="text-center border-t hover:bg-gray-50 transition"
                  >
                    <td className="py-1 px-2 border">{formatDate(rec.date)}</td>
                    <td className="py-1 px-2 border">{rec.product}</td>
                    <td className="py-1 px-2 border">{rec.openingBalance}</td>
                    <td className="py-1 px-2 border">{rec.receiptQty}</td>
                    <td className="py-1 px-2 border">{rec.issuedQty}</td>
                    <td className="py-1 px-2 border">{rec.issuencePurpose}</td>
                    <td className="py-1 px-2 border">{rec.perRef}</td>
                    <td className="py-1 px-2 border">{rec.balanceQty}</td>
                    <td className="py-1 px-2 border">{rec.whiInitial}</td>
                    <td
                      className={`py-1 px-2 border font-semibold ${rec.doVerified === "Verified"
                        ? "text-green-600"
                        : "text-red-500"
                        }`}
                    >
                      {rec.doVerified}
                    </td>

                    <td className="py-1 px-2 border">{rec.doEmail || "-"}</td>
                    <td className="py-1 px-2 border flex gap-1 justify-center">
                      {rec.doVerified === "DO Not Verified" ? (
                        <>
                          <button
                            onClick={() => handleVerify(rec._id)}
                            className="bg-blue-600 text-white px-2 py-0.5 text-xs rounded-sm hover:bg-blue-700 transition"
                          >
                            Verify
                          </button>

                          <button
                            onClick={() => handleDelete(rec._id)}
                            className="bg-red-600 text-white px-2 py-0.5 text-xs rounded-sm hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500">✔ Verified</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}