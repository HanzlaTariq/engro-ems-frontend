import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AdminAuthContext } from "./context/AdminAuthContext";
import API from "../utils/api";

export default function ManageUsers() {
  const { admin, adminToken } = useContext(AdminAuthContext);  // adminToken destructure  
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    province: "",
    address: "",
    role: "warehouse_manager",
    warehouse: "" // for warehouse manager
  });

  // Assignment form state
  const [assignment, setAssignment] = useState({
    userId: "",
    warehouseIds: []
  });

  // ✅ Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/users", {
        headers: { Authorization: `Bearer ${adminToken}` }  // ✅ Token add
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch all warehouses
  const fetchWarehouses = async () => {
    try {
      const res = await API.get("/api/warehouses", {
        headers: { Authorization: `Bearer ${adminToken}` }  // ✅ Token add
      });
      setWarehouses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Add new user (DO or Warehouse Manager)
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {

      // Prepare data based on role
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        phone: newUser.phone,
        city: newUser.city,
        province: newUser.province,
        address: newUser.address
      };

      // Add warehouse only for warehouse managers
      if (newUser.role === "warehouse_manager") {
        userData.warehouse = newUser.warehouse;
      }

      await API.post("/api/users/add", userData, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      alert(`✅ ${newUser.role === "DO" ? "Distribution Officer" : "Warehouse Manager"} added successfully!`);
      setShowAddModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        phone: "",
        city: "",
        province: "",
        address: "",
        role: "warehouse_manager",
        warehouse: ""
      });
      fetchUsers();
    } catch (err) {
      console.error("❌ Failed to add user:", err);
      alert(err.response?.data?.msg || "Error adding user!");
    }
  };

  // ✅ Assign warehouses to DO
  const handleAssignWarehouses = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/users/assign-warehouses", assignment, {
        headers: { Authorization: `Bearer ${adminToken}` }  // ✅ Token add
      });
      alert("✅ Warehouses assigned successfully!");
      setShowAssignModal(false);
      setAssignment({ userId: "", warehouseIds: [] });
      fetchUsers();
    } catch (err) {
      console.error("❌ Failed to assign warehouses:", err);
      alert(err.response?.data?.msg || "Error assigning warehouses!");
    }
  };

  // ✅ Handle warehouse selection for assignment
  const handleWarehouseSelect = (warehouseId) => {
    setAssignment(prev => {
      const isSelected = prev.warehouseIds.includes(warehouseId);
      return {
        ...prev,
        warehouseIds: isSelected
          ? prev.warehouseIds.filter(id => id !== warehouseId)
          : [...prev.warehouseIds, warehouseId]
      };
    });
  };

  // ✅ Open assign modal for specific DO
  const openAssignModal = (user) => {
    if (user.role !== "DO") {
      alert("Only DO can be assigned warehouses!");
      return;
    }

    setSelectedUser(user);
    setAssignment({
      userId: user._id,
      warehouseIds: user.warehouses || []
    });
    setShowAssignModal(true);
  };

  // ✅ Handle user status toggle
  const handleToggleStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus === "active" ? "deactivate" : "activate"} this user?`)) return;

    try {
      await API.put(`/api/users/${userId}/status`, {
        status: currentStatus === "active" ? "inactive" : "active"
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }  // ✅ Token add
      });

      alert(`✅ User ${currentStatus === "active" ? "deactivated" : "activated"} successfully!`);
      fetchUsers();
    } catch (err) {
      console.error("❌ Status update failed:", err);
      alert("Error updating user status!");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchWarehouses();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          👥 Manage Users
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Add New User
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-600">Loading users...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-200 text-gray-800 uppercase text-xs">
              <tr>
                <th className="py-3 px-4 border">Name</th>
                <th className="py-3 px-4 border">Email</th>
                <th className="py-3 px-4 border">Phone</th>
                <th className="py-3 px-4 border">Role</th>
                <th className="py-3 px-4 border">City/Province</th>
                <th className="py-3 px-4 border">Assigned Warehouses</th>
                <th className="py-3 px-4 border">Status</th>
                <th className="py-3 px-4 border">Created At</th>
                <th className="py-3 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="text-center border-t hover:bg-gray-50 transition"
                  >
                    <td className="py-2 px-4 border">{user.name || "-"}</td>
                    <td className="py-2 px-4 border">{user.email}</td>
                    <td className="py-2 px-4 border">{user.phone || "-"}</td>
                    <td className="py-2 px-4 border">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === "DO"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {user.role === "DO" ? "Distribution Officer" : "Warehouse Manager"}
                      </span>
                    </td>
                    <td className="py-2 px-4 border">
                      {user.city ? `${user.city}, ${user.province}` : "-"}
                    </td>
                    <td className="py-2 px-4 border">
                      {user.role === "DO" ? (
                        user.warehouses && user.warehouses.length > 0 ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            {user.warehouses.length} warehouse(s)
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">Not assigned</span>
                        )
                      ) : (
                        <span className="text-blue-600 text-xs">Single Warehouse</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {user.status || "active"}
                      </span>
                    </td>
                    <td className="py-2 px-4 border">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border space-x-2">
                      {/* Assign Warehouses Button - Only for DO */}
                      {user.role === "DO" && (
                        <button
                          onClick={() => openAssignModal(user)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-xs"
                        >
                          Assign WH
                        </button>
                      )}

                      {/* Toggle Status Button */}
                      <button
                        onClick={() => handleToggleStatus(user._id, user.status)}
                        className={`px-3 py-1 rounded text-white text-xs ${user.status === "active"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                          } transition`}
                      >
                        {user.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="warehouse_manager">Warehouse Manager</option>
                      {/* <option value="DO">Distribution Officer (DO)</option> */}
                    </select>
                  </div>
                </div>

                {/* Address & Warehouse Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Location & Assignment</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province
                    </label>
                    <select
                      value={newUser.province}
                      onChange={(e) => setNewUser({ ...newUser, province: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Province</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Sindh">Sindh</option>
                      <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                      <option value="Azad Kashmir">Azad Kashmir</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={newUser.city}
                      onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={newUser.address}
                      onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Warehouse Assignment - Only for Warehouse Managers */}
                  {newUser.role === "warehouse_manager" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign Warehouse
                      </label>
                      <select
                        value={newUser.warehouse}
                        onChange={(e) => setNewUser({ ...newUser, warehouse: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Warehouse</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse._id} value={warehouse._id}>
                            {warehouse.name} - {warehouse.location}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Warehouses Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              Assign Warehouses to {selectedUser?.name || selectedUser?.email}
            </h2>
            <form onSubmit={handleAssignWarehouses}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Warehouses
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {warehouses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No warehouses found</p>
                  ) : (
                    warehouses.map((warehouse) => (
                      <div key={warehouse._id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`wh-${warehouse._id}`}
                          checked={assignment.warehouseIds.includes(warehouse._id)}
                          onChange={() => handleWarehouseSelect(warehouse._id)}
                          className="mr-2"
                        />
                        <label htmlFor={`wh-${warehouse._id}`} className="text-sm">
                          {warehouse.name} - {warehouse.location}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {assignment.warehouseIds.length} warehouse(s)
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Assign Warehouses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}