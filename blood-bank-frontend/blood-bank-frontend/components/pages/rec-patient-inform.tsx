"use client";

import React, { useEffect, useState } from "react";
import { Header } from "./header";
import axiosInstance from "../api/axiosInstance";
import { toast, Toaster } from "react-hot-toast";

interface PatientData {
  slNo: string;
  billNo: string;
  date: string;
  patientName: string;
  sex: string;
  age: string;
  mobileNumber: string;
  fatherHusbandName: string;
  hos_bill: string;
  ageYears?: string;
  ageMonths?: string;
  ageDays?: string;
}

const getCurrentDateTime = () => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts: any = formatter.formatToParts(now);
  const get = (type: any) => parts.find((p: any) => p.type === type).value;

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
};

export default function PatientInformationForReception() {
  const [formData, setFormData] = useState<PatientData>({
    date: getCurrentDateTime(),
    slNo: "",
    billNo: "",
    patientName: "",
    sex: "",
    age: "",
    mobileNumber: "",
    fatherHusbandName: "",
    hos_bill: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [referenceId, setReferenceId] = useState("");

  // ⏱ Auto update time
  useEffect(() => {
    const interval = setInterval(() => {
      setFormData((prev) => ({
        ...prev,
        date: getCurrentDateTime(),
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // 🔍 Fetch existing patient by mobile
  const fetchPatientByMobile = async (mobile: string) => {
    try {
      const res = await axiosInstance.get(`/billings/by-mobile/${mobile}`);
      const data = res.data.data;

      toast.success("Existing patient found");

      setFormData((prev) => ({
        ...prev,
        patientName: data.patient_name || "",
        hos_bill: data.hos_bill || "",
        age: data.age || "",
        sex: data.sex || "",
        fatherHusbandName: data.father_husband_name || "",
      }));
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast("New patient", { icon: "🆕" });

        setFormData((prev) => ({
          ...prev,
          patientName: "",
          age: "",
          sex: "",
          fatherHusbandName: "",
          hos_bill: "",
        }));
      } else {
        toast.error("Error fetching patient");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "mobileNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 10);

      setFormData((prev) => ({ ...prev, mobileNumber: digits }));

      if (digits.length === 10) {
        fetchPatientByMobile(digits);
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Validation (ONLY patient fields)
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.patientName.trim())
      newErrors.patientName = "Patient name required";

    if (!formData.sex) newErrors.sex = "Select sex";

    if (!formData.mobileNumber || formData.mobileNumber.length !== 10)
      newErrors.mobileNumber = "Valid mobile required";

    const y = Number(formData.ageYears || 0);
    const m = Number(formData.ageMonths || 0);
    const d = Number(formData.ageDays || 0);

    if (y === 0 && m === 0 && d === 0)
      newErrors.age = "Enter valid age";

    if (!formData.fatherHusbandName.trim())
      newErrors.fatherHusbandName = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 Submit → INIT BILLING
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const payload = {
          patient_name: formData.patientName,
          sex: formData.sex,
          age: JSON.stringify({
            y: Number(formData.ageYears || 0),
            m: Number(formData.ageMonths || 0),
            d: Number(formData.ageDays || 0),
          }),
          mobile_number: formData.mobileNumber,
          father_husband_name: formData.fatherHusbandName,
          hos_bill: formData.hos_bill,
        };

        const res = await axiosInstance.post("/billings/init", payload);

        setReferenceId(res.data.referenceId);

        toast.success("Patient saved successfully");

        // reset
        setFormData({
          date: getCurrentDateTime(),
          slNo: "",
          billNo: "",
          patientName: "",
          sex: "",
          age: "",
          mobileNumber: "",
          fatherHusbandName: "",
          hos_bill: "",
        });

      } catch (err) {
        toast.error("Failed to save patient");
      }
    }
  };

  return (
    <div className="min-h-screen bg-red-50 p-5">
      <Toaster />
      <Header />

      <div className="bg-white p-8 shadow">
        <h2 className="text-2xl font-bold mb-6">Patient Information</h2>

        {referenceId && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 font-bold">
            Reference ID: {referenceId}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

  {/* Mobile */}
  <div>
    <label className="block mb-1">Mobile Number *</label>
    <input
      name="mobileNumber"
      value={formData.mobileNumber}
      onChange={handleChange}
      className="w-full border p-2 rounded"
    />
    {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber}</p>}
  </div>

  {/* Aadhaar */}
  <div>
    <label className="block mb-1">Aadhaar</label>
    <input
      name="hos_bill"
      value={formData.hos_bill}
      onChange={handleChange}
      className="w-full border p-2 rounded"
    />
  </div>

  {/* Patient Name */}
  <div>
    <label className="block mb-1">Patient Name *</label>
    <input
      name="patientName"
      value={formData.patientName}
      onChange={handleChange}
      className="w-full border p-2 rounded"
    />
    {errors.patientName && <p className="text-red-500 text-sm">{errors.patientName}</p>}
  </div>

  {/* Sex */}
  <div>
    <label className="block mb-1">Sex *</label>
    <select
      name="sex"
      value={formData.sex}
      onChange={handleChange}
      className="w-full border p-2 rounded"
    >
      <option value="">Select</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
    {errors.sex && <p className="text-red-500 text-sm">{errors.sex}</p>}
  </div>

  {/* Age */}
  <div className="md:col-span-2">
    <label className="block mb-1">Age *</label>

    <div className="flex gap-2">
      <input
        type="number"
        placeholder="Years"
        value={formData.ageYears || ""}
        onChange={(e) => {
          const val = Math.min(120, Math.max(0, Number(e.target.value)));
          setFormData({ ...formData, ageYears: val.toString() });
        }}
        className="w-1/3 border p-2 rounded"
      />

      <input
        type="number"
        placeholder="Months"
        value={formData.ageMonths || ""}
        onChange={(e) => {
          const val = Math.min(11, Math.max(0, Number(e.target.value)));
          setFormData({ ...formData, ageMonths: val.toString() });
        }}
        className="w-1/3 border p-2 rounded"
      />

      <input
        type="number"
        placeholder="Days"
        value={formData.ageDays || ""}
        onChange={(e) => {
          const val = Math.min(31, Math.max(0, Number(e.target.value)));
          setFormData({ ...formData, ageDays: val.toString() });
        }}
        className="w-1/3 border p-2 rounded"
      />
    </div>

    {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
  </div>

  {/* Father Name */}
  <div>
    <label className="block mb-1">Father/Husband *</label>
    <input
      name="fatherHusbandName"
      value={formData.fatherHusbandName}
      onChange={handleChange}
      className="w-full border p-2 rounded"
    />
    {errors.fatherHusbandName && (
      <p className="text-red-500 text-sm">{errors.fatherHusbandName}</p>
    )}
  </div>

  {/* Submit */}
  <div className="md:col-span-2">
    <button className="w-full bg-red-600 text-white p-3 rounded">
      Generate Reference ID
    </button>
  </div>

</form>
      </div>
    </div>
  );
}