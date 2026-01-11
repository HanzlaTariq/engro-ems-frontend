import React, { useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import API from "../api/axios.jsx";

export default function PreNumberStationaryRecordForm({ onSuccess }) {
  const { user } = React.useContext(AuthContext);

  const [form, setForm] = useState({
    bookNo: "",
    receiptDate: new Date().toISOString().split("T")[0],
    from: "",
    to: "",
    startDate: "",
    endDate: "",
    purpose: "",
    whiInitial: user?.name || "",
    doVerified: "DO Not Verified",
  });

  useEffect(() => {
    if (user?.name) {
      setForm((prev) => ({ ...prev, whiInitial: user.name }));
    }
  }, [user]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!form.bookNo) newErrors.bookNo = "Book No is required";
    if (!form.receiptDate) newErrors.receiptDate = "Receipt Date is required";
    if (!form.from) newErrors.from = "From is required";
    if (!form.to) newErrors.to = "To is required";
    if (!form.purpose) newErrors.purpose = "Purpose is required";
    if (!form.whiInitial) newErrors.whiInitial = "WHI Initial is required";
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

    const res = await API.post(
      "/api/pre-number-stationary-record",
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Saved ✅", res.data);
    Swal.fire({
      icon: 'success',
      title: 'Record Added!',
      text: 'The record has been added successfully.',
      timer: 2000,
      showConfirmButton: false,
    });

    // Reset form
    setForm({
      bookNo: "",
      receiptDate: new Date().toISOString().split("T")[0],
      from: "",
      to: "",
      startDate:"",
      endDate: "",
      purpose: "",
      whiInitial: user?.email || "",
      doVerified: "DO Not Verified",
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
    { name: "bookNo", label: "Book No", type: "text" },
    { name: "receiptDate", label: "Receipt Date", type: "date" },
    { name: "from", label: "From", type: "text" },
    { name: "to", label: "To", type: "text" },
    { name: "startDate", label: "Start Date", type: "date" },
    { name: "endDate", label: "End Date", type: "date" },
    { name: "purpose", label: "Purpose", type: "text" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Pre Number Stationary Record</h1>

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
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[field.name] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors[field.name] && (
                <p className="text-sm text-red-500 mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* WHI Initial full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WHI Initial
            </label>
            <input
              type="text"
              name="whiInitial"
              value={form.whiInitial}
              readOnly
              className={`w-full border rounded-md px-3 py-2 bg-gray-100 ${
                errors.whiInitial ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.whiInitial && (
              <p className="text-sm text-red-500 mt-1">{errors.whiInitial}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mt-6 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Record"}
        </button>
      </form>
    </div>
  );
}