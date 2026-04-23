"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import ProjectApiList from "../api/ProjectApiList";
import { toast, Toaster } from "react-hot-toast";

interface PatientData {
patientName: string;
sex: string;
mobileNumber: string;
fatherHusbandName: string;

ageYears?: string;
ageMonths?: string;
ageDays?: string;

hospitalName: string;
referredByDr: string;
ward: string;
ipdNo: string;
hos_pat_reg: string;
hos_bill: string;
}

export default function PatientInformationForReception() {
const [formData, setFormData] = useState<PatientData>({
patientName: "",
sex: "",
mobileNumber: "",
fatherHusbandName: "",
ageYears: "",
ageMonths: "",
ageDays: "",
hospitalName: "",
referredByDr: "",
ward: "",
ipdNo: "",
hos_pat_reg: "",
hos_bill: "",
});

const [hospitals, setHospitals] = useState<any[]>([]);
const [referenceId, setReferenceId] = useState("");

useEffect(() => {
const fetchHospitals = async () => {
try {
const res = await axiosInstance.get(ProjectApiList.hospitals);
setHospitals(res.data.data || res.data || []);
} catch {
toast.error("Failed to load hospitals");
}
};
fetchHospitals();
}, []);

// 🔥 Fetch existing patient
const fetchPatientByMobile = async (mobile: string) => {
try {
const res = await axiosInstance.get(`/billings/by-mobile/${mobile}`);
const data = res.data.data;


  toast.success("Existing patient found");

  let parsedAge = { y: "", m: "", d: "" };

  try {
    if (data.age) {
      const ageObj = JSON.parse(data.age);
      parsedAge = {
        y: ageObj.y?.toString() || "",
        m: ageObj.m?.toString() || "",
        d: ageObj.d?.toString() || "",
      };
    }
  } catch {}

  setFormData((prev) => ({
    ...prev,
    patientName: data.patient_name || "",
    sex: data.sex || "",
    fatherHusbandName: data.father_husband_name || "",
    hos_bill: data.hos_bill || "",
    ageYears: parsedAge.y,
    ageMonths: parsedAge.m,
    ageDays: parsedAge.d,
  }));
} catch (err: any) {
  if (err.response?.status === 404) {
    toast("New patient", { icon: "🆕" });
  } else {
    toast.error("Error fetching patient");
  }
}


};

// 🔹 Input handler with restrictions
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

if (name === "hos_bill") {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  setFormData((prev) => ({ ...prev, hos_bill: digits }));
  return;
}

if (name === "patientName") {
  const clean = value.replace(/[^a-zA-Z\s]/g, "");
  setFormData((prev) => ({ ...prev, patientName: clean }));
  return;
}

setFormData((prev) => ({ ...prev, [name]: value }));


};

// 🔹 Validation
const validateForm = () => {
const name = formData.patientName.trim();
if (!name) return "Patient name required";
if (name.length < 2) return "Patient name too short";


if (!formData.sex || !["male", "female"].includes(formData.sex))
  return "Select valid sex";

if (!/^[0-9]{10}$/.test(formData.mobileNumber))
  return "Enter valid 10-digit mobile number";

if (formData.hos_bill && !/^[0-9]{12}$/.test(formData.hos_bill))
  return "Enter valid 12-digit Aadhaar";

const y = Number(formData.ageYears || 0);
const m = Number(formData.ageMonths || 0);
const d = Number(formData.ageDays || 0);

if (y === 0 && m === 0 && d === 0)
  return "Enter valid age";

if (m > 11) return "Months must be 0–11";
if (d > 31) return "Days must be 0–31";

if (!formData.fatherHusbandName.trim())
  return "Father/Husband name required";

if (!formData.hospitalName)
  return "Select hospital";

if (!formData.referredByDr.trim())
  return "Doctor name required";

if (!formData.ward.trim())
  return "Ward required";

if (!formData.ipdNo)
  return "Select category";

if (!formData.hos_pat_reg.trim())
  return "Hospital reg no required";

return null;


};

// 🔹 Submit
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();


const error = validateForm();
if (error) {
  toast.error(error);
  return;
}

try {
  const payload = {
    patient_name: formData.patientName.trim(),
    sex: formData.sex,

    age: JSON.stringify({
      y: Number(formData.ageYears || 0),
      m: Number(formData.ageMonths || 0),
      d: Number(formData.ageDays || 0),
    }),

    mobile_number: formData.mobileNumber.trim(),
    father_husband_name: formData.fatherHusbandName.trim(),

    hospital_name: formData.hospitalName,
    referred_by_dr: formData.referredByDr.trim(),
    ward: formData.ward.trim(),
    ipd_no: formData.ipdNo,
    hos_pat_reg: formData.hos_pat_reg.trim(),
    hos_bill: formData.hos_bill.trim(),
  };

  const res = await axiosInstance.post("/billings/init", payload);

  setReferenceId(res.data.referenceId);
  toast.success("Reference generated");

} catch (err: any) {
  toast.error(err.response?.data?.message || "Error");
}


};

return ( <div className="min-h-screen bg-red-50 p-6"> <Toaster />


  <div className="bg-white p-8 shadow rounded mx-auto">
    <h2 className="text-2xl font-bold mb-6">
      Patient Information (Reception)
    </h2>

    {referenceId && (
      <div className="bg-green-100 p-4 mb-6 font-semibold rounded">
        Reference ID: {referenceId}
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <input name="mobileNumber" value={formData.mobileNumber}
          onChange={handleChange} placeholder="Mobile *"
          className="border p-3 rounded"/>

        <input name="hos_bill" value={formData.hos_bill}
          onChange={handleChange} placeholder="Aadhaar"
          className="border p-3 rounded"/>

        <input name="patientName" value={formData.patientName}
          onChange={handleChange} placeholder="Patient Name *"
          className="border p-3 rounded"/>

        <select name="sex" value={formData.sex}
          onChange={handleChange}
          className="border p-3 rounded">
          <option value="">Select Sex</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <input type="number" min="0" max="120"
          placeholder="Years"
          value={formData.ageYears}
          onChange={(e)=>setFormData({...formData,ageYears:e.target.value})}
          className="border p-3 rounded"/>

        <input type="number" min="0" max="11"
          placeholder="Months"
          value={formData.ageMonths}
          onChange={(e)=>setFormData({...formData,ageMonths:e.target.value})}
          className="border p-3 rounded"/>

        <input type="number" min="0" max="31"
          placeholder="Days"
          value={formData.ageDays}
          onChange={(e)=>setFormData({...formData,ageDays:e.target.value})}
          className="border p-3 rounded"/>

        <input name="fatherHusbandName"
          value={formData.fatherHusbandName}
          onChange={handleChange}
          placeholder="Father/Husband *"
          className="border p-3 rounded"/>

        <input name="hos_pat_reg"
          value={formData.hos_pat_reg}
          onChange={handleChange}
          placeholder="Hospital Reg No *"
          className="border p-3 rounded"/>

        <select name="hospitalName"
          value={formData.hospitalName}
          onChange={handleChange}
          className="border p-3 rounded">
          <option value="">Select Hospital</option>
          {hospitals.map((h:any)=>(
            <option key={h.id} value={h.hospital_name}>
              {h.hospital_name}
            </option>
          ))}
        </select>

        <input name="referredByDr"
          value={formData.referredByDr}
          onChange={handleChange}
          placeholder="Doctor *"
          className="border p-3 rounded"/>

        <input name="ward"
          value={formData.ward}
          onChange={handleChange}
          placeholder="Ward *"
          className="border p-3 rounded"/>

        <select name="ipdNo"
          value={formData.ipdNo}
          onChange={handleChange}
          className="border p-3 rounded">
          <option value="">Select Category</option>
          <option value="OPD">OPD</option>
          <option value="IPD">IPD</option>
        </select>

      </div>

      <button className="w-full bg-red-600 text-white py-3 rounded">
        Generate Reference ID
      </button>

    </form>
  </div>
</div>

);
}
