"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/components/api/axiosInstance";
import ProjectApiList from "@/components/api/ProjectApiList";

interface UserDetails {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface BloodComponent {
  particulars: string;
  quantity: number;
  rate?: number;
  amount?: number;
  crossmatch?: string;
}

interface BillingRecord {
  id: number;
  bill_no: string;
  date: string;
  total_amount: string;
  is_paid: boolean;
  payment_method?: string;
  blood_component_details: BloodComponent[];
  user?: UserDetails | null;
    patient_name?: string;
age_years?: number;
age_months?: number;
age_days?: number;
  mobile_number?: string;
  hospital_name?: string;
  ward?: string;
  ipd_no?: string;
  sex?: string;
  father_husband_name?: string;

}

export default function BillingRecords() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [categories, setCategories] = useState<{ id: number; category: string }[]>([]);
const [cancelModal, setCancelModal] = useState<any>(null);
const [cancelRemark, setCancelRemark] = useState("");
const [remarkModal, setRemarkModal] = useState<any>(null);
const [selectedRecord, setSelectedRecord] = useState<any>(null);
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 5;

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalRecords: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    user: "All",
    category: "All",
      status: "All", // ✅ NEW

  });

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get(ProjectApiList.bloodCategories);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };


  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(ProjectApiList.users);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  // ⭐ MAIN API FETCH FUNCTION (includes pagination)
  const fetchBillings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { page, limit };

      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.category !== "All") params.particulars = filters.category;
      if (filters.user !== "All") params.user = filters.user;
if (filters.status === "Cancelled") {
  params.is_cancelled = true;
} else if (filters.status === "Active") {
  params.is_cancelled = false;
}
      const res = await axiosInstance.get(ProjectApiList.billings, { params });

      const { data, totalPages, totalRecords } = res.data;

      setBillingRecords(data || []);
      setPagination({ totalPages, totalRecords });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch billing records.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on load + when page changes
  useEffect(() => {
    fetchBillings();
    fetchUsers();
    fetchCategories();   // 👈 NEW
  }, [page]);


  // Apply Filters
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBillings();
  };

  // Reset Filters
  const handleReset = () => {
    setFilters({ fromDate: "", toDate: "", user: "All", category: "All" });
    setPage(1);
    fetchBillings();
  };

  const role = localStorage.getItem("userRole");

  const handleCancel = async () => {
  if (!cancelRemark.trim()) {
    alert("Remark is required");
    return;
  }

  try {
    await axiosInstance.put(
      `${ProjectApiList.billings}/${cancelModal.id}/cancel`,
      { remark: cancelRemark }
    );

    setCancelModal(null);
    setCancelRemark("");
    fetchBillings();
  } catch (err) {
    alert("Failed to cancel billing");
  }
};

function numberToWordsIndian(amount: number) {
  if (!amount || isNaN(amount)) return "Zero";

  const words: any = {
    0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
    10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen',
    20: 'Twenty', 30: 'Thirty', 40: 'Forty', 50: 'Fifty', 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
  };

  const getTwo = (n: number) => {
    if (n === 0) return "";
    if (n < 20) return words[n];
    const ten = Math.floor(n / 10) * 10;
    const unit = n % 10;
    return unit ? words[ten] + " " + words[unit] : words[ten];
  };

  const getThree = (n: number) => {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    const hundredPart = hundred ? words[hundred] + " Hundred " : "";
    const restPart = rest ? (hundred ? "and " : "") + getTwo(rest) : "";
    return (hundredPart + restPart).trim();
  };

  let n = Math.floor(amount);
  const crore = Math.floor(n / 10000000);
  n = n % 10000000;
  const lakh = Math.floor(n / 100000);
  n = n % 100000;
  const thousand = Math.floor(n / 1000);
  n = n % 1000;
  const hundreds = n;

  const parts = [];
  if (crore) parts.push(getThree(crore) + " Crore");
  if (lakh) parts.push(getThree(lakh) + " Lakh");
  if (thousand) parts.push(getThree(thousand) + " Thousand");
  if (hundreds) parts.push(getThree(hundreds));

  return parts.length ? parts.join(" ") : "Zero";
}

const handleBulkExport = async () => {
  try {
    const params: any = {
      page: 1,
      limit: 10000, // 🔥 get ALL data
    };

    // ✅ Apply same filters
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    if (filters.category !== "All") params.particulars = filters.category;
    if (filters.user !== "All") params.user = filters.user;

    if (filters.status === "Cancelled") {
      params.is_cancelled = true;
    } else if (filters.status === "Active") {
      params.is_cancelled = false;
    }

    const res = await axiosInstance.get(ProjectApiList.billings, { params });

    const allData = res.data.data || [];

    // ✅ Convert to CSV
    const rows: string[] = [];

    // HEADER
    rows.push([
      "Bill No",
      "Date",
      "Patient Name",
      "Sex",
      "Age",
      "Mobile",
      "Hospital",
      "Ward",
      "IPD",
      "User",
      "Component",
      "Qty",
      "Rate",
      "Amount",
      "Total",
      "Payment",
      "Status",
      "Remarks"
    ].join(","));

    allData.forEach((record: any) => {
      // const ageObj = record.age ? JSON.parse(record.age) : null;
      // const age = ageObj
      //   ? `${ageObj.y}y ${ageObj.m}m ${ageObj.d}d`
      //   : "";

      const age = formatAge(
  record.age_years,
  record.age_months,
  record.age_days
);

      const status = record.is_cancelled
        ? "Cancelled"
        : record.is_paid
        ? "Paid"
        : "Pending";

      const remark = record.is_cancelled
        ? record.cancel_remark || ""
        : record.payment_details?.remarks || "";

      record.blood_component_details.forEach((item: any) => {
        rows.push([
          record.bill_no,
          new Date(record.date).toLocaleDateString(),
          record.patient_name,
          record.sex,
          age,
          record.mobile_number,
          record.hospital_name,
          record.ward,
          record.ipd_no,
          record.user?.full_name || "",
          item.particulars,
          item.quantity,
          item.rate,
          item.amount,
          record.total_amount,
          record.payment_method,
          status,
          remark,
        ].join(","));
      });
    });

    // ✅ Download file
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "billing_export.csv";
    a.click();

    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("Export failed:", err);
    alert("Export failed");
  }
};

  const formatAge = (
  y?: number,
  m?: number,
  d?: number
) => {
  const parts: string[] = [];

  if (y && y > 0) parts.push(`${y}y`);
  if (m && m > 0) parts.push(`${m}m`);
  if (d && d > 0) parts.push(`${d}d`);

  // If everything is 0 or undefined
  if (parts.length === 0) return "0d";

  return parts.join(" ");
};

  return (
    <div className="p-8 bg-red-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#e72c3b] mb-2">All Billing Records</h1>
        <p className="text-gray-600">View and export billing transactions</p>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white rounded-lg p-6 border border-pink-100 mb-6"
      >
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-4 gap-4">
            {/* Date Filters */}
            <div>
              <label className="block text-sm font-semibold mb-2">Date From</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Date To</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2">User</label>
              <select
                value={filters.user}
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="All">All</option>
                {users.map((user) => (
                  <option key={user.id} value={user.full_name}>
                    {user.full_name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="All">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.category}>
                    {cat.category}
                  </option>
                ))}

              </select>
            </div>

            <div>
  <label className="block text-sm font-semibold mb-2">Status</label>
  <select
    value={filters.status}
    onChange={(e) =>
      setFilters({ ...filters, status: e.target.value })
    }
    className="w-full px-3 py-2 border rounded-lg bg-white"
  >
    <option value="All">All</option>
    <option value="Active">Active</option>
    <option value="Cancelled">Cancelled</option>
  </select>
</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={handleReset} className="px-4 py-2 border rounded-lg cursor-pointer">
            Reset
          </button>
          <button type="submit" className="px-4 py-2 bg-[#e72c3b] text-white rounded-lg cursor-pointer">
            Apply Filters
          </button>
        </div>
      </form>

      {/* Records */}
      <div className="bg-white rounded-lg p-6 border border-pink-100">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-bold">Billing Records</h2>

            <button
    onClick={handleBulkExport}
    className="px-4 py-2 bg-green-600 text-white rounded-lg"
  >
    Export Excel
  </button>

          {loading && <p>Loading...</p>}
        </div>

        {/* TABLE */}
        {!loading && !error && billingRecords.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3">Bill No.</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Components</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {billingRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{record.bill_no}</td>
                    <td className="px-4 py-3">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{record.user?.full_name || "-"}</td>
                    <td className="px-4 py-3">
                      {record.blood_component_details
                        ?.map((b) => `${b.particulars} (${b.quantity})`)
                        .join(", ")}
                    </td>
                    <td className="px-4 py-3 font-semibold">₹{record.total_amount}</td>
                    <td className="px-4 py-3">
                      {/* {record.is_paid ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
                          Paid
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                          Pending
                        </span>
                      )} */}
                      {record.is_cancelled ? (
  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs">
    Cancelled
  </span>
) : record.is_paid ? (
  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
    Paid
  </span>
) : (
  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
    Pending
  </span>
)}


                    </td>
                 

                    
                    {/* <td className="px-4 py-3 flex gap-2">
  {role === "Admin" && !record.is_cancelled && (
    <button
      onClick={() => setCancelModal(record)}
      className="text-red-600 hover:text-red-800"
    >
      Cancel
    </button>
  )}

  
</td> */}

<td className="px-4 py-3 flex gap-2 items-center">

  <button
    onClick={() => setSelectedRecord(record)}
    className="text-blue-600 hover:text-blue-800"
  >
       <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
  </button>

  {role === "Admin" && !record.is_cancelled && (
    <button
      onClick={() => setCancelModal(record)}
      className="text-red-600 hover:text-red-800"
    >
      Cancel
    </button>
  )}

  {record.is_cancelled && (
    <button
      onClick={() => setRemarkModal(record)}
      className="text-blue-500"
    >
      Remark
    </button>
  )}
</td>


                  </tr>
                ))}
              </tbody>
            </table>

            {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 a4-modal-wrapper">

          <div className="bg-white shadow-2xl rounded-lg p-8 relative border border-gray-300 overflow-visible a4-container">

            {/* 🔴 WATERMARK */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <p className="text-[110px] font-extrabold text-red-300 opacity-10 rotate-[-30deg] tracking-widest select-none">
                DUPLICATE COPY
              </p>
            </div>

            {/* ✅ ACTUAL CONTENT (above watermark) */}
            <div className="relative z-10">

              {/* HEADER */}
              <div className="relative text-center mb-6">

                <img
                  src="/icon.png"
                  alt="Left Logo"
                  className="absolute left-4 top-2 w-16 h-16 object-contain"
                />

                <img
                  src="/icon2.png"
                  alt="Right Logo"
                  className="absolute right-4 top-2 w-16 h-16 object-contain"
                />

                <h1 className="text-3xl font-extrabold mt-1">
                  <span className="text-teal-600">ORCHID</span>{" "}
                  <span className="text-red-600">BLOOD CENTER</span>
                </h1>

                <p className="text-sm text-gray-700 font-medium">
                  Managed By Shonit Foundation
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  H.B. Road, Ranchi, Jharkhand-834001
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  ☎ 0651-7100845
                </p>
              </div>

              {/* PATIENT INFO */}
              <div className="mb-6 text-sm">
                <div className="flex justify-between">
                  <div>
                    <p><strong>Bill No:</strong> {selectedRecord.bill_no}</p>
                    <p><strong>Patient Name:</strong> {selectedRecord.patient_name}</p>
                    {/* <p><strong>Age:</strong> {selectedRecord.age} Yr</p> */}
                   
                        <p>
  <strong>Age:</strong>{" "}
  {formatAge(
    selectedRecord.age_years,
    selectedRecord.age_months,
    selectedRecord.age_days
  )}
</p>
                    <p><strong>Sex:</strong> {selectedRecord.sex}</p>
                    <p><strong>Mobile:</strong> {selectedRecord.mobile_number}</p>
                    <p><strong>Hospital:</strong> {selectedRecord.hospital_name}</p>
                  </div>

                  <div className="text-right">
                    <p><strong>Ward:</strong> {selectedRecord.ward}</p>
                    <p><strong>IPD No:</strong> {selectedRecord.ipd_no}</p>
                    {/* <p><strong>Total:</strong> ₹{selectedRecord.total_amount}</p> */}
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <div className="border border-black">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border px-3 py-2">SL</th>
                      <th className="border px-3 py-2 text-left">PARTICULARS</th>
                      <th className="border px-3 py-2">QUANTITY</th>
                      <th className="border px-3 py-2">PROCESSING CHARGE</th>
                      <th className="border px-3 py-2">CROSSMATCH BY GEL TECHNOLOGY</th>
                      <th className="border px-3 py-2">AMOUNT</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedRecord.blood_component_details.map((item, i) => (
                      <tr key={i}>
                        <td className="border px-3 py-2 text-center">
                          {i + 1}
                        </td>

                        <td className="border px-3 py-2 font-medium text-gray-800">
                          {item.particulars}
                        </td>

                        <td className="border px-3 py-2 text-center">
                          {item.quantity}
                        </td>

                        <td className="border px-3 py-2 text-center">
                          ₹{item.rate}
                        </td>

                        <td className="border px-3 py-2 text-center">
                          {item.crossmatch}
                        </td>

                        <td className="border px-3 py-2 text-right font-semibold">
                          ₹{item.amount}
                        </td>
                      </tr>
                    ))}

                    {/* GROSS TOTAL */}
                    <tr>
                      <td colSpan={3} className="border px-3 py-2"></td>
                      <td className="border px-3 py-2 text-center font-bold">
                        GROSS TOTAL
                      </td>
                      <td colSpan={2} className="border px-3 py-2 text-right font-semibold">
                        ₹{selectedRecord.total_amount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* PAYMENT DETAILS */}
              <div className="mt-4">
                <p>
                  <strong>Payment Mode:</strong> {selectedRecord.payment_method}
                </p>

                {selectedRecord.payment_method !== "CASH" && (
                  <>
                    {selectedRecord.payment_details?.transactionNumber && (
                      <p>
                        <strong>Transaction No:</strong>{" "}
                        {selectedRecord.payment_details.transactionNumber}
                      </p>
                    )}

                    {selectedRecord.payment_details?.utr && (
                      <p>
                        <strong>UTR:</strong>{" "}
                        {selectedRecord.payment_details.utr}
                      </p>
                    )}

                    {selectedRecord.payment_details?.remarks && (
                      <p>
                        <strong>Remarks:</strong>{" "}
                        {selectedRecord.payment_details.remarks}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* FOOTER */}
              <div className="mt-3 flex justify-between">
                <p className="text-sm">
                  <strong>Rupees in words:</strong>{" "}
                  {numberToWordsIndian(selectedRecord.total_amount)} Only
                </p>

                <div className="text-right">
                  <p className="font-semibold">Authorized Signature</p>
                  <div className="h-[50px] w-[150px] border-b border-gray-400 mt-6 mx-auto"></div>
                </div>
              </div>

              <p className="mt-2">
                <strong>Status:</strong>{" "}
                {selectedRecord.is_paid ? "Paid" : "Unpaid"}
              </p>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 mt-8 no-print">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 border rounded-md"
                >
                  Close
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Print
                </button>
              </div>

            </div>
          </div>
        </div>
      )}


            {cancelModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-[400px]">
      <h3 className="text-lg font-semibold mb-4">Cancel Billing</h3>

      <textarea
        placeholder="Enter cancellation remark..."
        value={cancelRemark}
        onChange={(e) => setCancelRemark(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setCancelModal(null)}
          className="px-3 py-1 border rounded"
        >
          Close
        </button>

        <button
          onClick={handleCancel}
          className="px-3 py-1 bg-red-600 text-white rounded"
        >
          Confirm Cancel
        </button>
      </div>
    </div>
  </div>
)}

{remarkModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-[400px]">
      <h3 className="text-lg font-semibold mb-4">Cancel Remark</h3>

      <p className="text-gray-700 whitespace-pre-wrap">
        {remarkModal.cancel_remark || "No remark provided"}
      </p>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setRemarkModal(null)}
          className="px-3 py-1 border rounded"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

            {/* ⭐ PAGINATION SECTION */}
            <div className="flex justify-between items-center px-4 py-4 border-t bg-gray-50 mt-4">
              <span className="text-sm text-gray-600">
                Page {page} of {pagination.totalPages} • Total {pagination.totalRecords} records
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className={`px-4 py-2 border rounded ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                    }`}
                >
                  Previous
                </button>

                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className={`px-4 py-2 border rounded ${page === pagination.totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Records */}
        {!loading && !error && billingRecords.length === 0 && (
          <p className="text-center py-4 text-gray-500">No billing records found.</p>
        )}
      </div>
    </div>
  );
}
