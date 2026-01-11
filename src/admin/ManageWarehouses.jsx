import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function ManageWarehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    province: "",
    city: "",
    address: "",
    capacity: "",
    contactPerson: "",
    contactPhone: ""
  });

  const [editData, setEditData] = useState({
    name: "",
    location: "",
    province: "",
    city: "",
    address: "",
    capacity: "",
    contactPerson: "",
    contactPhone: ""
  });


  const getToken = () => {
    // Pehle adminToken check karo, fir token check karo
    return localStorage.getItem("adminToken") || localStorage.getItem("token");
  };

  // Fetch warehouses
 const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const token = getToken(); // ✅ YEH USE KARO

      const res = await api.get("/api/warehouses", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWarehouses(res.data);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      alert(err.response?.data?.message ||err);
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add warehouse
  const handleAdd = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.province || !formData.city) {
      return alert("Please fill all required fields");
    }

    setLoading(true);
    try {
      const token = getToken();

      await api.post("/api/warehouses", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form after adding
      setFormData({
        name: "",
        location: "",
        province: "",
        city: "",
        address: "",
        capacity: "",
        contactPerson: "",
        contactPhone: ""
      });

      fetchWarehouses();
    } catch (err) {
      console.error("Error adding warehouse:", err);
      alert(err.response?.data?.message || "Error adding warehouse");
    } finally {
      setLoading(false);
    }
  };

  // Delete warehouse
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) return;

    try {
      const token = getToken();

      await api.delete(`/api/warehouses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchWarehouses();
    } catch (err) {
      console.error("Error deleting warehouse:", err);
      alert(err.response?.data?.message || "Error deleting warehouse");
    }
  };

  // Start editing
  const startEdit = (warehouse) => {
    setEditingId(warehouse._id);
    setEditData({
      name: warehouse.name || "",
      location: warehouse.location || "",
      province: warehouse.province || "",
      city: warehouse.city || "",
      address: warehouse.address || "",
      capacity: warehouse.capacity || "",
      contactPerson: warehouse.contactPerson || "",
      contactPhone: warehouse.contactPhone || ""
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({
      name: "",
      location: "",
      province: "",
      city: "",
      address: "",
      capacity: "",
      contactPerson: "",
      contactPhone: ""
    });
  };

  // Save edit
  const handleEdit = async (id) => {
    if (!editData.name || !editData.location || !editData.province || !editData.city) {
      return alert("Please fill all required fields");
    }

    try {
      const token = getToken();

      await api.put(`/api/warehouses/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditingId(null);
      fetchWarehouses();
    } catch (err) {
      console.error("Error updating warehouse:", err);
      alert(err.response?.data?.message || "Error updating warehouse");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Warehouse Management
          </h1>
          <p className="text-gray-600">
            Manage your warehouse locations efficiently
          </p>
        </div>

        {/* Add Warehouse Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add New Warehouse
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse Name_Id *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter warehouse name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Area *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location area"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Province *
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Enter province"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (MT)
                  </label>
                  <input
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Enter warehouse capacity"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Enter contact person name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="Enter contact phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </div>
                ) : (
                  "Add Warehouse"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Warehouses List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Warehouse List ({warehouses.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Loading warehouses...
              </div>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No warehouses found</p>
              <p className="text-gray-400">Add your first warehouse to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {warehouses.map((wh) => (
                <div key={wh._id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  {editingId === wh._id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name_Id*</label>
                          <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                          <input
                            type="text"
                            name="location"
                            value={editData.location}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                          <input
                            type="text"
                            name="province"
                            value={editData.province}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={editData.city}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                          <input
                            type="text"
                            name="capacity"
                            value={editData.capacity}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                          <input
                            type="text"
                            name="contactPerson"
                            value={editData.contactPerson}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                          name="address"
                          value={editData.address}
                          onChange={handleEditInputChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(wh._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {wh.name}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{wh.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>📍 {wh.city}, {wh.province}</span>
                            </div>
                            {wh.capacity && (
                              <div className="flex items-center gap-2">
                                <span>📏 {wh.capacity} sq ft</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            {wh.contactPerson && (
                              <div className="flex items-center gap-2">
                                <span>👤 {wh.contactPerson}</span>
                              </div>
                            )}
                            {wh.contactPhone && (
                              <div className="flex items-center gap-2">
                                <span>📞 {wh.contactPhone}</span>
                              </div>
                            )}
                            {wh.address && (
                              <div className="text-xs text-gray-500">
                                {wh.address}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(wh)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(wh._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}