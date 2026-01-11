import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import API from "../utils/api.js";
export default function SafetyTalkForm({ onSuccess }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    conductedBy: "",
    noOfLabours: "",
    hcPresent: "Yes",
    topic: "",
    remarks: "",
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
    if (!form.conductedBy) newErrors.conductedBy = "This field is required";
    if (!form.noOfLabours) newErrors.noOfLabours = "Enter number of labours";
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

    await API.post("/api/safety-talk", form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Safety Talk Saved ✅", form);
    Swal.fire({
      icon: 'success',
      title: 'Recorded!',
      text: 'Safety Talk labour recorded successfully!',
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
      remarks: "",
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
        <h1 className="text-2xl font-bold mb-6 text-center">Safety Talk Record(With_Labour)</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No of Labours
            </label>
            <input
              type="number"
              name="noOfLabours"
              value={form.noOfLabours}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.noOfLabours ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.noOfLabours && (
              <p className="text-sm text-red-500 mt-1">{errors.noOfLabours}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              H/C Present
            </label>
            <select
              name="hcPresent"
              value={form.hcPresent}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>

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
              <option value="Wear PPE –Lungi, Wrist band, Head band, etc">Wear PPE –Lungi, Wrist band, Head band, etc</option>
              <option value="Store safely – keep fertilizer dry, away from heat and moisture.">Store safely – keep fertilizer dry, away from heat and moisture.</option>
              <option value="Avoid spills – clean immediately and safely.">Avoid spills – clean immediately and safely.</option>
              <option value="Wash hands after handling; do not eat/drink in handling areas.">Wash hands after handling; do not eat/drink in handling areas.</option>
              <option value="Follow label instructions for each chemical.">Follow label instructions for each chemical.</option>
              <option value="Report spills, leaks, injuries, and unsafe conditions to supervisor.">Report spills, leaks, injuries, and unsafe conditions to supervisor.</option>
              <option value="Properly dispose of empty containers and waste.">Properly dispose of empty containers and waste.</option>
              <option value="Attend safety training sessions and drills.">Attend safety training sessions and drills.</option>
              <option value="Report hazards or accidents immediately.">Report hazards or accidents immediately.</option>
            </select>
            {errors.topic && (
              <p className="text-sm text-red-500 mt-1">{errors.topic}</p>
            )}
          </div>

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
              <option value="">-- Select Remarks --</option>
              <option value="Excellent">
                Excellent 
              </option>
              <option value="Good">Good</option>
              <option value="Bad">Bad</option>
            </select>


          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mt-6 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Safety Talk"}
        </button>
      </form>
    </div>
  );
}
