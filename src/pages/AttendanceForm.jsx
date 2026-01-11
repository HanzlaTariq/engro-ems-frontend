import React, { useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import API from "../utils/api.js";

export default function AttendanceForm({ onSuccess }) {
  const { user } = React.useContext(AuthContext);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    timeIn: "09:30",
    timeOut: "17:30",
    extraTime: "",
    directDiversion: "",
    totalHandling: "",
    whiSignature: user?.name || "",
  });
  useEffect(() => {
    if (user?.name) {
      setForm((prev) => ({ ...prev, whiSignature: user.name }));
    }
  }, [user]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Function to calculate extra time
  const calculateExtraTime = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return "";

    const [inHours, inMinutes] = timeIn.split(":").map(Number);
    const [outHours, outMinutes] = timeOut.split(":").map(Number);

    const start = new Date();
    start.setHours(inHours, inMinutes, 0);

    const end = new Date();
    end.setHours(outHours, outMinutes, 0);

    let diffMs = end - start;
    let diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 0) return "";

    const workingMinutes = 8 * 60; // 8 hours = 480 minutes
    const extra = diffMinutes - workingMinutes;

    if (extra > 0) {
      const h = Math.floor(extra / 60);
      const m = extra % 60;
      return `${h}h ${m}m`;
    }
    return "0h 0m";
  };

  // 🔹 Auto-update extraTime when timeIn or timeOut changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      extraTime: calculateExtraTime(prev.timeIn, prev.timeOut),
    }));
  }, [form.timeIn, form.timeOut]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.date) newErrors.date = "Date is required";
    if (!form.timeIn) newErrors.timeIn = "Time In is required";
    if (!form.timeOut) newErrors.timeOut = "Time Out is required";
    if (!form.whiSignature) newErrors.whiSignature = "Signature is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  setIsLoading(true);

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please login first!',
      });
      return;
    }

    const res = await API.post("/api/attendance", form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Saved ✅", res.data);
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Attendance Added Successfully!',
      timer: 2000,
      showConfirmButton: false,
    });

    // Reset form
    setForm({
      date: new Date().toISOString().split("T")[0],
      timeIn: "09:30",
      timeOut: "17:30",
      extraTime: "",
      directDiversion: "",
      totalHandling: "",
      whiSignature: user?.email || "",
    });
    setErrors({});
    if (onSuccess) onSuccess();

  } catch (err) {
    console.error("Save failed ❌", err.response?.data || err.message);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || err.message,
    });
  } finally {
    setIsLoading(false);
  }
};


  const inputFields = [
    { name: "date", label: "Date", type: "date" },
    { name: "timeIn", label: "Time In", type: "time" },
    { name: "timeOut", label: "Time Out", type: "time" },
    { name: "directDiversion", label: "Direct Diversion", type: "number" },
    { name: "totalHandling", label: "Total Handling", type: "number" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Attendance Form</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inputFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field.name] ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors[field.name] && (
                <p className="text-sm text-red-500 mt-1">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          {/* 🔹 Auto-calculated Extra Time (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extra Time
            </label>
            <input
              type="text"
              name="extraTime"
              value={form.extraTime}
              readOnly
              className="w-full border rounded-md px-3 py-2 bg-gray-100"
            />
          </div>

          {/* Signature full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WareHouse Incharge
            </label>
            <input
              type="text"
              name="whiSignature"
              value={form.whiSignature}
              onChange={handleChange}
              readOnly
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.whiSignature ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.whiSignature && (
              <p className="text-sm text-red-500 mt-1">
                {errors.whiSignature}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mt-6 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Attendance"}
        </button>
      </form>
    </div>
  );
}
