"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/components/api/axiosInstance";
import ProjectApiList from "@/components/api/ProjectApiList";

type Group = {
  id: number;
  group_name: string;
  is_active: boolean;
};

export default function BloodGroupMasterAdmin() {
  const [list, setList] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ProjectApiList.bloodGroupMaster);
      setList(res.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setGroupName("");
    setIsActive(true);
    setError("");
    setShowForm(true);
  };

  const openEdit = (g: Group) => {
    setEditing(g);
    setGroupName(g.group_name);
    setIsActive(g.is_active);
    setError("");
    setShowForm(true);
  };

  const submit = async () => {
    setError("");
    if (!groupName.trim()) {
      setError("Group name is required.");
      return;
    }

    try {
      if (editing) {
        await axiosInstance.put(`${ProjectApiList.bloodGroupMaster}/${editing.id}`, {
          group_name: groupName.trim(),
          is_active: isActive,
        });
      } else {
        await axiosInstance.post(ProjectApiList.bloodGroupMaster, {
          group_name: groupName.trim(),
          is_active: isActive,
        });
      }
      setShowForm(false);
      fetchList();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Save failed.");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this blood group?")) return;
    try {
      await axiosInstance.delete(`${ProjectApiList.bloodGroupMaster}/${id}`);
      fetchList();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Blood Group Master</h2>
        <button onClick={openCreate} className="bg-primary text-white px-3 py-1 rounded">+ Add Group</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>#</th>
                <th>Group</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="py-2">{g.id}</td>
                  <td className="py-2">{g.group_name}</td>
                  <td className="py-2">{g.is_active ? "Yes" : "No"}</td>
                  <td className="py-2">
                    <button onClick={() => openEdit(g)} className="text-blue-600 mr-3">Edit</button>
                    <button onClick={() => remove(g.id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">No records</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-3">{editing ? "Edit Group" : "Add Group"}</h3>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            <label className="block text-sm mb-1">Group Name</label>
            <input value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full mb-3 p-2 border rounded" />

            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
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
