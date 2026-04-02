"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import axiosInstance from "@/components/api/axiosInstance";
import ProjectApiList from "@/components/api/ProjectApiList";

interface BloodCategory {
  id?: number;
  category: string;
  cross_match: number;   // NEW FIELD
  rate: number;
  is_active: boolean;
  is_available: boolean;
  created_at?: string;
}


export default function BillingSetup() {
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bloodCategories, setBloodCategories] = useState<BloodCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<BloodCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bloodGroups, setBloodGroups] = useState<any[]>([]);
  const [bloodComponents, setBloodComponents] = useState<any[]>([]);


  const [categoryForm, setCategoryForm] = useState({
    category: "",
    cross_match: 0,
    rate: "",
    is_active: true,
    is_available: true,
  });

  // ✅ Fetch all blood categories
  const fetchBloodCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(ProjectApiList.bloodCategories);
      setBloodCategories(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBloodGroups = async () => {
    try {
      const res = await axiosInstance.get(ProjectApiList.bloodGroupMaster);
      setBloodGroups(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch blood groups:", err);
    }
  };

  const fetchBloodComponents = async () => {
    try {
      const res = await axiosInstance.get(ProjectApiList.bloodComponentMaster);
      setBloodComponents(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch blood components:", err);
    }
  };


  useEffect(() => {
    fetchBloodCategories();     // your existing function
    fetchBloodGroups();         // new
    fetchBloodComponents();     // new
  }, []);


  // ✅ Handle form inputs
  const handleCategoryInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setCategoryForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "rate"
            ? Number(value)
            : name === "cross_match"
              ? Number(value)   // NEW
              : value,
    }));
  };


  // ✅ Add or update blood category
  const handleSubmitCategory = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingCategory) {
        // Update existing
        const res = await axiosInstance.put(
          `${ProjectApiList.bloodCategories}/${editingCategory.id}`,
          categoryForm
        );
        setSuccess(res.data.message || "Category updated successfully.");
      } else {
        // Create new
        const res = await axiosInstance.post(ProjectApiList.bloodCategories, categoryForm);
        setSuccess(res.data.message || "Category created successfully.");
      }

      // Reset form & refresh list
      setIsModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({
        category: "",
        cross_match: 0,
        rate: "",
        is_active: true,
        is_available: true,
      });
      fetchBloodCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Operation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit handler
  const handleEdit = (cat: BloodCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      category: cat.category,
      cross_match: cat.cross_match,
      rate: String(cat.rate),
      is_active: cat.is_active,
      is_available: cat.is_available,
    });

    setIsModalOpen(true);
  };

  // ✅ Delete handler
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axiosInstance.delete(`${ProjectApiList.bloodCategories}/${id}`);
      setSuccess(res.data.message || "Category deleted successfully.");
      fetchBloodCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-red-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#e72c3b] mb-2">Billing Setup</h1>
        <p className="text-gray-600">Configure blood categories and rates for billing</p>
      </div>

      {/* GST Section */}
      {/* <div className="bg-white rounded-lg p-6 border border-pink-100 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Tax Configuration</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Enable GST</p>
              <p className="text-sm text-gray-600">Apply GST on all transactions</p>
            </div>
            <button
              onClick={() => setGstEnabled(!gstEnabled)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${gstEnabled ? "bg-pink-600" : "bg-gray-300"
                }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${gstEnabled ? "translate-x-7" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {gstEnabled && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                GST Percentage (%)
              </label>
              <input
                type="number"
                value={gstPercentage}
                onChange={(e) => setGstPercentage(Number(e.target.value))}
                className="w-full max-w-xs px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>
          )}
        </div>
      </div> */}

      {/* Blood Categories */}
      <div className="bg-white rounded-lg p-6 border border-pink-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Blood Categories & Rates
            </h2>
            <p className="text-gray-600 text-sm">Manage blood category pricing</p>
          </div>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setEditingCategory(null);
              setCategoryForm({
                category: "",
                cross_match: 0,
                rate: "",
                is_active: true,
                is_available: true,
              });
            }}
            className="bg-[#e72c3b] text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Category
          </button>
        </div>

        {/* Error/Success messages */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 mb-3 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 p-3 mb-3 rounded-md text-sm border border-green-200">
            {success}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-900">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">Rate (₹)</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">Cross Match</th>
                {/* <th className="text-left px-4 py-3 font-semibold text-gray-900">Status</th> */}
                <th className="text-left px-4 py-3 font-semibold text-gray-900">Availability</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bloodCategories.length > 0 ? (
                bloodCategories.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-pink-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900">{item.category}</td>
                    <td className="px-4 py-3 text-gray-900 font-semibold">₹{item.rate}</td>
                    <td className="px-4 py-3 text-gray-900">{item.cross_match}</td>
                    {/* <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td> */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${item.is_available ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-800"
                          }`}
                      >
                        {item.is_available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-pink-600 hover:bg-pink-100 p-2 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id!)}
                          className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-6 italic">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4 mb-6">

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Blood Component Category
                </label>
                <select
                  name="category"
                  value={categoryForm.category}
                  onChange={handleCategoryInputChange}
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select Category</option>

                  {bloodComponents
                    .filter((c) => c.is_active === true)
                    .map((item) => (
                      <option key={item.id} value={item.component_name}>
                        {item.component_name}
                      </option>
                    ))}

                </select>
              </div>



              {/* Rate */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Rate
                </label>
                <input
                  type="number"
                  name="rate"
                  value={categoryForm.rate}
                  onChange={handleCategoryInputChange}
                  placeholder="Enter rate"
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Cross Match */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Cross Match Value
                </label>
                <input
                  type="number"
                  name="cross_match"
                  value={categoryForm.cross_match}
                  onChange={handleCategoryInputChange}
                  placeholder="Enter cross match value (default 0)"
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Available
                </label>
                <input
                  type="checkbox"
                  name="is_available"
                  checked={categoryForm.is_available}
                  onChange={handleCategoryInputChange}
                  className="w-4 h-4"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitCategory}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${loading ? "bg-pink-300 cursor-not-allowed" : "bg-[#e72c3b] hover:bg-orange-700"
                  }`}
              >
                {loading
                  ? editingCategory
                    ? "Updating..."
                    : "Creating..."
                  : editingCategory
                    ? "Update Category"
                    : "Add Category"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
