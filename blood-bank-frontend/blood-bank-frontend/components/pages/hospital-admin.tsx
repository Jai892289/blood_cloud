"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/components/api/axiosInstance";
import ProjectApiList from "@/components/api/ProjectApiList";

type Hospital = {
id: number;
hospital_name: string;
commission: string;
serial_no: number;
is_active: boolean;
};

export default function HospitalAdmin() {
const [list, setList] = useState<Hospital[]>([]);
const [loading, setLoading] = useState(false);
const [showForm, setShowForm] = useState(false);
const [editing, setEditing] = useState<Hospital | null>(null);
const [form, setForm] = useState({
hospital_name: "",
commission: "",
serial_no: 0,
is_active: true,
});
const [error, setError] = useState("");

const fetchList = async () => {
setLoading(true);
try {
const res = await axiosInstance.get(ProjectApiList.hospitals);
setList(res.data.data || []);
} catch (err: any) {
setError(err?.response?.data?.message || "Failed to fetch hospitals.");
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchList();
}, []);

const openCreate = () => {
setEditing(null);
setForm({
hospital_name: "",
commission: "",
serial_no: 0,
is_active: true,
});
setError("");
setShowForm(true);
};

const openEdit = (item: Hospital) => {
setEditing(item);
setForm({
hospital_name: item.hospital_name,
commission: item.commission,
serial_no: item.serial_no,
is_active: item.is_active,
});
setError("");
setShowForm(true);
};

const submit = async () => {
setError("");


if (!form.hospital_name.trim()) {
  setError("Hospital name is required.");
  return;
}

try {
  if (editing) {
    await axiosInstance.put(
      `${ProjectApiList.hospitals}/${editing.id}`,
      form
    );
  } else {
    await axiosInstance.post(ProjectApiList.hospitals, form);
  }

  setShowForm(false);
  fetchList();
} catch (err: any) {
  setError(err?.response?.data?.message || "Save failed.");
}


};

const remove = async (id: number) => {
if (!confirm("Delete this hospital?")) return;


try {
  await axiosInstance.delete(`${ProjectApiList.hospitals}/${id}`);
  fetchList();
} catch (err: any) {
  alert(err?.response?.data?.message || "Delete failed.");
}


};

return ( <div className="p-4 bg-red-50"> <div className="flex justify-between items-center mb-4"> <h2 className="text-xl font-semibold">Hospitals</h2> <button
       onClick={openCreate}
       className="bg-primary text-white px-3 py-1 rounded"
     >
+ Add Hospital </button> </div>


  {loading ? (
    <div>Loading...</div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th>#</th>
            <th>Name</th>
            <th>Commission (%)</th>
            <th>Serial</th>
            <th>Active</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((h) => (
            <tr key={h.id} className="border-t">
              <td className="py-2">{h.id}</td>
              <td className="py-2">{h.hospital_name}</td>
              <td className="py-2">{h.commission}%</td>
              <td className="py-2">{h.serial_no}</td>
              <td className="py-2">
                {h.is_active ? "Yes" : "No"}
              </td>
              <td className="py-2">
                <button
                  onClick={() => openEdit(h)}
                  className="text-blue-600 mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(h.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {list.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="py-6 text-center text-muted-foreground"
              >
                No records
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}

  {showForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-3">
          {editing ? "Edit Hospital" : "Add Hospital"}
        </h3>

        {error && (
          <div className="mb-3 text-sm text-red-600">{error}</div>
        )}

        <label className="block text-sm mb-1">Hospital Name</label>
        <input
          value={form.hospital_name}
          onChange={(e) =>
            setForm({ ...form, hospital_name: e.target.value })
          }
          className="w-full mb-3 p-2 border rounded"
        />

        <label className="block text-sm mb-1">Commission (%)</label>
        <input
          type="number"
          value={form.commission}
          onChange={(e) =>
            setForm({ ...form, commission: e.target.value })
          }
          className="w-full mb-3 p-2 border rounded"
        />

        <label className="block text-sm mb-1">Serial No</label>
        <input
          type="number"
          value={form.serial_no}
          onChange={(e) =>
            setForm({
              ...form,
              serial_no: Number(e.target.value),
            })
          }
          className="w-full mb-3 p-2 border rounded"
        />

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm({ ...form, is_active: e.target.checked })
            }
          />
          <span className="text-sm">Active</span>
        </label>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowForm(false)}
            className="px-3 py-1 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-3 py-1 bg-primary text-white rounded"
          >
            {editing ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  )}
</div>

);
}
