"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import ProjectApiList from "../api/ProjectApiList";

interface BloodCategory {
  id: number;
  category: string;
  cross_match: string;
  rate: string; // from API, convert to number when used
  is_available: boolean;
}

interface BloodComponent {
  id: string;
  category_id?: number;
  particulars: string;
  quantity: number;
  rate: number;
  crossmatch: number;
  amount: number;
}

interface BloodComponentTableProps {
  components: BloodComponent[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof BloodComponent | "bulk", value: any) => void;
  onRemove: (id: string) => void;
}

export default function BloodComponentTable({ components, onAdd, onUpdate, onRemove }: BloodComponentTableProps) {
  const [bloodCategories, setBloodCategories] = useState<BloodCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBloodCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ProjectApiList.bloodCategories);
      setBloodCategories(res.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodCategories();
  }, []);

  // IMPORTANT: send a single bulk update so particulars+rate+category_id update together
  const handleParticularSelect = (compId: string, categoryId: number) => {
    const selected = bloodCategories.find((cat) => cat.id === categoryId);

    if (selected) {
      onUpdate(compId, "bulk", {
        category_id: selected.id,
        particulars: selected.category,   // NO blood_group now
        rate: Number(selected.rate) || 0,
        crossmatch: Number(selected.cross_match) || 0,   // ⭐ AUTO-FILL
      });
    }
  };


  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-2xl font-bold text-foreground">Blood Component Details</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-primary-foreground bg-[#E72C3B]">
              <th className="px-4 py-3 text-left font-semibold text-sm">SL</th>
              <th className="px-4 py-3 text-left font-semibold text-sm">PARTICULARS</th>
              <th className="px-4 py-3 text-center font-semibold text-sm">QUANTITY</th>
              <th className="px-4 py-3 text-center font-semibold text-sm">RATE</th>
              <th className="px-4 py-3 text-center font-semibold text-sm">CROSSMATCH</th>
              <th className="px-4 py-3 text-center font-semibold text-sm">AMOUNT</th>
              <th className="px-4 py-3 text-center font-semibold text-sm">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {components.map((comp, index) => (
              <tr key={comp.id} className="border-b border-border hover:bg-secondary/50">
                <td className="px-4 py-3 text-sm">{index + 1}</td>

                <td className="px-4 py-3 text-sm">
                  <select
                    value={comp.category_id ?? ""}
                    onChange={(e) => handleParticularSelect(comp.id, Number(e.target.value))}
                    className="w-full px-2 py-1 border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select Particular</option>
                    {bloodCategories
                      .filter((cat) => cat.is_available === true)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.category} — ₹{cat.rate} — CM: {cat.cross_match}
                        </option>
                      ))}

                  </select>
                </td>

                <td className="px-4 py-3 text-sm">
                  <input
                    type="number"
                    value={comp.quantity}
                    onChange={(e) => onUpdate(comp.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-border rounded bg-background text-center"
                  />
                </td>

                <td className="px-4 py-3 text-sm">
                  <input disabled type="number" value={comp.rate} className="w-full px-2 py-1 border border-border rounded bg-gray-100 text-center" />
                </td>

                <td className="px-4 py-3 text-sm">
                  <input
                    disabled
                    type="number"
                    value={comp.crossmatch}
                    onChange={(e) => onUpdate(comp.id, "crossmatch", Number.parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-border rounded bg-gray-100 text-center"
                  />
                </td>

                <td className="px-4 py-3 text-sm font-semibold text-center">₹{Number(comp.amount || 0).toFixed(2)}</td>

                <td className="px-4 py-3 text-center">
                  <button onClick={() => onRemove(comp.id)} className="inline-flex items-center justify-center w-8 h-8 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {components.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <p>No blood components added yet</p>
        </div>
      )}

      <div className="p-6 border-t border-border flex justify-end">
        <button type="button" onClick={onAdd} className="inline-flex items-center justify-center w-10 h-10 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors font-bold text-lg">
          +
        </button>
      </div>
    </div>
  );
}
