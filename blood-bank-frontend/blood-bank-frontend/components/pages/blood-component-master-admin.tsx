"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/components/api/axiosInstance";
import ProjectApiList from "@/components/api/ProjectApiList";

type ComponentItem = {
  id: number;
  component_name: string;
  description?: string;
  is_active: boolean;
};

export default function BloodComponentMasterAdmin() {
  const [list, setList] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ComponentItem | null>(null);
  const [form, setForm] = useState({ component_name: "", description: "", is_active: true });
  const [error, setError] = useState("");

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ProjectApiList.bloodComponentMaster);
      setList(res.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch components.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ component_name: "", description: "", is_active: true });
    setError("");
    setShowForm(true);
  };

  const openEdit = (it: ComponentItem) => {
    setEditing(it);
    setForm({ component_name: it.component_name, description: it.description || "", is_active: it.is_active });
    setError("");
    setShowForm(true);
  };

  const submit = async () => {
    setError("");
    if (!form.component_name.trim()) {
      setError("Component name is required.");
      return;
    }
    try {
      if (editing) {
        await axiosInstance.put(`${ProjectApiList.bloodComponentMaster}/${editing.id}`, form);
      } else {
        await axiosInstance.post(ProjectApiList.bloodComponentMaster, form);
      }
      setShowForm(false);
      fetchList();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Save failed.");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this component?")) return;
    try {
      await axiosInstance.delete(`${ProjectApiList.bloodComponentMaster}/${id}`);
      fetchList();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className="p-4 bg-red-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Blood Component Master</h2>
        <button onClick={openCreate} className="bg-primary text-white px-3 py-1 rounded">+ Add Component</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>#</th><th>Name</th><th>Description</th><th>Active</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="py-2">{it.id}</td>
                  <td className="py-2">{it.component_name}</td>
                  <td className="py-2">{it.description || "-"}</td>
                  <td className="py-2">{it.is_active ? "Yes" : "No"}</td>
                  <td className="py-2">
                    <button onClick={() => openEdit(it)} className="text-blue-600 mr-3">Edit</button>
                    <button onClick={() => remove(it.id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-3">{editing ? "Edit Component" : "Add Component"}</h3>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            <label className="block text-sm mb-1">Name</label>
            <input value={form.component_name} onChange={(e) => setForm({ ...form, component_name: e.target.value })} className="w-full mb-3 p-2 border rounded" />

            <label className="block text-sm mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full mb-3 p-2 border rounded" />

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
