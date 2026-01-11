import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminAuthContext } from "./context/AdminAuthContext";
import Swal from 'sweetalert2';
import API from "../utils/api";
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function ManagequarterlySpotCheck() {
  const { admin, adminToken, loading: authLoading } = useContext(AdminAuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'verified', 'pending'

  const fetchRecords = async () => {
    try {
      setLoading(true);
      if (!adminToken) {
        alert("Admin token missing – re-login.");
        return;
      }

      const res = await API.get("/api/quarterly-spot-check", {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      let data = res.data;
      console.log("API Response:", data);

      if (data && data.records) {
        setRecords(data.records);
      }
      else if (Array.isArray(data)) {
        setRecords(data);
      }
      else if (data && data.data) {
        setRecords(Array.isArray(data.data) ? data.data : [data.data]);
      }
      else {
        setRecords([]);
        console.warn("Unexpected response format:", data);
      }

    } catch (err) {
      console.error("Failed to fetch:", err.response?.data || err);
      alert("Failed to fetch records: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    const confirm = await Swal.fire({
      title: 'Verify quarterly Spot Check?',
      text: "This action will mark the record as verified.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, verify it!',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    try {
      setVerifyingId(id);
      
      if (!admin?.email || !adminToken) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Admin details missing. Please re-login.',
        });
        return;
      }

      const requestData = {
        adminEmail: admin.email,
        verifiedBy: admin.name || admin.email,
        verified: true,
        verificationDate: new Date().toISOString()
      };

      let response;
      try {
        response = await API.put(
          `/api/quarterly-spot-check/verify/${id}`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (putError) {
        try {
          response = await API.patch(
            `/api/quarterly-spot-check/verify/${id}`,
            {
              verifiedBy: `${admin.name || admin.email}`,
              status: "Verified",
              ...requestData
            },
            {
              headers: {
                Authorization: `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (patchError) {
          throw patchError;
        }
      }

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
    } finally {
      setVerifyingId(null);
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
        `/api/quarterly-spot-check/${id}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'The quarterly Spot Check record has been deleted successfully.',
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

  const viewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedRecord(null);
  };

  const openVerificationView = (record) => {
    setSelectedRecord(record);
    setShowDetails(true);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    if (isoDate.$date) {
      isoDate = isoDate.$date;
    }
    const d = new Date(isoDate);
    return isNaN(d.getTime())
      ? "Invalid Date"
      : `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  // Filter records based on active tab
  const filteredRecords = Array.isArray(records) ? records.filter(rec => {
    const isVerified = rec.verifiedBy === "Verified" || rec.status === "Verified";
    const isPending = !isVerified;

    switch (activeTab) {
      case 'verified':
        return isVerified;
      case 'pending':
        return isPending;
      default:
        return true;
    }
  }) : [];

  // Check if record is pending verification
  const isPendingVerification = (record) => {
    // Only consider explicitly "Verified" - not strings containing "Verified"
    return !(record.verifiedBy === "Verified" || record.status === "Verified");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Quarterly Spot Checks
            </h1>
            <p className="text-gray-600 mt-2">
              Review and verify quarterly spot check submissions
            </p>
          </div>
          <button
            onClick={fetchRecords}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            All Records ({records.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            <ClockIcon className="w-4 h-4" />
            Pending Verification ({filteredRecords.filter(r => isPendingVerification(r)).length})
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'verified' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            <CheckCircleIcon className="w-4 h-4" />
            Verified ({filteredRecords.filter(r => !isPendingVerification(r)).length})
          </button>
        </div>

        

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 mt-4">Loading records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <EyeIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No records found
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'all' ? 'No spot check records available.' :
                    activeTab === 'pending' ? 'All records have been verified.' :
                      'No verified records found.'}
                </p>
              </div>
            ) : (
              filteredRecords.map((rec) => (
                <div
                  key={rec._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-500">
                            {formatDate(rec.date)}
                          </span>
                          {isPendingVerification(rec) ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              Pending
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rec.warehouseIncharge || "Unknown Incharge"}
                        </h3>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{rec.stocks?.length || 0}</div>
                        <div className="text-xs text-gray-500">Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{rec.fireExtinguishers?.length || 0}</div>
                        <div className="text-xs text-gray-500">Fire Ext.</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{rec.srlHarness?.length || 0}</div>
                        <div className="text-xs text-gray-500">SRL/Harness</div>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ELCB Status:</span>
                        <span className={`text-sm font-medium ${rec.elcb?.quarterly?.comment ? 'text-green-600' : 'text-gray-400'}`}>
                          {rec.elcb?.quarterly?.comment || "Not checked"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Earthing:</span>
                        <span className={`text-sm font-medium ${rec.earthingHealth?.comment ? 'text-green-600' : 'text-gray-400'}`}>
                          {rec.earthingHealth?.comment || "Not checked"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {isPendingVerification(rec) ? (
                        <button
                          onClick={() => openVerificationView(rec)}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2.5 rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Review & Verify
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => viewDetails(rec)}
                            className="flex-1 bg-gray-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDelete(rec._id)}
                            className="px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete record"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Verified Info */}
                    {!isPendingVerification(rec) && rec.verifiedBy && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Verified by: <span className="font-medium text-gray-700">{rec.verifiedBy}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Verification Modal */}
        {showDetails && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    quarterly Spot Check Review
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-600">{formatDate(selectedRecord.date)}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">{selectedRecord.warehouseIncharge}</span>
                    {isPendingVerification(selectedRecord) && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                        ⏳ Verification Required
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeDetails}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                {/* Verification Banner for pending records */}
                {isPendingVerification(selectedRecord) && (
                  <div className="mb-8 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                          <ClockIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-amber-800 mb-2">
                          Verification Required
                        </h3>
                        <p className="text-amber-700 mb-4">
                          Please review all details below before verifying this spot check. Once verified, the record will be marked as completed.
                        </p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleVerify(selectedRecord._id)}
                            disabled={verifyingId === selectedRecord._id}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {verifyingId === selectedRecord._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Verifying...
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="w-5 h-5" />
                                Verify & Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={closeDetails}
                            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel Review
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-700">Date:</h3>
                    <p>{formatDate(selectedRecord.date)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Warehouse Incharge:</h3>
                    <p>{selectedRecord.warehouseIncharge}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Status:</h3>
                    <p className={`font-semibold ${selectedRecord.verifiedBy === "Verified" || selectedRecord.status === "Verified"
                      ? "text-green-600"
                      : "text-red-500"
                      }`}>
                      {selectedRecord.verifiedBy || "Pending"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Created At:</h3>
                    <p>{formatDate(selectedRecord.createdAt)}</p>
                  </div>
                </div>

                {/* Stocks Section */}
                {selectedRecord.stocks && selectedRecord.stocks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">📦 Stocks</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-2 px-4 border">Item</th>
                            <th className="py-2 px-4 border">System Qty</th>
                            <th className="py-2 px-4 border">Physical Count</th>
                            <th className="py-2 px-4 border">Loose Product</th>
                            <th className="py-2 px-4 border">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRecord.stocks.map((stock, index) => (
                            <tr key={index}>
                              <td className="py-2 px-4 border">{stock.item}</td>
                              <td className="py-2 px-4 border">{stock.sitQty}</td>
                              <td className="py-2 px-4 border">{stock.physicalCount}</td>
                              <td className="py-2 px-4 border">{stock.looseProduct}</td>
                              <td className="py-2 px-4 border">{stock.remarks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ELCB Section */}
                {(selectedRecord.elcb?.quarterly || selectedRecord.elcb?.quarterly) && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">⚡ ELCB Check</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRecord.elcb?.quarterly && (
                        <div className="border p-3 rounded">
                          <h4 className="font-semibold">Weekly</h4>
                          <p><span className="font-medium">Month:</span> {selectedRecord.elcb.weekly.month || "-"}</p>
                          <p><span className="font-medium">WHI:</span> {selectedRecord.elcb.weekly.whi || "-"}</p>
                          <p><span className="font-medium">Electrician:</span> {selectedRecord.elcb.weekly.electrician || "-"}</p>
                          <p><span className="font-medium">Comment:</span> {selectedRecord.elcb.weekly.comment || "-"}</p>
                        </div>
                      )}
                      {selectedRecord.elcb?.quarterly && (
                        <div className="border p-3 rounded">
                          <h4 className="font-semibold">Quarterly</h4>
                          <p><span className="font-medium">Month:</span> {selectedRecord.elcb.quarterly.month || "-"}</p>
                          <p><span className="font-medium">WHI:</span> {selectedRecord.elcb.quarterly.whi || "-"}</p>
                          <p><span className="font-medium">Electrician:</span> {selectedRecord.elcb.quarterly.electrician || "-"}</p>
                          <p><span className="font-medium">Comment:</span> {selectedRecord.elcb.quarterly.comment || "-"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Earthing Health */}
                {selectedRecord.earthingHealth && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">🔌 Earthing Health</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-3 rounded">
                      <p><span className="font-medium">Month:</span> {selectedRecord.earthingHealth.month || "-"}</p>
                      <p><span className="font-medium">Ohm:</span> {selectedRecord.earthingHealth.ohm || "-"}</p>
                      <p><span className="font-medium">Electrician:</span> {selectedRecord.earthingHealth.electrician || "-"}</p>
                      <p><span className="font-medium">Stamp:</span> {selectedRecord.earthingHealth.stamp || "-"}</p>
                      <p><span className="font-medium">Comment:</span> {selectedRecord.earthingHealth.comment || "-"}</p>
                    </div>
                  </div>
                )}

                {/* Stitching Machine */}
                {selectedRecord.stitchingMachine && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">🪡 Stitching Machine</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-3 rounded">
                      <p><span className="font-medium">Condition:</span> {selectedRecord.stitchingMachine.condition || "-"}</p>
                      <p><span className="font-medium">Condition Remark:</span> {selectedRecord.stitchingMachine.conditionRemark || "-"}</p>
                      <p><span className="font-medium">Cord:</span> {selectedRecord.stitchingMachine.cord || "-"}</p>
                      <p><span className="font-medium">Cord Remark:</span> {selectedRecord.stitchingMachine.cordRemark || "-"}</p>
                      <p><span className="font-medium">Oil:</span> {selectedRecord.stitchingMachine.oil || "-"}</p>
                      <p><span className="font-medium">Oil Remark:</span> {selectedRecord.stitchingMachine.oilRemark || "-"}</p>
                    </div>
                  </div>
                )}

                {/* Weighing Scale */}
                {selectedRecord.weighingScale && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">⚖️ Weighing Scale</h3>
                    <div className="grid grid-cols-2 gap-4 border p-3 rounded">
                      <p><span className="font-medium">Condition:</span> {selectedRecord.weighingScale.condition || "-"}</p>
                      <p><span className="font-medium">Remarks:</span> {selectedRecord.weighingScale.remarks || "-"}</p>
                    </div>
                  </div>
                )}

                {/* UPS Battery */}
                {selectedRecord.upsBattery && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">🔋 UPS Battery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border p-3 rounded">
                      <p><span className="font-medium">Charging:</span> {selectedRecord.upsBattery.charging || "-"}</p>
                      <p><span className="font-medium">Charging Remarks:</span> {selectedRecord.upsBattery.chargingRemarks || "-"}</p>
                      <p><span className="font-medium">Condition:</span> {selectedRecord.upsBattery.condition || "-"}</p>
                      <p><span className="font-medium">Condition Remarks:</span> {selectedRecord.upsBattery.conditionRemarks || "-"}</p>
                    </div>
                  </div>
                )}

                {/* Warehouse Agreement (Permanent & Temporary) */}
                {selectedRecord.warehouseAgreement && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">🏬 Warehouse Agreement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border p-3 rounded">
                        <h4 className="font-semibold mb-2">Permanent</h4>
                        <p><span className="font-medium">Sq.ft:</span> {selectedRecord.warehouseAgreement.permanentSqft || "-"}</p>
                        <p><span className="font-medium">Expiry:</span> {formatDate(selectedRecord.warehouseAgreement.permanentExpiry)}</p>
                        <p><span className="font-medium">Remarks:</span> {selectedRecord.warehouseAgreement.remarksSqft || "-"}</p>
                      </div>
                      <div className="border p-3 rounded">
                        <h4 className="font-semibold mb-2">Temporary</h4>
                        <p><span className="font-medium">Sq.ft:</span> {selectedRecord.warehouseAgreement.temporarySqft || "-"}</p>
                        <p><span className="font-medium">Expiry:</span> {formatDate(selectedRecord.warehouseAgreement.temporaryExpiry)}</p>
                        <p><span className="font-medium">Remarks:</span> {selectedRecord.warehouseAgreement.remarksExpiry || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Govt Certificate */}
                {selectedRecord.govtCertificate && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">📄 Government Certificates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRecord.govtCertificate.weighingScale && (
                        <div className="border p-3 rounded">
                          <h4 className="font-semibold">Weighing Scale Certificate</h4>
                          <p><span className="font-medium">From:</span> {formatDate(selectedRecord.govtCertificate.weighingScale.from)}</p>
                          <p><span className="font-medium">To:</span> {formatDate(selectedRecord.govtCertificate.weighingScale.to)}</p>
                          <p><span className="font-medium">Reminder Date:</span> {formatDate(selectedRecord.govtCertificate.weighingScale.reminderDate)}</p>
                        </div>
                      )}
                      {selectedRecord.govtCertificate.warehouseReg && (
                        <div className="border p-3 rounded">
                          <h4 className="font-semibold">Warehouse Registration</h4>
                          <p><span className="font-medium">From:</span> {formatDate(selectedRecord.govtCertificate.warehouseReg.from)}</p>
                          <p><span className="font-medium">To:</span> {formatDate(selectedRecord.govtCertificate.warehouseReg.to)}</p>
                          <p><span className="font-medium">Reminder Date:</span> {formatDate(selectedRecord.govtCertificate.warehouseReg.reminderDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fire Extinguishers */}
                {selectedRecord.fireExtinguishers && selectedRecord.fireExtinguishers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">🧯 Fire Extinguishers ({selectedRecord.fireExtinguishers.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRecord.fireExtinguishers.map((fire, index) => (
                        <div key={index} className="border p-3 rounded">
                          <h4 className="font-semibold">Extinguisher #{index + 1}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <p><span className="font-medium">Last Refill:</span> {formatDate(fire.lastRefill)}</p>
                            <p><span className="font-medium">Expiry:</span> {formatDate(fire.expiry)}</p>
                            <p><span className="font-medium">Pressure:</span> {fire.pressure}</p>
                            <p><span className="font-medium">Nozzle:</span> {fire.nozzle}</p>
                            <p><span className="font-medium">Seal:</span> {fire.seal}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Ramp */}
                {selectedRecord.safetyRamp && selectedRecord.safetyRamp.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">🛡️ Safety Ramp ({selectedRecord.safetyRamp.length})</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-2 px-4 border text-left">Safety Ramp Description</th>
                            <th className="py-2 px-4 border">Frequency</th>
                            <th className="py-2 px-4 border">Status</th>
                            <th className="py-2 px-4 border">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            "Is rubber surface of safety ramp and handrail rubber grip properly glued. Also grip not hanging with handrail?",
                            "Side stability holder and intact with ramp also check all the welded joint found no crack or damage",
                            "All the nut bolt are properly tight and fitted. Iron strip beneath the safety ramp and handrail is properly fitted and welded with frame",
                            "Closely inspected the wooden plank from beneath and found no major crack also rubber surface cleaned with brush & water",
                            "Air pressure is good enough for easy movement. Also Tires, wheel axel and ball bearing are in working condition",
                          ].map((description, index) => (
                            <tr key={index}>
                              <td className="py-2 px-4 border text-sm">{description}</td>
                              <td className="py-2 px-4 border text-center">{selectedRecord.safetyRamp[index]?.frequently || "-"}</td>
                              <td className="py-2 px-4 border text-center">
                                <span className={selectedRecord.safetyRamp[index]?.status === "Good" ? "text-green-600 font-semibold" : selectedRecord.srlHarness[index]?.status === "Poor" ? "text-red-600 font-semibold" : "text-gray-400"}>
                                  {selectedRecord.safetyRamp[index]?.status || "-"}
                                </span>
                              </td>
                              <td className="py-2 px-4 border">{selectedRecord.safetyRamp[index]?.remarks || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SRL Harness */}
                {selectedRecord.srlHarness && selectedRecord.srlHarness.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">🪢 SRL Harness ({selectedRecord.srlHarness.length})</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-2 px-4 border text-left">SRL Description</th>
                            <th className="py-2 px-4 border">Frequency</th>
                            <th className="py-2 px-4 border">Status</th>
                            <th className="py-2 px-4 border">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              text: "Lifeline lock up when received sharp jerks, also harness in good shape & has no damage in harness webbing & belts as well pulled stitches and broken fiber.",
                              freq: "Monthly",
                            },
                            {
                              text: "Is the snap hook operating freely, correctly, not bent, no crack, no damage sign. Buckles have no distortion, crack or break.",
                              freq: "Monthly",
                            },
                            {
                              text: "Inspect the iron cable installed between pillars for cuts, corrosion, damage. Inspect device cable/rope for cuts, nicks, broken wires.",
                              freq: "Monthly",
                            },
                            {
                              text: "All bolts of iron frame/anchorage with pillar/roof properly fixed. Welded joints have no cracks.",
                              freq: "Quarterly",
                            },
                            {
                              text: "Plumb used to bind iron cable with U-turn buckle not loose, no damage, no cracks on SRL unit.",
                              freq: "Quarterly",
                            },
                          ].map((item, index) => (
                            <tr key={index}>
                              <td className="py-2 px-4 border text-sm">{item.text}</td>
                              <td className="py-2 px-4 border text-center">{item.freq}</td>
                              <td className="py-2 px-4 border text-center">
                                <span className={selectedRecord.srlHarness[index]?.status === "Good" ? "text-green-600 font-semibold" : selectedRecord.srlHarness[index]?.status === "Poor" ? "text-red-600 font-semibold" : "text-gray-400"}>
                                  {selectedRecord.srlHarness[index]?.status || "-"}
                                </span>
                              </td>
                              <td className="py-2 px-4 border">{selectedRecord.srlHarness[index]?.remarks || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Emergency Numbers */}
                {selectedRecord.emergencyNumbers && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">🚨 Emergency Numbers</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedRecord.emergencyNumbers.fireBrigade && (
                        <div>
                          <p className="font-medium">Fire Brigade:</p>
                          <p>{selectedRecord.emergencyNumbers.fireBrigade}</p>
                        </div>
                      )}
                      {selectedRecord.emergencyNumbers.rescue && (
                        <div>
                          <p className="font-medium">Rescue:</p>
                          <p>{selectedRecord.emergencyNumbers.rescue}</p>
                        </div>
                      )}
                      {selectedRecord.emergencyNumbers.civilDefense && (
                        <div>
                          <p className="font-medium">Civil Defense:</p>
                          <p>{selectedRecord.emergencyNumbers.civilDefense}</p>
                        </div>
                      )}
                      {selectedRecord.emergencyNumbers.bombDisposal && (
                        <div>
                          <p className="font-medium">Bomb Disposal:</p>
                          <p>{selectedRecord.emergencyNumbers.bombDisposal}</p>
                        </div>
                      )}
                      {selectedRecord.emergencyNumbers.nearestHospital && (
                        <div>
                          <p className="font-medium">Nearest Hospital:</p>
                          <p>{selectedRecord.emergencyNumbers.nearestHospital}</p>
                        </div>
                      )}
                      {selectedRecord.emergencyNumbers.policeStation && (
                        <div>
                          <p className="font-medium">Police Station:</p>
                          <p>{selectedRecord.emergencyNumbers.policeStation}</p>
                        </div>
                      )}
                      {selectedRecord.emergencyNumbers.districtHospital && (
                        <div>
                          <p className="font-medium">District Hospital:</p>
                          <p>{selectedRecord.emergencyNumbers.districtHospital}</p>
                        </div>
                      )}
                      {selectedRecord.emergencyNumbers.edhi && (
                        <div>
                          <p className="font-medium">Edhi:</p>
                          <p>{selectedRecord.emergencyNumbers.edhi}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Medicine Remarks */}
                {selectedRecord.medicine && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">💊 Medicine Status</h3>
                    <p className="bg-gray-50 p-3 rounded">{selectedRecord.medicine}</p>
                  </div>
                )}

                {/* General Remarks */}
                {selectedRecord.remarks && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">📝 Remarks</h3>
                    <p className="bg-gray-50 p-3 rounded">{selectedRecord.remarks}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between gap-3">
                  <button
                    onClick={closeDetails}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  {isPendingVerification(selectedRecord) && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVerify(selectedRecord._id)}
                        disabled={verifyingId === selectedRecord._id}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {verifyingId === selectedRecord._id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-5 h-5" />
                            Verify & Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(selectedRecord._id)}
                        className="px-6 py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}