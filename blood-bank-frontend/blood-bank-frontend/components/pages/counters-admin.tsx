"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/components/api/axiosInstance";
import ProjectApiList from "@/components/api/ProjectApiList";

type Counter = {
  id: number;
  counter_name: string;
  location: string;
  is_active: boolean;
};

export default function CountersAdmin() {
  const [list, setList] = useState<Counter[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Counter | null>(null);
  const [form, setForm] = useState({ counter_name: "", location: "", is_active: true });
  const [error, setError] = useState("");

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ProjectApiList.counters);
      setList(res.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch counters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ counter_name: "", location: "", is_active: true });
    setError("");
    setShowForm(true);
  };

  const openEdit = (item: Counter) => {
    setEditing(item);
    setForm({ counter_name: item.counter_name, location: item.location, is_active: item.is_active });
    setError("");
    setShowForm(true);
  };

  const submit = async () => {
    setError("");
    if (!form.counter_name.trim() || !form.location.trim()) {
      setError("Name and location are required.");
      return;
    }
    try {
      if (editing) {
        await axiosInstance.put(`${ProjectApiList.counters}/${editing.id}`, form);
      } else {
        await axiosInstance.post(ProjectApiList.counters, form);
      }
      setShowForm(false);
      fetchList();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Save failed.");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this counter?")) return;
    try {
      await axiosInstance.delete(`${ProjectApiList.counters}/${id}`);
      fetchList();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className="p-4 bg-red-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Counters</h2>
        <button onClick={openCreate} className="bg-primary text-white px-3 py-1 rounded">+ Add Counter</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left"><th>#</th><th>Name</th><th>Location</th><th>Active</th><th>Action</th></tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="py-2">{c.id}</td>
                  <td className="py-2">{c.counter_name}</td>
                  <td className="py-2">{c.location}</td>
                  <td className="py-2">{c.is_active ? "Yes" : "No"}</td>
                  <td className="py-2">
                    <button onClick={() => openEdit(c)} className="text-blue-600 mr-3">Edit</button>
                    <button onClick={() => remove(c.id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No records</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">{editing ? "Edit Counter" : "Add Counter"}</h3>
            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            <label className="block text-sm mb-1">Counter Name</label>
            <input value={form.counter_name} onChange={(e) => setForm({ ...form, counter_name: e.target.value })} className="w-full mb-3 p-2 border rounded" />

            <label className="block text-sm mb-1">Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full mb-3 p-2 border rounded" />

            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <span className="text-sm">Active</span>
            </label>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={submit} className="px-3 py-1 bg-primary text-white rounded">{editing ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
