//userlevel
import React, { useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import API from "../api/axios.jsx";

export default function EmptyBagRecord({ onSuccess }) {
  const { user } = React.useContext(AuthContext);
  

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    product: "",
    openingBalance: "",
    receiptQty: "",
    issuedQty: "",
    issuencePurpose: "",
    perRef: "",
    balanceQty: "",
    whiInitial: user?.name || "",
    doVerified: "DO Not Verified", // default, no input for this
  });

  useEffect(() => {
    if (user?.name) {
      setForm((prev) => ({ ...prev, whiInitial: user.name }));
    }
  }, [user]);

  // Auto-calculate balance whenever opening balance, receipt qty, or issued qty changes
  useEffect(() => {
    const opening = parseFloat(form.openingBalance) || 0;
    const receipt = parseFloat(form.receiptQty) || 0;
    const issued = parseFloat(form.issuedQty) || 0;
    const calculated = (opening + receipt) - issued;
    setForm((prev) => ({ ...prev, balanceQty: calculated.toString() }));
  }, [form.openingBalance, form.receiptQty, form.issuedQty]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const products = [
    "E- Urea",
    "E- DAP",
    "E- ZK Plus MOP",
    "E- ZK Khas MOP",
    "E- NP Plus",
    "E- Zabardast Urea",
    "E- Tripple super phosphat",
    "E- Zingro",
    "E- SOP Powder",
    "E- SOP Granular",
    "E- Zoran",
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!form.date) newErrors.date = "Date is required";
    if (!form.product) newErrors.product = "Product is required";
    if (!form.openingBalance) newErrors.openingBalance = "Opening Balance is required";
    if (!form.receiptQty) newErrors.receiptQty = "Receipt QTY is required";
    if (!form.issuedQty) newErrors.issuedQty = "Issued QTY is required";
    if (!form.issuencePurpose) newErrors.issuencePurpose = "Issuence Purpose is required";
    if (!form.perRef) newErrors.perRef = "Per Ref is required";
    if (!form.balanceQty) newErrors.balanceQty = "Balance QTY is required";
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

    const res = await API.post("/api/empty-bag-record", form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Saved ✅", res.data);
    Swal.fire({
      icon: 'success',
      title: 'Record Added!',
      text: 'The record has been added successfully.',
      timer: 2000,
      showConfirmButton: false,
    });

    // Reset form if needed
    setForm({
      // Set default/reset values here
      date: new Date().toISOString().split("T")[0],
      field1: "",
      field2: "",
      // Add other fields as per your form
    });
    setErrors({});

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
    { name: "openingBalance", label: "Opening Balance", type: "number" },
    { name: "receiptQty", label: "Receipt QTY", type: "number" },
    { name: "issuedQty", label: "Issued QTY", type: "number" },
    { name: "issuencePurpose", label: "Issuence Purpose", type: "text" },
    { name: "perRef", label: "Per Ref", type: "text" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Empty Bag Record</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              name="product"
              value={form.product}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.product ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="">-- Select Product --</option>
              {products.map((prod) => (
                <option key={prod} value={prod}>
                  {prod}
                </option>
              ))}
            </select>
            {errors.product && (
              <p className="text-sm text-red-500 mt-1">{errors.product}</p>
            )}
          </div>

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
                <p className="text-sm text-red-500 mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* WHI Initial full width (readonly from AuthContext) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WareHouse Incharge
            </label>
            <input
              type="text"
              name="whiInitial"
              value={form.whiInitial}
              readOnly
              className={`w-full border rounded-md px-3 py-2 bg-gray-100 ${errors.whiInitial ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.whiInitial && (
              <p className="text-sm text-red-500 mt-1">{errors.whiInitial}</p>
            )}
          </div>

          {/* Balance QTY (auto-calculated, readonly) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Balance QTY (Auto-calculated)
            </label>
            <input
              type="number"
              name="balanceQty"
              value={form.balanceQty}
              readOnly
              className="w-full border rounded-md px-3 py-2 bg-gray-100 border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formula: (Opening Balance + Receipt QTY) - Issued QTY
            </p>
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
