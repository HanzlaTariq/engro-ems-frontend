import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import API from "../api/axios.jsx";

export default function QuarterlySpotCheckPrintView() {
    const [spotChecks, setSpotChecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCheck, setSelectedCheck] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date");

    useEffect(() => {
        fetchSpotChecks();
    }, []);

    const fetchSpotChecks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await API.get("/api/quarterly-spot-check/my", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sortedData = response.data.data?.sort((a, b) => new Date(b.date) - new Date(a.date)) || [];
            setSpotChecks(sortedData);
            if (sortedData.length > 0 && !selectedCheck) {
                setSelectedCheck(sortedData[0]);
            }
        } catch (error) {
            console.error("Error fetching spot checks:", error.response?.data || error);
            alert("Error loading data: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoDate) => {
        if (!isoDate) return { day: "N/A", month: "N/A", year: "N/A", fullDate: "N/A" };

        try {
            const d = new Date(isoDate);
            const day = String(d.getDate()).padStart(2, "0");
            const month = d.toLocaleString('default', { month: 'long' });
            const year = d.getFullYear();
            const fullDate = `${day} ${month} ${year}`;

            return { day, month, year, fullDate };
        } catch (err) {
            return { day: "N/A", month: "N/A", year: "N/A", fullDate: "N/A" };
        }
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredAndSortedChecks = useMemo(() => {
        let filtered = spotChecks.filter(check => {
            const matchesSearch =
                searchTerm === "" ||
                check.warehouseIncharge?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formatDate(check.date).fullDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                check.doEmail?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "verified" && check.verifiedBy === "Verified") ||
                (statusFilter === "not-verified" && check.verifiedBy !== "Verified");

            return matchesSearch && matchesStatus;
        });

        return filtered.sort((a, b) => {
            if (sortBy === "date") {
                return new Date(b.date) - new Date(a.date);
            } else if (sortBy === "name") {
                return a.warehouseIncharge?.localeCompare(b.warehouseIncharge);
            }
            return 0;
        });
    }, [spotChecks, searchTerm, statusFilter, sortBy]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your spot checks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col">
            {/* List View - Hide on Print */}
            <div className="print:hidden h-full flex flex-col overflow-hidden">
                <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl border-b border-gray-100 flex-shrink-0">
                    {/* Header with Search and Print Button */}
                    <div className="p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                                    Quarterly Spot Check Records
                                </h1>
                                <p className="text-gray-500 text-sm mt-1 flex items-center gap-2 truncate">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="truncate">Select a record to print or verify</span>
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                                {/* Search Box */}
                                <div className="relative w-full sm:w-64">
                                    <input
                                        type="text"
                                        placeholder="Search by date, incharge, or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2.5 pl-11 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm"
                                    />
                                    <svg className="absolute left-4 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Print Button - Always Visible */}
                                {selectedCheck && (
                                    <button
                                        onClick={handlePrint}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                                        </svg>
                                        <span>Print Selected</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filters and Status Bar */}
                        <div className="flex flex-col md:flex-row gap-3 mt-4">
                            <div className="flex flex-wrap gap-2">
                                {/* Status Filter */}
                                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-1.5">
                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                    </svg>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-transparent outline-none text-sm min-w-0"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="verified">Verified Only</option>
                                        <option value="not-verified">Not Verified</option>
                                    </select>
                                </div>

                                {/* Sort By */}
                                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-1.5">
                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-transparent outline-none text-sm min-w-0"
                                    >
                                        <option value="date">Sort by Date</option>
                                        <option value="name">Sort by Name</option>
                                    </select>
                                </div>

                                {/* Results Count */}
                                <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-xl font-semibold text-sm">
                                    {filteredAndSortedChecks.length} of {spotChecks.length} records
                                </div>
                            </div>
                        </div>

                        {/* Status Legend */}
                        <div className="flex flex-wrap gap-3 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <span className="text-xs font-medium text-gray-700">Verified</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-700">Not Verified</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-700">Selected</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Scrollable */}
                <div className="flex-1 overflow-hidden p-4 lg:p-6">
                    {spotChecks.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200 max-w-md">
                                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No records found</h3>
                                <p className="text-gray-500">Start by creating your first quarterly spot check record.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                            {/* Records List - Scrollable */}
                            <div className="lg:col-span-2 flex flex-col min-h-0">
                                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                        <div className="space-y-3 pb-4">
                                            {filteredAndSortedChecks.map((check) => {
                                                const { day, month, year, fullDate } = formatDate(check.date);
                                                const isVerified = check.verifiedBy === "Verified";
                                                const isSelected = selectedCheck?._id === check._id;

                                                return (
                                                    <div
                                                        key={check._id}
                                                        onClick={() => setSelectedCheck(check)}
                                                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                                                            ? isVerified
                                                                ? 'ring-2 ring-green-500 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg'
                                                                : 'ring-2 ring-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-lg'
                                                            : isVerified
                                                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 hover:shadow-md hover:border-green-300'
                                                                : 'bg-white border border-gray-100 hover:shadow-md hover:border-blue-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            {/* Left Content */}
                                                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                                {/* Date Circle */}
                                                                <div className={`relative w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${isVerified
                                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                                                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                                                    } text-white shadow`}>
                                                                    <div className="text-sm font-bold">{day}</div>
                                                                    <div className="text-[10px] opacity-90">{month.slice(0, 3)}</div>
                                                                </div>

                                                                {/* Details */}
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <p className="text-sm font-semibold text-gray-800 truncate">{fullDate}</p>
                                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${isVerified
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                            }`}>
                                                                            {isVerified ? 'VERIFIED' : 'NOT VERIFIED'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-600 truncate">
                                                                        <span className="font-medium">Incharge:</span> {check.warehouseIncharge}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                                        <span>{check.stocks?.length || 0} items</span>
                                                                        <span>•</span>
                                                                        <span>{check.fireExtinguishers?.length || 0} fire extinguishers</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Selection Indicator */}
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${isSelected
                                                                ? isVerified ? 'bg-green-100' : 'bg-blue-100'
                                                                : 'bg-gray-100'
                                                                }`}>
                                                                <div className={`w-3 h-3 rounded-full ${isSelected
                                                                    ? isVerified ? 'bg-green-500' : 'bg-blue-500'
                                                                    : 'bg-gray-400'
                                                                    }`}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Selected Record Preview - Fixed Height */}
                            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                {selectedCheck ? (
                                    <div className={`h-full flex flex-col rounded-2xl shadow-lg ${selectedCheck.verifiedBy === "Verified"
                                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                                        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
                                        }`}>
                                        <div className="p-5 border-b border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${selectedCheck.verifiedBy === "Verified"
                                                    ? 'bg-green-100'
                                                    : 'bg-red-100'
                                                    }`}>
                                                    {selectedCheck.verifiedBy === "Verified" ? (
                                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-lg font-bold text-gray-800 truncate">Selected Record</h3>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {formatDate(selectedCheck.date).fullDate}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                            <div className="space-y-4">
                                                <div className="bg-white/50 rounded-xl p-4">
                                                    <h4 className="font-semibold text-gray-700 mb-3">Record Details</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Date</label>
                                                            <div className="font-medium text-gray-800">{formatDate(selectedCheck.date).fullDate}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Warehouse Incharge</label>
                                                            <div className="font-medium text-gray-800">{selectedCheck.warehouseIncharge}</div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Verified By</label>
                                                            <div className="font-medium text-gray-800">{selectedCheck.doEmail}</div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">Items</label>
                                                                <div className="font-medium text-gray-800">{selectedCheck.stocks?.length || 0}</div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">Fire Extinguishers</label>
                                                                <div className="font-medium text-gray-800">{selectedCheck.fireExtinguishers?.length || 0}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white/50 rounded-xl p-4">
                                                    <h4 className="font-semibold text-gray-700 mb-3">Actions</h4>
                                                    <div className="space-y-2">
                                                        <button
                                                            onClick={handlePrint}
                                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>Print Record</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200">
                                        <div className="text-center p-6">
                                            <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Record Selected</h3>
                                            <p className="text-gray-500 text-sm">Select a record from the list</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Print View - Show only on Print */}
            {selectedCheck && (
                <div className="hidden print:block bg-white max-w-full mx-auto" style={{ fontSize: '6.5px', padding: '2mm' }}>
                    <style>{`
                        @media print {
                            @page { 
                                size: A4; 
                                margin: 3mm; 
                            }
                            body { 
                                -webkit-print-color-adjust: exact; 
                                print-color-adjust: exact; 
                                background: white !important;
                            }
                            table { 
                                page-break-inside: avoid; 
                                border-collapse: collapse;
                            }
                            td, th {
                                padding: 2px 3px !important;
                            }
                            .print-section {
                                page-break-after: avoid;
                            }
                            .print-section:last-child {
                                page-break-after: auto;
                            }
                            h1 {
                                font-size: 12px !important;
                                margin: 1px 0 !important;
                            }
                            p {
                                margin: 1px 0 !important;
                            }
                            .border-b-4 {
                                padding: 1px 0 !important;
                                margin: 1px 0 !important;
                            }
                        }
                    `}</style>

                    {/* Header */}
                    <div className="border-b-2 border-black pb-0.5 mb-1 flex justify-between items-center">
                        <div>
                            <h1 className="text-base font-bold">
                                Quarterly Spot Check {formatDate(selectedCheck.date).day}/{formatDate(selectedCheck.date).month}/{formatDate(selectedCheck.date).year.toString().slice(-2)}
                            </h1>
                        </div>
                        <div className="text-right font-bold text-lg">05</div>
                    </div>

                    {/* Date Section */}
                    <div className="mb-1">
                        <p><strong>Date:</strong> _________________</p>
                        <p><strong>As per WMS Dated:</strong> _________________</p>
                    </div>

                    {/* Stock Table */}
                    <table className="w-full border-collapse border border-black mb-1" style={{ fontSize: '6px' }}>
                        <thead>
                            <tr>
                                <th className="border border-black p-0.5 text-left w-32">Item</th>
                                <th className="border border-black p-0.5">STR QTY (TONS)</th>
                                <th className="border border-black p-0.5">Physical Count (TONS)</th>
                                <th className="border border-black p-0.5">Loose Product (KG)</th>
                                <th className="border border-black p-0.5">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedCheck.stocks?.map((stock, i) => (
                                <tr key={i}>
                                    <td className="border border-black p-0.5">{stock.item}</td>
                                    <td className="border border-black p-0.5">{stock.sitQty}</td>
                                    <td className="border border-black p-0.5">{stock.physicalCount}</td>
                                    <td className="border border-black p-0.5">{stock.looseProduct}</td>
                                    <td className="border border-black p-0.5">{stock.remarks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ELCB */}
                    <div className="mb-0.5">
                        <p className="font-bold mb-0.5 text-xs">ELCB:</p>
                        <table className="w-full border-collapse border border-black" style={{ fontSize: '5.5px' }}>
                            <thead>
                                <tr>
                                    <th className="border border-black p-0.5 w-20">Detail</th>
                                    <th className="border border-black p-0.5">Month</th>
                                    <th className="border border-black p-0.5">WHI</th>
                                    <th className="border border-black p-0.5">Electrician</th>
                                    <th className="border border-black p-0.5">Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-0.5">Weekly</td>
                                    <td className="border border-black p-0.5">{selectedCheck.elcb?.weekly?.month}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.elcb?.weekly?.whi}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.elcb?.weekly?.electrician}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.elcb?.weekly?.comment}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-0.5">Quarterly</td>
                                    <td className="border border-black p-0.5">{selectedCheck.elcb?.quarterly?.month}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.elcb?.quarterly?.whi}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.elcb?.quarterly?.electrician}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.elcb?.quarterly?.comment}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Earthing Health */}
                    <div className="mb-0.5">
                        <p className="font-bold mb-0.5 text-xs">Earthing Health:</p>
                        <table className="w-full border-collapse border border-black" style={{ fontSize: '5.5px' }}>
                            <thead>
                                <tr>
                                    <th className="border border-black p-0.5 w-20">Detail</th>
                                    <th className="border border-black p-0.5">Month</th>
                                    <th className="border border-black p-0.5">Ohm</th>
                                    <th className="border border-black p-0.5">Electrician</th>
                                    <th className="border border-black p-0.5">Stamp/Signature</th>
                                    <th className="border border-black p-0.5">Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-0.5">Quarterly</td>
                                    <td className="border border-black p-0.5">{selectedCheck.earthingHealth?.month}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.earthingHealth?.ohm}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.earthingHealth?.electrician}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.earthingHealth?.stamp}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.earthingHealth?.comment}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Stitching Machine */}
                    <div className="mb-0.5">
                        <p className="font-bold mb-0.5 text-xs">Stitching Machine:</p>
                        <table className="w-full border-collapse border border-black" style={{ fontSize: '5.5px' }}>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-0.5 w-32 font-semibold">Condition:</td>
                                    <td className="border border-black p-0.5">{selectedCheck.stitchingMachine?.condition}</td>
                                    <td className="border border-black p-0.5 font-semibold">Remarks</td>
                                    <td className="border border-black p-0.5">{selectedCheck.stitchingMachine?.conditionRemark}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-0.5 font-semibold">Cord:</td>
                                    <td className="border border-black p-0.5">{selectedCheck.stitchingMachine?.cord}</td>
                                    <td className="border border-black p-0.5 font-semibold">Remarks</td>
                                    <td className="border border-black p-0.5">{selectedCheck.stitchingMachine?.cordRemark}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-0.5 font-semibold">Oil:</td>
                                    <td className="border border-black p-0.5">{selectedCheck.stitchingMachine?.oil}</td>
                                    <td className="border border-black p-0.5 font-semibold">Remarks</td>
                                    <td className="border border-black p-0.5">{selectedCheck.stitchingMachine?.oilRemark}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Digital Weighing Scale */}
                    <div className="mb-0.5">
                        <p className="font-bold mb-0.5 text-xs">Digital Weighing Scale:</p>
                        <table className="w-full border-collapse border border-black" style={{ fontSize: '5.5px' }}>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-0.5 w-32 font-semibold">Condition</td>
                                    <td className="border border-black p-0.5">{selectedCheck.weighingScale?.condition}</td>
                                    <td className="border border-black p-0.5 font-semibold">Remarks</td>
                                    <td className="border border-black p-0.5">{selectedCheck.weighingScale?.remarks}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* UPS/Battery */}
                    <div className="mb-0.5">
                        <p className="font-bold mb-0.5 text-xs">UPS/Battery:</p>
                        <table className="w-full border-collapse border border-black" style={{ fontSize: '5.5px' }}>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-0.5 w-32 font-semibold">Charging:</td>
                                    <td className="border border-black p-0.5">{selectedCheck.upsBattery?.charging}</td>
                                    <td className="border border-black p-0.5 font-semibold">Remarks</td>
                                    <td className="border border-black p-0.5">{selectedCheck.upsBattery?.chargingRemarks}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-0.5 font-semibold">Condition:</td>
                                    <td className="border border-black p-0.5">{selectedCheck.upsBattery?.condition}</td>
                                    <td className="border border-black p-0.5 font-semibold">Remarks</td>
                                    <td className="border border-black p-0.5">{selectedCheck.upsBattery?.conditionRemarks}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Fire Extinguishers */}
                    <div className="mb-0.5">
                        <p className="font-bold mb-0.5 text-xs">Fire Extinguishers:</p>
                        <table className="w-full border-collapse border border-black" style={{ fontSize: '5.5px' }}>
                            <thead>
                                <tr>
                                    <th className="border border-black p-0.5">Last Refilling Date</th>
                                    <th className="border border-black p-0.5">Expiry Date</th>
                                    <th className="border border-black p-0.5">F.E gauge/Pressure</th>
                                    <th className="border border-black p-0.5">Nozzle Condition</th>
                                    <th className="border border-black p-0.5">F.E seal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedCheck.fireExtinguishers?.map((fe, i) => (
                                    <tr key={i}>
                                        <td className="border border-black p-0.5">{formatDateDisplay(fe.lastRefill)}</td>
                                        <td className="border border-black p-0.5">{formatDateDisplay(fe.expiry)}</td>
                                        <td className="border border-black p-0.5">{fe.pressure}</td>
                                        <td className="border border-black p-0.5">{fe.nozzle}</td>
                                        <td className="border border-black p-0.5">{fe.seal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Government Certificates */}
                    <div className="mb-0.5">
                        <p className="font-bold mb-0.5 text-xs">Government Certificates:</p>
                        <table className="w-full border-collapse border border-black" style={{ fontSize: '5.5px' }}>
                            <thead>
                                <tr>
                                    <th className="border border-black p-0.5">Certificate</th>
                                    <th className="border border-black p-0.5">From</th>
                                    <th className="border border-black p-0.5">To</th>
                                    <th className="border border-black p-0.5">Reminder Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-0.5">Weighing Scale</td>
                                    <td className="border border-black p-0.5">{formatDateDisplay(selectedCheck.govtCertificate?.weighingScale?.from)}</td>
                                    <td className="border border-black p-0.5">{formatDateDisplay(selectedCheck.govtCertificate?.weighingScale?.to)}</td>
                                    <td className="border border-black p-0.5">{formatDateDisplay(selectedCheck.govtCertificate?.weighingScale?.reminderDate)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-0.5">Warehouse Reg</td>
                                    <td className="border border-black p-0.5">{formatDateDisplay(selectedCheck.govtCertificate?.warehouseReg?.from)}</td>
                                    <td className="border border-black p-0.5">{formatDateDisplay(selectedCheck.govtCertificate?.warehouseReg?.to)}</td>
                                    <td className="border border-black p-0.5">{formatDateDisplay(selectedCheck.govtCertificate?.warehouseReg?.reminderDate)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Warehouse Area & Expiry */}
                    <div className="mb-0.5">
                        <p className="font-bold mb-0.5 text-xs">Warehouse Area & Expiry:</p>
                        <table className="w-full border-collapse border border-black" style={{ fontSize: '5.5px' }}>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-0.5 font-semibold">Permanent (sqft)</td>
                                    <td className="border border-black p-0.5">{selectedCheck.warehouseAgreement?.permanentSqft}</td>
                                    <td className="border border-black p-0.5 font-semibold">Remarks</td>
                                    <td className="border border-black p-0.5">{selectedCheck.warehouseAgreement?.remarksSqft}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-0.5 font-semibold">Temporary (sqft)</td>
                                    <td className="border border-black p-0.5">{selectedCheck.warehouseAgreement?.temporarySqft}</td>
                                    <td className="border border-black p-0.5 font-semibold">Remarks</td>
                                    <td className="border border-black p-0.5">{selectedCheck.warehouseAgreement?.remarksSqft}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-0.5 font-semibold">Permanent Expiry</td>
                                    <td className="border border-black p-0.5">{selectedCheck.warehouseAgreement?.permanentExpiry}</td>
                                    <td className="border border-black p-0.5 font-semibold">Temporary Expiry</td>
                                    <td className="border border-black p-0.5">{selectedCheck.warehouseAgreement?.temporaryExpiry}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-0.5 font-semibold">Expiry Remarks</td>
                                    <td className="border border-black p-0.5" colSpan={3}>{selectedCheck.warehouseAgreement?.remarksExpiry}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Safety Ramp */}
                    <div className="mb-0.5">
                        <p className="font-bold mb-0.5 text-xs">Safety Ramp:</p>
                        <table className="w-full border-collapse border border-black" style={{ fontSize: '5px' }}>
                            <thead>
                                <tr>
                                    <th className="border border-black p-0.5 text-left w-2/5">Safety Ramp Details</th>
                                    <th className="border border-black p-0.5">Frequency</th>
                                    <th className="border border-black p-0.5">Poor</th>
                                    <th className="border border-black p-0.5">Good</th>
                                    <th className="border border-black p-0.5">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    "Is rubber surface of safety ramp and handrail rubber grip properly glued. Also grip not hanging with handrail?",
                                    "Side stability holder and intact with ramp also check all the welded joint found no crack or damage",
                                    "All the nut bolt are properly tight and fitted. Iron strip beneath the safety ramp and handrail is properly fitted and welded with frame",
                                    "Closely inspected the wooden plank from beneath and found no major crack also rubber surface cleaned with brush & water",
                                    "Air pressure is good enough for easy movement. Also Tires, wheel axel and ball bearing are in working condition",
                                ].map((text, i) => (
                                    <tr key={i}>
                                        <td className="border border-black p-0.5 text-[8px]">{text}</td>
                                        <td className="border border-black p-0.5 text-center">{selectedCheck.safetyRamp?.[i]?.frequently || ''}</td>
                                        <td className="border border-black p-0.5 text-center">{selectedCheck.safetyRamp?.[i]?.status === "Poor" ? 'Yes' : ''}</td>
                                        <td className="border border-black p-0.5 text-center">{selectedCheck.safetyRamp?.[i]?.status === "Good" ? 'Yes' : ''}</td>
                                        <td className="border border-black p-0.5 ">{selectedCheck.safetyRamp?.[i]?.remarks || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* SRL / Harness */}
                    <div className="mb-1">
                        <p className="font-bold mb-0.5 text-xs">SRL / Harness:</p>
                        <table className="w-full border-collapse border border-black" style={{ fontSize: '5px' }}>
                            <thead>
                                <tr>
                                    <th className="border border-black p-0.5 text-left w-2/5">SRL / Harness Details</th>
                                    <th className="border border-black p-0.5">Frequency</th>
                                    <th className="border border-black p-0.5">Poor</th>
                                    <th className="border border-black p-0.5">Good</th>
                                    <th className="border border-black p-0.5">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    "Lifeline lock up when received sharp jerks, also harness in good shape & has no damage in harness webbing & belts as well pulled stitches and broken fiber.",
                                    "Is the snap hook operating freely, correctly, not bent, no crack, no damage sign. Buckles have no distortion, crack or break.",
                                    "Inspect the iron cable installed between pillars for cuts, corrosion, damage. Inspect device cable/rope for cuts, nicks, broken wires.",
                                    "All bolts of iron frame/anchorage with pillar/roof properly fixed. Welded joints have no cracks.",
                                    "Plumb used to bind iron cable with U-turn buckle not loose, no damage, no cracks on SRL unit.",
                                ].map((text, i) => ({
                                    text,
                                    freq: i < 3 ? "Monthly" : "Quarterly"
                                })).map((item, i) => (
                                    <tr key={i}>
                                        <td className="border border-black p-0.5 text-[8px]">{item.text}</td>
                                        <td className="border border-black p-0.5 text-center">{item.freq}</td>
                                        <td className="border border-black p-0.5 text-center">{selectedCheck.srlHarness?.[i]?.status === "Poor" ? 'Yes' : ''}</td>
                                        <td className="border border-black p-0.5 text-center">{selectedCheck.srlHarness?.[i]?.status === "Good" ? 'Yes' : ''}</td>
                                        <td className="border border-black p-0.5">{selectedCheck.srlHarness?.[i]?.remarks || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Emergency Numbers */}
                    <div className="mb-0.5">
                        <p className="font-bold mb-0.5 text-xs">Emergency Number Check:</p>
                        <table className="w-full border-collapse border border-black" style={{ fontSize: '5.5px' }}>
                            <thead>
                                <tr>
                                    <th className="border border-black p-0.5">Fire Brigade</th>
                                    <th className="border border-black p-0.5">Rescue</th>
                                    <th className="border border-black p-0.5">Civil Defense</th>
                                    <th className="border border-black p-0.5">Bomb Disposal</th>
                                    <th className="border border-black p-0.5">Nearest Hospital</th>
                                    <th className="border border-black p-0.5">Police Station</th>
                                    <th className="border border-black p-0.5">District Hospital</th>
                                    <th className="border border-black p-0.5">Edhi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-0.5">{selectedCheck.emergencyNumbers?.fireBrigade || ''}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.emergencyNumbers?.rescue || ''}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.emergencyNumbers?.civilDefense || ''}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.emergencyNumbers?.bombDisposal || ''}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.emergencyNumbers?.nearestHospital || ''}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.emergencyNumbers?.policeStation || ''}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.emergencyNumbers?.districtHospital || ''}</td>
                                    <td className="border border-black p-0.5">{selectedCheck.emergencyNumbers?.edhi || ''}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Medicine */}
                    <div className="mb-1">
                        <p className="text-xs"><strong>Medicine:</strong> {selectedCheck.medicine}</p>
                    </div>

                    {/* Footer Signatures */}
                    <div className="flex justify-between mt-1 pt-1 border-t border-black" style={{ fontSize: '5.5px' }}>
                        <div>
                            <p><strong>Warehouse Incharge:</strong> {selectedCheck.warehouseIncharge}</p>
                        </div>
                        <div className="text-right">
                            <p><strong>Verified By:</strong> {selectedCheck.doEmail}</p>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}