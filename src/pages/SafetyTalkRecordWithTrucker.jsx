import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API from "../utils/api.js";

export default function SafetyTalkRecordWithTrucker({ onSuccess }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    conductedBy: "",
    truckNo: "",
    driverName: "",
    topic: "",
    remarks: "Excellent",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.date) newErrors.date = "Date is required";
    if (!form.time) newErrors.time = "Time is required";
    if (!form.conductedBy) newErrors.conductedBy = "Conducted By is required";
    if (!form.truckNo) newErrors.truckNo = "Truck No is required";
    if (!form.driverName) newErrors.driverName = "Driver Name is required";
    if (!form.topic) newErrors.topic = "Topic is required";
    return newErrors;
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

      await API.post("/api/safety-talk-trucker", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Safety Talk Trucker Saved ✅", form);
      Swal.fire({
        icon: 'success',
        title: 'Recorded!',
        text: 'Safety Talk Trucker recorded successfully!',
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset form
      setForm({
        date: new Date().toISOString().split("T")[0],
        time: "09:00",
        conductedBy: "",
        noOfLabours: "",
        hcPresent: "Yes",
        topic: "",
        remarks: "Excellent",
      });
      setErrors({});
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || "Error saving form",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Safety Talk Record (With Trucker)
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.date && (
              <p className="text-sm text-red-500 mt-1">{errors.date}</p>
            )}
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.time ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.time && (
              <p className="text-sm text-red-500 mt-1">{errors.time}</p>
            )}
          </div>

          {/* Conducted By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conducted By
            </label>
            <select
              name="conductedBy"
              value={form.conductedBy}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.conductedBy ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="">-- Select Person --</option>
              <option value="Supervisor">WareHouse Incharge</option>
             
            </select>
            {errors.conductedBy && (
              <p className="text-sm text-red-500 mt-1">{errors.conductedBy}</p>
            )}
          </div>

          {/* Truck No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Truck No
            </label>
            <input
              type="text"
              name="truckNo"
              value={form.truckNo}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.truckNo ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.truckNo && (
              <p className="text-sm text-red-500 mt-1">{errors.truckNo}</p>
            )}
          </div>

          {/* Driver Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driver Name
            </label>
            <input
              type="text"
              name="driverName"
              value={form.driverName}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.driverName ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.driverName && (
              <p className="text-sm text-red-500 mt-1">{errors.driverName}</p>
            )}
          </div>

          {/* Topic */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <select
              name="topic"
              value={form.topic}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.topic ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="">-- Select Topic --</option>
              <option value="Don't smoking in WH permises">Don't smoking in WH permises</option>
              <option value="Don't use cellphone when vehicle in movement.">Don't use cellphone when vehicle in movement.</option>
              <option value="Use of safety cones its important.">Use of safety cones its important.</option>
              <option value="Use of wooden wedges after parking the vehicle.">Use of wooden wedges after parking the vehicle.</option>
              <option value="Be extra careful when vehicle in reverse mode.">Be extra careful when vehicle in reverse mode.</option>
              <option value="Don't play any music or radio tape in WH permises.">Don't play any music or radio tape in WH permises.</option>
              <option value="Be extra careful when you pass the main gate of WH.">Be extra careful when you pass the main gate of WH.</option>
              <option value="Don't use of hooks during loading and unloading.">Don't use of hooks during loading and unloading.</option>
              <option value="Avoid Working on stack edges.">Avoid Working on stack edges.</option>
              <option value="Only healthy and fit labor are allow to work at WH.">Only healthy and fit labor are allow to work at WH.</option>
            </select>
            {errors.topic && (
              <p className="text-sm text-red-500 mt-1">{errors.topic}</p>
            )}
          </div>



          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <select
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Excellent</option>
              <option>Good</option>
              <option>Bad</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mt-6 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Safety Talk (Trucker)"}
        </button>
      </form>
    </div>
  );
}
