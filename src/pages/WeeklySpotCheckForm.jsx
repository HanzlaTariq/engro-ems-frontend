import React, { useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import API from "../api/axios.jsx";
export default function WeeklySpotCheckForm() {
    const { user } = React.useContext(AuthContext);    
    const [form, setForm] = useState({
        date: new Date().toISOString().split("T")[0],
        stocks: [
            { item: "Urea", sitQty: "", physicalCount: "", looseProduct: "", remarks: "" },
            { item: "EEDAP", sitQty: "", physicalCount: "", looseProduct: "", remarks: "" },
            { item: "Z(G)", sitQty: "", physicalCount: "", looseProduct: "", remarks: "" },
            { item: "Z(B)", sitQty: "", physicalCount: "", looseProduct: "", remarks: "" },
            { item: "TSP", sitQty: "", physicalCount: "", looseProduct: "", remarks: "" },
            { item: "Z(T)", sitQty: "", physicalCount: "", looseProduct: "", remarks: "" },
            { item: "SSP 25 Kg", sitQty: "", physicalCount: "", looseProduct: "", remarks: "" },
            { item: "SSP 50 Kg", sitQty: "", physicalCount: "", looseProduct: "", remarks: "" },
            { item: "MOP", sitQty: "", physicalCount: "", looseProduct: "", remarks: "" },
            { item: "Zingro", sitQty: "", physicalCount: "", looseProduct: "", remarks: "" },
        ],
        elcb: {
            weekly: { month: "", whi: "", electrician: "", comment: "" },
            quarterly: { month: "", whi: "", electrician: "", comment: "" },
        },
        earthingHealth: {
            month: "",
            ohm: "",
            electrician: "",
            stamp: "",
            comment: ""
        },
        stitchingMachine: {
            condition: "",
            conditionRemark: "",
            cord: "",
            cordRemark: "",
            oil: "",
            oilRemark: ""
        },
        weighingScale: {
            condition: "",
            remarks: ""
        },
        upsBattery: {
            charging: "",
            chargingRemarks: "",
            condition: "",
            conditionRemarks: ""
        },
        warehouseAgreement: {
            permanentSqft: "",
            temporarySqft: "",
            remarksSqft: "",
            permanentExpiry: "",
            temporaryExpiry: "",
            remarksExpiry: "",
        },
        govtCertificate: {
            weighingScale: { from: "", to: "", reminderDate: "" },
            warehouseReg: { from: "", to: "", reminderDate: "" },
        },
        fireExtinguishers: [
            { lastRefill: "", expiry: "", pressure: "", nozzle: "", seal: "" },
            { lastRefill: "", expiry: "", pressure: "", nozzle: "", seal: "" },
            { lastRefill: "", expiry: "", pressure: "", nozzle: "", seal: "" },
            { lastRefill: "", expiry: "", pressure: "", nozzle: "", seal: "" },
        ],
        safetyRamp: [
            { frequently: "Weekly", status: "", remarks: "" },
            { frequently: "Weekly", status: "", remarks: "" },
            { frequently: "Monthly", status: "", remarks: "" },
            { frequently: "Monthly", status: "", remarks: "" },
            { frequently: "Monthly", status: "", remarks: "" },
        ],
        srlHarness: [
            { status: "", remarks: "", freq: "Monthly" },
            { status: "", remarks: "", freq: "Monthly" },
            { status: "", remarks: "", freq: "Monthly" },
            { status: "", remarks: "", freq: "Quarterly" },
            { status: "", remarks: "", freq: "Quarterly" },
        ],
        emergencyNumbers: {
            fireBrigade: "",
            rescue: "",
            civilDefense: "",
            bombDisposal: "",
            nearestHospital: "",
            policeStation: "",
            districtHospital: "",
            edhi: "",
        },
        medicine: "",
        warehouseIncharge: user?.name || "",
        verifiedBy: "DO Not Verified", // default, no input for this

        remarks: "",
    });

    // Helper for stock change
    const handleStockChange = (index, key, value) => {
        const updated = [...form.stocks];
        updated[index][key] = value;
        setForm({ ...form, stocks: updated });
    };

    // Add new stock row
    const addStock = () => {
        const newStock = { item: "", sitQty: "", physicalCount: "", looseProduct: "", remarks: "" };
        setForm({ ...form, stocks: [...form.stocks, newStock] });
    };

    // Remove stock row
    const removeStock = (index) => {
        const updated = form.stocks.filter((_, i) => i !== index);
        setForm({ ...form, stocks: updated });
    };

    // Helper for fire extinguisher change
    const handleFireExtinguisherChange = (index, key, value) => {
        const updated = [...form.fireExtinguishers];
        updated[index][key] = value;
        setForm({ ...form, fireExtinguishers: updated });
    };

    // Helper for safety ramp change
    const handleSafetyRampChange = (index, key, value) => {
        const updated = [...form.safetyRamp];
        updated[index][key] = value;
        setForm({ ...form, safetyRamp: updated });
    };

    // Helper for SRL harness change
    const handleSrlHarnessChange = (index, key, value) => {
        const updated = [...form.srlHarness];
        updated[index][key] = value;
        setForm({ ...form, srlHarness: updated });
    };

    // Generic handleChange for nested objects
    const handleChange = (section, key, value, subKey = null) => {
        if (section === "stocks" || section === "fireExtinguishers" || section === "safetyRamp" || section === "srlHarness") {
            if (section === "stocks") {
                handleStockChange(key, subKey, value);
            } else if (section === "fireExtinguishers") {
                handleFireExtinguisherChange(key, subKey, value);
            } else if (section === "safetyRamp") {
                handleSafetyRampChange(key, subKey, value);
            } else if (section === "srlHarness") {
                handleSrlHarnessChange(key, subKey, value);
            }
        } else if (subKey) {
            setForm({
                ...form,
                [section]: {
                    ...form[section],
                    [key]: {
                        ...form[section][key],
                        [subKey]: value,
                    },
                },
            });
        } else {
            setForm({
                ...form,
                [section]: { ...form[section], [key]: value },
            });
        }
    };

    // Submit
  const handleSubmit = async (e) => {
  e.preventDefault();
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

    await API.post("/api/spot-check", form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    Swal.fire({
      icon: 'success',
      title: 'Saved!',
      text: 'Weekly Spot Check saved successfully!',
      timer: 2000,
      showConfirmButton: false,
    });

  } catch (err) {
    console.error("❌ Error saving", err.response?.data || err.message);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || err.message,
    });
  }
};


    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-lg rounded-xl p-6 w-full max-w-6xl"
            >
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Weekly Spot Check Form
                </h1>

                {/* Date */}
                <div className="mb-4">
                    <label className="block text-sm font-medium">Date</label>
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="border rounded-md px-3 py-2 w-full"
                    />
                </div>

                {/* Stock Section */}
                <h2 className="text-xl font-semibold mt-6 mb-2">Stock Information</h2>
                <table className="w-full border mb-4 text-sm">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-2 py-1">Item</th>
                            <th className="border px-2 py-1">SIT Qty</th>
                            <th className="border px-2 py-1">Physical Count</th>
                            <th className="border px-2 py-1">Loose Product</th>
                            <th className="border px-2 py-1">Remarks</th>
                            <th className="border px-2 py-1 w-20">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.stocks.map((stock, i) => (
                            <tr key={i}>
                                <td className="border px-2 py-1">
                                    <input
                                        type="text"
                                        value={stock.item}
                                        onChange={(e) =>
                                            handleStockChange(i, "item", e.target.value)
                                        }
                                        className="w-full border px-2 py-1"
                                        placeholder="Item name"
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="number"
                                        value={stock.sitQty}
                                        onChange={(e) =>
                                            handleStockChange(i, "sitQty", e.target.value)
                                        }
                                        className="w-full border px-2 py-1"
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="number"
                                        value={stock.physicalCount}
                                        onChange={(e) =>
                                            handleStockChange(i, "physicalCount", e.target.value)
                                        }
                                        className="w-full border px-2 py-1"
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="text"
                                        value={stock.looseProduct}
                                        onChange={(e) =>
                                            handleStockChange(i, "looseProduct", e.target.value)
                                        }
                                        className="w-full border px-2 py-1"
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="text"
                                        value={stock.remarks}
                                        onChange={(e) =>
                                            handleStockChange(i, "remarks", e.target.value)
                                        }
                                        className="w-full border px-2 py-1"
                                    />
                                </td>
                                <td className="border px-2 py-1 text-center">
                                    {form.stocks.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeStock(i)}
                                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    type="button"
                    onClick={addStock}
                    className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    + Add Stock Item
                </button>

                {/* ELCB Section */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">ELCB</h2>
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-2 py-1">Detail</th>
                                <th className="border px-2 py-1">Month</th>
                                <th className="border px-2 py-1">WHI</th>
                                <th className="border px-2 py-1">Electrician</th>
                                <th className="border px-2 py-1">Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {["Weekly", "Quarterly"].map((detail) => (
                                <tr key={detail}>
                                    <td className="border px-2 py-1">{detail}</td>
                                    <td className="border px-2 py-1">
                                        <select
                                            className="w-full border px-1"
                                            value={form.elcb[detail.toLowerCase()]?.month || ""}
                                            onChange={(e) =>
                                                handleChange("elcb", detail.toLowerCase(), {
                                                    ...form.elcb[detail.toLowerCase()],
                                                    month: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">Select Month</option>
                                            {[
                                                "January", "February", "March", "April", "May", "June",
                                                "July", "August", "September", "October", "November", "December"
                                            ].map((m) => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="border px-2 py-1">
                                        <input
                                            type="text"
                                            className="w-full border px-1"
                                            value={form.elcb[detail.toLowerCase()]?.whi || ""}
                                            onChange={(e) =>
                                                handleChange("elcb", detail.toLowerCase(), {
                                                    ...form.elcb[detail.toLowerCase()],
                                                    whi: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <input
                                            type="text"
                                            className="w-full border px-1"
                                            value={form.elcb[detail.toLowerCase()]?.electrician || ""}
                                            onChange={(e) =>
                                                handleChange("elcb", detail.toLowerCase(), {
                                                    ...form.elcb[detail.toLowerCase()],
                                                    electrician: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <select
                                            className="w-full border px-1"
                                            value={form.elcb[detail.toLowerCase()]?.comment || ""}
                                            onChange={(e) =>
                                                handleChange("elcb", detail.toLowerCase(), {
                                                    ...form.elcb[detail.toLowerCase()],
                                                    comment: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">Select Comment</option>
                                            <option value="Good">Good</option>
                                            <option value="Poor">Poor</option>
                                            <option value="Needs Attention">Needs Attention</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Earthing Health */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Earthing Health</h2>
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-2 py-1">Detail</th>
                                <th className="border px-2 py-1">Month</th>
                                <th className="border px-2 py-1">Ohm</th>
                                <th className="border px-2 py-1">Electrician</th>
                                <th className="border px-2 py-1">Stamp/Signature</th>
                                <th className="border px-2 py-1">Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border px-2 py-1">Quarterly</td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.earthingHealth.month || ""}
                                        onChange={(e) =>
                                            handleChange("earthingHealth", "month", e.target.value)
                                        }
                                    >
                                        <option value="">Select Month</option>
                                        {[
                                            "January", "February", "March", "April", "May", "June",
                                            "July", "August", "September", "October", "November", "December"
                                        ].map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="text"
                                        className="w-full border px-1"
                                        value={form.earthingHealth.ohm || ""}
                                        onChange={(e) =>
                                            handleChange("earthingHealth", "ohm", e.target.value)
                                        }
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="text"
                                        className="w-full border px-1"
                                        value={form.earthingHealth.electrician || ""}
                                        onChange={(e) =>
                                            handleChange("earthingHealth", "electrician", e.target.value)
                                        }
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="text"
                                        className="w-full border px-1"
                                        value={form.earthingHealth.stamp || ""}
                                        onChange={(e) =>
                                            handleChange("earthingHealth", "stamp", e.target.value)
                                        }
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.earthingHealth.comment || ""}
                                        onChange={(e) =>
                                            handleChange("earthingHealth", "comment", e.target.value)
                                        }
                                    >
                                        <option value="">Select Comment</option>
                                        <option value="Good">Good</option>
                                        <option value="Poor">Poor</option>
                                        <option value="Needs Attention">Needs Attention</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Stitching Machine */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Stitching Machine</h2>
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-2 py-1">Detail</th>
                                <th className="border px-2 py-1">Condition</th>
                                <th className="border px-2 py-1">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border px-2 py-1">Condition</td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.stitchingMachine.condition || ""}
                                        onChange={(e) =>
                                            handleChange("stitchingMachine", "condition", e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        <option value="Repairing">Repairing</option>
                                        <option value="Ok">Ok</option>
                                        <option value="Perfect">Perfect</option>
                                    </select>
                                </td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.stitchingMachine.conditionRemark || ""}
                                        onChange={(e) =>
                                            handleChange("stitchingMachine", "conditionRemark", e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        <option value="Good">Good</option>
                                        <option value="Poor">Poor</option>
                                        <option value="Needs Attention">Needs Attention</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-2 py-1">Cord</td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.stitchingMachine.cord || ""}
                                        onChange={(e) =>
                                            handleChange("stitchingMachine", "cord", e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        <option value="Repairing">Repairing</option>
                                        <option value="Ok">Ok</option>
                                        <option value="Perfect">Perfect</option>
                                    </select>
                                </td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.stitchingMachine.cordRemark || ""}
                                        onChange={(e) =>
                                            handleChange("stitchingMachine", "cordRemark", e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        <option value="Good">Good</option>
                                        <option value="Poor">Poor</option>
                                        <option value="Needs Attention">Needs Attention</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-2 py-1">Oil</td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.stitchingMachine.oil || ""}
                                        onChange={(e) =>
                                            handleChange("stitchingMachine", "oil", e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.stitchingMachine.oilRemark || ""}
                                        onChange={(e) =>
                                            handleChange("stitchingMachine", "oilRemark", e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        <option value="Good">Good</option>
                                        <option value="Poor">Poor</option>
                                        <option value="Needs Attention">Needs Attention</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Digital Weighing Scale */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Digital Weighing Scale</h2>
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-2 py-1">Condition</th>
                                <th className="border px-2 py-1">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.weighingScale.condition || ""}
                                        onChange={(e) =>
                                            handleChange("weighingScale", "condition", e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        <option value="Charge">Charge</option>
                                        <option value="Not Charge">Not Charge</option>
                                        <option value="Out of Order">Out of Order</option>
                                    </select>
                                </td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.weighingScale.remarks || ""}
                                        onChange={(e) =>
                                            handleChange("weighingScale", "remarks", e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        <option value="Good">Good</option>
                                        <option value="Poor">Poor</option>
                                        <option value="Needs Attention">Needs Attention</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* UPS / Battery */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">UPS / Battery</h2>
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-2 py-1">Detail</th>
                                <th className="border px-2 py-1">Condition</th>
                                <th className="border px-2 py-1">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border px-2 py-1">Charging</td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.upsBattery.charging || ""}
                                        onChange={(e) =>
                                            handleChange("upsBattery", "charging", e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.upsBattery.chargingRemarks || ""}
                                        onChange={(e) =>
                                            handleChange("upsBattery", "chargingRemarks", e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        <option value="Good">Good</option>
                                        <option value="Poor">Poor</option>
                                        <option value="Needs Attention">Needs Attention</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-2 py-1">Condition</td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.upsBattery.condition || ""}
                                        onChange={(e) =>
                                            handleChange("upsBattery", "condition", e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        <option value="Poor">Poor</option>
                                        <option value="Good">Good</option>
                                        <option value="Excellent">Excellent</option>
                                    </select>
                                </td>
                                <td className="border px-2 py-1">
                                    <select
                                        className="w-full border px-1"
                                        value={form.upsBattery.conditionRemarks || ""}
                                        onChange={(e) =>
                                            handleChange("upsBattery", "conditionRemarks", e.target.value)
                                        }
                                    >
                                        <option value="">Select</option>
                                        <option value="Good">Good</option>
                                        <option value="Poor">Poor</option>
                                        <option value="Needs Attention">Needs Attention</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Warehouse Agreement */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Warehouse Agreement</h2>
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-2 py-1">Warehouse</th>
                                <th className="border px-2 py-1">Permanent</th>
                                <th className="border px-2 py-1">Temporary</th>
                                <th className="border px-2 py-1">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border px-2 py-1">Sq./ft</td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="text"
                                        className="w-full border px-1"
                                        value={form.warehouseAgreement.permanentSqft || ""}
                                        onChange={(e) =>
                                            handleChange("warehouseAgreement", "permanentSqft", e.target.value)
                                        }
                                        placeholder="Enter sqft"
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="text"
                                        className="w-full border px-1"
                                        value={form.warehouseAgreement.temporarySqft || ""}
                                        onChange={(e) =>
                                            handleChange("warehouseAgreement", "temporarySqft", e.target.value)
                                        }
                                        placeholder="Enter sqft"
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="text"
                                        className="w-full border px-1"
                                        value={form.warehouseAgreement.remarksSqft || ""}
                                        onChange={(e) =>
                                            handleChange("warehouseAgreement", "remarksSqft", e.target.value)
                                        }
                                        placeholder="Remarks"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-2 py-1">Expiry</td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="date"
                                        className="w-full border px-1"
                                        value={form.warehouseAgreement.permanentExpiry || ""}
                                        onChange={(e) =>
                                            handleChange("warehouseAgreement", "permanentExpiry", e.target.value)
                                        }
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="date"
                                        className="w-full border px-1"
                                        value={form.warehouseAgreement.temporaryExpiry || ""}
                                        onChange={(e) =>
                                            handleChange("warehouseAgreement", "temporaryExpiry", e.target.value)
                                        }
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="text"
                                        className="w-full border px-1"
                                        value={form.warehouseAgreement.remarksExpiry || ""}
                                        onChange={(e) =>
                                            handleChange("warehouseAgreement", "remarksExpiry", e.target.value)
                                        }
                                        placeholder="Remarks"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Govt Certificate */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Govt Certificate</h2>
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-2 py-1">Detail</th>
                                <th className="border px-2 py-1">From</th>
                                <th className="border px-2 py-1">To</th>
                                <th className="border px-2 py-1">Reminder Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border px-2 py-1">Weighing Scale Calibration</td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="date"
                                        className="w-full border px-1"
                                        value={form.govtCertificate.weighingScale.from || ""}
                                        onChange={(e) =>
                                            handleChange("govtCertificate", "weighingScale", {
                                                ...form.govtCertificate.weighingScale,
                                                from: e.target.value,
                                            })
                                        }
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="date"
                                        className="w-full border px-1"
                                        value={form.govtCertificate.weighingScale.to || ""}
                                        onChange={(e) =>
                                            handleChange("govtCertificate", "weighingScale", {
                                                ...form.govtCertificate.weighingScale,
                                                to: e.target.value,
                                            })
                                        }
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="date"
                                        className="w-full border px-1"
                                        value={form.govtCertificate.weighingScale.reminderDate || ""}
                                        onChange={(e) =>
                                            handleChange("govtCertificate", "weighingScale", {
                                                ...form.govtCertificate.weighingScale,
                                                reminderDate: e.target.value,
                                            })
                                        }
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-2 py-1">Warehouse Registration from "C" 1969</td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="date"
                                        className="w-full border px-1"
                                        value={form.govtCertificate.warehouseReg.from || ""}
                                        onChange={(e) =>
                                            handleChange("govtCertificate", "warehouseReg", {
                                                ...form.govtCertificate.warehouseReg,
                                                from: e.target.value,
                                            })
                                        }
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="date"
                                        className="w-full border px-1"
                                        value={form.govtCertificate.warehouseReg.to || ""}
                                        onChange={(e) =>
                                            handleChange("govtCertificate", "warehouseReg", {
                                                ...form.govtCertificate.warehouseReg,
                                                to: e.target.value,
                                            })
                                        }
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="date"
                                        className="w-full border px-1"
                                        value={form.govtCertificate.warehouseReg.reminderDate || ""}
                                        onChange={(e) =>
                                            handleChange("govtCertificate", "warehouseReg", {
                                                ...form.govtCertificate.warehouseReg,
                                                reminderDate: e.target.value,
                                            })
                                        }
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Fire Extinguishers */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Fire Extinguishers</h2>
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-2 py-1">Last Refilling Date</th>
                                <th className="border px-2 py-1">Expiry Date</th>
                                <th className="border px-2 py-1">F.E Gauge / Pressure</th>
                                <th className="border px-2 py-1">Nozzle Condition</th>
                                <th className="border px-2 py-1">F.E Seal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.fireExtinguishers.map((fe, i) => (
                                <tr key={i}>
                                    <td className="border px-2 py-1">
                                        <input
                                            type="date"
                                            className="w-full border px-1"
                                            value={fe.lastRefill}
                                            onChange={(e) =>
                                                handleFireExtinguisherChange(i, "lastRefill", e.target.value)
                                            }
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <input
                                            type="date"
                                            className="w-full border px-1"
                                            value={fe.expiry}
                                            onChange={(e) =>
                                                handleFireExtinguisherChange(i, "expiry", e.target.value)
                                            }
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <input
                                            type="text"
                                            className="w-full border px-1"
                                            value={fe.pressure}
                                            onChange={(e) =>
                                                handleFireExtinguisherChange(i, "pressure", e.target.value)
                                            }
                                            placeholder="Gauge/Pressure"
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <input
                                            type="text"
                                            className="w-full border px-1"
                                            value={fe.nozzle}
                                            onChange={(e) =>
                                                handleFireExtinguisherChange(i, "nozzle", e.target.value)
                                            }
                                            placeholder="Nozzle Condition"
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <input
                                            type="text"
                                            className="w-full border px-1"
                                            value={fe.seal}
                                            onChange={(e) =>
                                                handleFireExtinguisherChange(i, "seal", e.target.value)
                                            }
                                            placeholder="F.E Seal"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Safety Ramp */}
                <h2 className="text-xl font-semibold mt-6 mb-2">Safety Ramp</h2>
                <table className="w-full border border-gray-400">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-2 py-1 text-left w-2/5">Safety Ramp</th>
                            <th className="border px-2 py-1">Frequently</th>
                            <th className="border px-2 py-1">Poor</th>
                            <th className="border px-2 py-1">Good</th>
                            <th className="border px-2 py-1">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            "Is rubber surface of safety ramp and handrail rubber grip properly glued. Also grip not hanging with handrail?",
                            "Side stability holder and intact with ramp also check all the welded joint found no crack or damage",
                            "All the nut bolt are properly tight and fitted. Iron strip beneath the safety ramp and handrail is properly fitted and welded with frame",
                            "Closely inspected the wooden plank from beneath and found no major crack also rubber surface cleaned with brush & water",
                            "Air pressure is good enough for easy movement. Also Tires, wheel axel and ball bearing are in working condition",
                        ].map((text, idx) => (
                            <tr key={idx}>
                                <td className="border px-2 py-1 text-sm">{text}</td>
                                <td className="border px-2 py-1 text-center">
                                    {idx < 2 ? "Weekly" : "Monthly"}
                                </td>
                                <td className="border px-2 py-1 text-center">
                                    <input
                                        type="radio"
                                        name={`safetyRamp_${idx}`}
                                        value="Poor"
                                        checked={form.safetyRamp[idx]?.status === "Poor"}
                                        onChange={() => handleSafetyRampChange(idx, "status", "Poor")}
                                    />
                                </td>
                                <td className="border px-2 py-1 text-center">
                                    <input
                                        type="radio"
                                        name={`safetyRamp_${idx}`}
                                        value="Good"
                                        checked={form.safetyRamp[idx]?.status === "Good"}
                                        onChange={() => handleSafetyRampChange(idx, "status", "Good")}
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="text"
                                        value={form.safetyRamp[idx]?.remarks || ""}
                                        onChange={(e) =>
                                            handleSafetyRampChange(idx, "remarks", e.target.value)
                                        }
                                        className="w-full border px-2 py-1"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* SRL Harness Section */}
                <h2 className="text-xl font-semibold mt-6 mb-2">SRL / Harness</h2>
                <table className="w-full border border-gray-400">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-2 py-1 text-left w-2/5">SRL</th>
                            <th className="border px-2 py-1">Frequently</th>
                            <th className="border px-2 py-1">Poor</th>
                            <th className="border px-2 py-1">Good</th>
                            <th className="border px-2 py-1">Remarks</th>
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
                        ].map((item, idx) => (
                            <tr key={idx}>
                                <td className="border px-2 py-1">{item.text}</td>
                                <td className="border px-2 py-1 text-center">{item.freq}</td>
                                <td className="border px-2 py-1 text-center">
                                    <input
                                        type="radio"
                                        name={`srl_${idx}`}
                                        value="Poor"
                                        checked={form.srlHarness[idx]?.status === "Poor"}
                                        onChange={() => handleSrlHarnessChange(idx, "status", "Poor")}
                                    />
                                </td>
                                <td className="border px-2 py-1 text-center">
                                    <input
                                        type="radio"
                                        name={`srl_${idx}`}
                                        value="Good"
                                        checked={form.srlHarness[idx]?.status === "Good"}
                                        onChange={() => handleSrlHarnessChange(idx, "status", "Good")}
                                    />
                                </td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="text"
                                        value={form.srlHarness[idx]?.remarks || ""}
                                        onChange={(e) =>
                                            handleSrlHarnessChange(idx, "remarks", e.target.value)
                                        }
                                        className="w-full border px-1 py-0.5"
                                        placeholder="Enter remarks"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Emergency Numbers */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Emergency Numbers</h2>
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-2 py-1">Fire Brigade</th>
                                <th className="border px-2 py-1">Rescue</th>
                                <th className="border px-2 py-1">Civil Defense</th>
                                <th className="border px-2 py-1">Bomb Disposal</th>
                                <th className="border px-2 py-1">Nearest Hospital</th>
                                <th className="border px-2 py-1">Police Station</th>
                                <th className="border px-2 py-1">District Hospital</th>
                                <th className="border px-2 py-1">Edhi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {Object.keys(form.emergencyNumbers).map((k) => (
                                    <td key={k} className="border px-2 py-1">
                                        <input
                                            type="text"
                                            className="w-full border px-1"
                                            value={form.emergencyNumbers[k]}
                                            onChange={(e) => handleChange("emergencyNumbers", k, e.target.value)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Medicine Verification */}
                <h2 className="text-xl font-semibold mt-6 mb-2">Medicine</h2>
                <select
                    value={form.medicine}
                    onChange={(e) => setForm({ ...form, medicine: e.target.value })}
                    className="w-full border px-2 py-1 mb-4"
                >
                    <option value="">-- Select Option --</option>
                    <option value="All is ok as per FAB">All is ok as per FAB</option>
                    <option value="Need Maintenance">Need Maintenance</option>
                    <option value="Repaired">Repaired</option>
                    <option value="Pending">Pending</option>
                </select>

                <div className="flex justify-between items-center mt-6">
                    <div className="w-1/2 mr-2">
                        <label className="block text-sm font-medium mb-1">Warehouse Incharge</label>
                        <input
                            type="text"
                            value={form.warehouseIncharge}
                            readOnly
                            onChange={(e) => setForm({ ...form, warehouseIncharge: e.target.value })}
                            className="w-full border px-2 py-1"
                        />
                    </div>
                   
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mt-6 hover:bg-blue-700"
                >
                    Save Spot Check
                </button>
            </form>
        </div>
    );
}