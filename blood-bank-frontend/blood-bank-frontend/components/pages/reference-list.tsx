"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Header } from "./header";
import { toast, Toaster } from "react-hot-toast";

interface RefItem {
  reference_id: string;
  patient_name: string;
  mobile_number: string;
  created_at: string;
  status: string;
}

export default function ReferenceListPage() {
  const [data, setData] = useState<RefItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch references
  const fetchReferences = async () => {
    try {
      const res = await axiosInstance.get("/billings/references");

      setData(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load references");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferences();
  }, []);

  // 🕒 Format date
  const formatDate = (date: string) => {
    const d = new Date(date);

    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-red-50 p-5">
      <Toaster />
      {/* <Header /> */}

      <div className="bg-white p-6 shadow mt-4">
        <h2 className="text-2xl font-bold mb-6">
          Reference List (New → Old)
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : data.length === 0 ? (
          <p>No records found</p>
        ) : (
          <div className="space-y-3">

            {data.map((item) => (
              <div
                key={item.reference_id}
                className="flex justify-between items-center border p-4 rounded hover:bg-red-50 cursor-pointer transition"
              >
                {/* Left */}
                <div>
                  <p className="font-bold text-red-600">
                    {item.reference_id}
                  </p>
                  <p className="text-sm">{item.patient_name}</p>
                  <p className="text-sm text-gray-500">
                    {item.mobile_number}
                  </p>
                </div>

                {/* Right */}
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {formatDate(item.created_at)}
                  </p>

                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}