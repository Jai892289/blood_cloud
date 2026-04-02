"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/components/api/axiosInstance";
import ProjectApiList from "@/components/api/ProjectApiList";

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
  patient_name: string;
  total_amount: number;
  is_paid: boolean;
  payment_method: string;
  payment_details:any;
  sex?: string;
  age?: number;
  mobile_number?: string;
  father_husband_name?: string;
  hospital_name?: string;
  referred_by_dr?: string;
  crn?: string;
  ward?: string;
  bed?: string;
  ipd_no?: string;
  blood_component_details: BloodComponent[];
}

export default function CounterBillingHistory() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [categories, setCategories] = useState<string[]>([]);


  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalRecords: 0,
  });


  // const [filters, setFilters] = useState({
  //   fromDate: "",
  //   toDate: "",
  //   category: "All",
  // });

  const [filters, setFilters] = useState({
  fromDate: "",
  toDate: "",
  category: "All",
  patientName: "",
  mobileNumber: "",
  paymentMethod: "All",
});

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get(ProjectApiList.bloodCategories);
      const list = res.data.data || [];

      // Extract Unique Category Names
      const uniqueCategories:any = [...new Set(list.map((item: any) => item.category))];

      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  // 🩸 Fetch Billing Data (with filters)
  const fetchBillings = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem("userId"); // 👈 get from localStorage

      const params: any = {
        page,
        limit,
      };

      // Apply filters
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.patientName) params.patient_name = filters.patientName;
if (filters.mobileNumber) params.mobile_number = filters.mobileNumber;
if (filters.paymentMethod && filters.paymentMethod !== "All") {
  params.payment_method = filters.paymentMethod;
}
      if (filters.category && filters.category !== "All")
        params.particulars = filters.category;

      // ⭐ ADD USER ID (optional)
      if (userId) params.user_id = userId;

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


  useEffect(() => {
    fetchBillings();
    fetchCategories();   // 👈 ADD THIS
  }, [page]);


  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // reset to first page
    fetchBillings();
  };


  const handleReset = () => {
    setFilters({ fromDate: "", toDate: "", category: "All", patientName:"", mobileNumber:"" , paymentMethod: "All"});
    setPage(1);
    fetchBillings();
  };

  const handleBulkExport = async () => {
  try {
    // 🔥 Fetch ALL data (ignore pagination)
    const res = await axiosInstance.get(ProjectApiList.billings, {
      params: {
        page: 1,
        limit: 10000, // large limit for full export
      },
    });

    const records = res.data.data || [];

    let csvRows: string[] = [];

    // ✅ CSV HEADER (matches your Excel)
    csvRows.push([
      "Bill No",
      "Patient Name",
      "Mobile",
      "Hospital",
      "Ward",
      "Father/Husband",
      "Date",
      "Particulars",
      "Quantity",
      "Rate",
      "Crossmatch",
      "Bill Total",
      "Paid",
      "Payment Method",
      "Remark",
      "Txn / UTR",
      "HOSPITAL PATIENT REG. NO",
      "HOSPITAL BILL"
    ].join(","));

    // ✅ Flatten data (IMPORTANT)
    records.forEach((record: any) => {
      const components = record.blood_component_details || [];

      components.forEach((item: any) => {
        csvRows.push([
          record.bill_no,
          record.patient_name,
          record.mobile_number,
          record.hospital_name,
          record.ward,
          record.father_husband_name,
          new Date(record.date).toLocaleDateString(),
          item.particulars,
          item.quantity,
          item.rate,
          item.crossmatch,
          record.total_amount,
          record.is_paid ? "Yes" : "No",
          record.payment_method,
          record.payment_details?.remarks || "",
          record.payment_details?.utr || record.payment_details?.transaction_number || "",
            record.hos_pat_reg || "",
  record.hos_bill || "",
        ].join(","));
      });
    });

    // 📁 Create file
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "billing_export.csv";
    link.click();

  } catch (err) {
    console.error("Export failed:", err);
    alert("Failed to export data");
  }
};

const role = localStorage.getItem("userRole");




  return (
    <div className="p-8">
      {/* Header */}
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Billing Records</h1>
        <p className="text-gray-600">View and manage all your billing history</p>
      </div> */}

      <div className="mb-8 flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">My Billing Records</h1>
    <p className="text-gray-600">View and manage all your billing history</p>
  </div>

 
    {role !== "Counter" && (
<button
    onClick={handleBulkExport}
    className="bg-green-600 text-white cursor-pointer px-5 py-2 rounded-md font-semibold hover:bg-green-700"
  >
    Bulk Export
  </button>    )}
  
  
</div>

      {/* Filters */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <h3 className="text-lg font-bold text-gray-900">Filter Records</h3>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
               Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            >
              <option value="All">All</option>

              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-4">

  {/* Patient Name */}
  <div>
    <label className="block text-sm font-medium mb-2">Patient Name</label>
    <input
      type="text"
      value={filters.patientName}
      onChange={(e) =>
        setFilters({ ...filters, patientName: e.target.value })
      }
      className="w-full px-4 py-2 border rounded-lg"
      placeholder="Search by name"
    />
  </div>

  {/* Mobile Number */}
  <div>
    <label className="block text-sm font-medium mb-2">Mobile Number</label>
    <input
      type="text"
      value={filters.mobileNumber}
      onChange={(e) =>
        setFilters({ ...filters, mobileNumber: e.target.value })
      }
      className="w-full px-4 py-2 border rounded-lg"
      placeholder="Search by mobile"
    />
  </div>

  {/* Payment Method */}
  <div>
    <label className="block text-sm font-medium mb-2">Payment Method</label>
    <select
      value={filters.paymentMethod}
      onChange={(e) =>
        setFilters({ ...filters, paymentMethod: e.target.value })
      }
      className="w-full px-4 py-2 border rounded-lg"
    >
      <option value="All">All</option>
      <option value="Cash">Cash</option>
      <option value="Card">Card</option>
      <option value="FOC">FOC</option>
      <option value="Credit">Credit</option>
      <option value="Bank">Bank</option>
    </select>
  </div>

</div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition cursor-pointer"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">
            Billing Records ({billingRecords.length})
          </h3>
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>

        {error && (
          <div className="p-6 text-red-600 font-medium text-center">{error}</div>
        )}

        {!loading && !error && billingRecords.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bill No.</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Patient</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Components</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Is Paid</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment Method</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {billingRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{record.bill_no}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.patient_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.blood_component_details
                        .map((item) => `${item.particulars} (${item.quantity})`)
                        .join(", ")}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₹{record.total_amount}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {record.is_paid ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.payment_method || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        title="View Details"
                        onClick={() => setSelectedRecord(record)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">

                <span className="text-sm text-gray-600">
                  Page {page} of {pagination.totalPages} • Total {pagination.totalRecords} records
                </span>

                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className={`px-4 py-2 rounded border ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                      }`}
                  >
                    Previous
                  </button>

                  <button
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    className={`px-4 py-2 rounded border ${page === pagination.totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {!loading && !error && billingRecords.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No billing records available.
          </div>
        )}
      </div>

      {/* 🧾 View Details Modal */}
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
              <p><strong>Age:</strong> {selectedRecord.age} Yr</p>
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
                    { i + 1}
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


    </div>
  );
}

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
