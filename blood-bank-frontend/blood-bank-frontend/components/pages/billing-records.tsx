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
}

export default function BillingRecords() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [categories, setCategories] = useState<{ id: number; category: string }[]>([]);


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
                        .map((b) => `${b.particulars} (${b.quantity})`)
                        .join(", ")}
                    </td>
                    <td className="px-4 py-3 font-semibold">₹{record.total_amount}</td>
                    <td className="px-4 py-3">
                      {record.is_paid ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
                          Paid
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
