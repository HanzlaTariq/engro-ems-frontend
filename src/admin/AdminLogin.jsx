import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AdminAuthContext } from "./context/AdminAuthContext";
import API from "../utils/api.js";
// ✅ background image import
import bgImage from "../assets/images/bg.jpeg";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useContext(AdminAuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post(
        "/api/admin/login",
        form
      );

      loginAdmin(res.data.admin, res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-end px-8">
      
      {/* 🔥 FULL SCREEN BACKGROUND */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* 🟢 LOGIN CARD */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-sm border border-gray-200"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-tr from-green-600 to-green-400 text-white rounded-2xl shadow-lg">
            <span className="text-3xl font-bold">E</span>
          </div>
          <h2 className="text-2xl font-extrabold mt-3 text-green-700">
            Engro Admin
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Administrative Panel
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-md text-sm mb-4 text-center">
            {error}
          </p>
        )}

        {/* Email */}
        <label className="block text-gray-700 font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          placeholder="admin@example.com"
        />

        {/* Password */}
        <label className="block text-gray-700 font-medium mb-1">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full mb-6 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          placeholder="Enter your password"
        />

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition
            ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {loading ? "Authenticating..." : "Login"}
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          © {new Date().getFullYear()} Engro Corp – Admin Panel
        </p>
      </form>
    </div>
  );
}
