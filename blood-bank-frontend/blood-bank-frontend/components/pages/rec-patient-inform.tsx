
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

  // 🔹 Fetch hospitals
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

  // 🔥 Mobile auto-fetch
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

  // 🔹 Handle input
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

  // 🔹 Validation
  const validateForm = () => {
    if (!formData.patientName.trim()) return "Patient name required";
    if (!formData.sex) return "Select sex";
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10)
      return "Valid mobile required";

    const y = Number(formData.ageYears || 0);
    const m = Number(formData.ageMonths || 0);
    const d = Number(formData.ageDays || 0);

    if (y === 0 && m === 0 && d === 0)
      return "Enter valid age";

    if (!formData.fatherHusbandName.trim())
      return "Father/Husband required";

    if (!formData.hospitalName) return "Select hospital";
    if (!formData.referredByDr.trim()) return "Doctor required";
    if (!formData.ward.trim()) return "Ward required";
    if (!formData.ipdNo) return "Select category";
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
        patient_name: formData.patientName,
        sex: formData.sex,
        // age: {
        //   y: Number(formData.ageYears || 0),
        //   m: Number(formData.ageMonths || 0),
        //   d: Number(formData.ageDays || 0),
        // },
        age: JSON.stringify({
  y: Number(formData.ageYears || 0),
  m: Number(formData.ageMonths || 0),
  d: Number(formData.ageDays || 0),
}),
        mobile_number: formData.mobileNumber,
        father_husband_name: formData.fatherHusbandName,

        hospital_name: formData.hospitalName,
        referred_by_dr: formData.referredByDr,
        ward: formData.ward,
        ipd_no: formData.ipdNo,
        hos_pat_reg: formData.hos_pat_reg,
        hos_bill: formData.hos_bill,
      };

      const res = await axiosInstance.post("/billings/init", payload);

      setReferenceId(res.data.referenceId);
      toast.success("Reference generated");

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <Toaster />

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

          {/* Patient Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 font-medium">Mobile *</label>
              <input name="mobileNumber" value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full border p-3 rounded"/>
            </div>

            <div>
              <label className="block mb-2 font-medium">Aadhaar</label>
              <input name="hos_bill" value={formData.hos_bill}
                onChange={handleChange}
                className="w-full border p-3 rounded"/>
            </div>

            <div>
              <label className="block mb-2 font-medium">Patient Name *</label>
              <input name="patientName" value={formData.patientName}
                onChange={handleChange}
                className="w-full border p-3 rounded"/>
            </div>

            <div>
              <label className="block mb-2 font-medium">Sex *</label>
              <select name="sex" value={formData.sex}
                onChange={handleChange}
                className="w-full border p-3 rounded">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Age */}
            <div className="col-span-2 flex gap-4">
              <input placeholder="Years" value={formData.ageYears}
                onChange={(e)=>setFormData({...formData,ageYears:e.target.value})}
                className="border p-3 w-1/3 rounded"/>
              <input placeholder="Months" value={formData.ageMonths}
                onChange={(e)=>setFormData({...formData,ageMonths:e.target.value})}
                className="border p-3 w-1/3 rounded"/>
              <input placeholder="Days" value={formData.ageDays}
                onChange={(e)=>setFormData({...formData,ageDays:e.target.value})}
                className="border p-3 w-1/3 rounded"/>
            </div>

            <div>
              <label className="block mb-2 font-medium">Father/Husband *</label>
              <input name="fatherHusbandName"
                value={formData.fatherHusbandName}
                onChange={handleChange}
                className="w-full border p-3 rounded"/>
            </div>

          </div>

          {/* Billing Info */}
          <h3 className="text-xl font-bold">Patient Billing Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 font-medium">Hospital Reg No *</label>
              <input name="hos_pat_reg"
                value={formData.hos_pat_reg}
                onChange={handleChange}
                className="w-full border p-3 rounded"/>
            </div>

            <div>
              <label className="block mb-2 font-medium">Hospital *</label>
              <select name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                className="w-full border p-3 rounded">
                <option value="">Select</option>
                {hospitals.map((h:any)=>(
                  <option key={h.id} value={h.hospital_name}>
                    {h.hospital_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Doctor *</label>
              <input name="referredByDr"
                value={formData.referredByDr}
                onChange={handleChange}
                className="w-full border p-3 rounded"/>
            </div>

            <div>
              <label className="block mb-2 font-medium">Ward *</label>
              <input name="ward"
                value={formData.ward}
                onChange={handleChange}
                className="w-full border p-3 rounded"/>
            </div>

            <div>
              <label className="block mb-2 font-medium">Category *</label>
              <select name="ipdNo"
                value={formData.ipdNo}
                onChange={handleChange}
                className="w-full border p-3 rounded">
                <option value="">Select</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
              </select>
            </div>

          </div>

          <button className="w-full bg-red-600 text-white py-3 rounded">
            Generate Reference ID
          </button>

        </form>
      </div>
    </div>
  );
}
