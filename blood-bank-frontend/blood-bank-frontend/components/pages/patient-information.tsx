"use client";

import React, { useEffect, useState } from "react";
import { Header } from "./header";
import axiosInstance from "../api/axiosInstance";
import ProjectApiList from "../api/ProjectApiList";
import { toast, Toaster } from "react-hot-toast";
import { CloudCog } from "lucide-react";

interface PatientData {
  slNo: string;
  billNo: string;
  date: string;
  patientName: string;
  sex: string;
  age: string;
  mobileNumber: string;
  fatherHusbandName: string;
  hospitalName: string;
  referredByDr: string;
  // crn: string
  ward: string;
  // bed: string
  ipdNo: string;
  // dateOfIPD: string
  hos_pat_reg: string;
  hos_bill: string;
  ageYears?: string;
  ageMonths?: string;
  ageDays?: string;

}

interface PatientInformationProps {
  onSubmit: (data: PatientData) => void;
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

export default function PatientInformation({
  onSubmit,
}: PatientInformationProps) {
  const [formData, setFormData] = useState<PatientData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("patientFormData");
      if (saved) return JSON.parse(saved);
    }

    return {
      date: getCurrentDateTime(),
      slNo: "",
      billNo: "",
      patientName: "",
      sex: "",
      age: "",
      mobileNumber: "",
      fatherHusbandName: "",
      hospitalName: "",
      referredByDr: "",
      // crn: "",
      ward: "",
      // bed: "",
      ipdNo: "",
      // dateOfIPD: "",
      hos_pat_reg: "",
      hos_bill: "",
    };
  });

  const [currentTime, setCurrentTime] = useState(getCurrentDateTime());
  const [hospitals, setHospitals] = useState<any[]>([]);
const [referenceInput, setReferenceInput] = useState("");

const fetchByReference = async () => {
  if (!referenceInput.trim()) {
    toast.error("Enter Reference ID");
    return;
  }

  try {
    const res = await axiosInstance.get(
      `/billings/ref/${referenceInput}`
    );

    const data = res.data;

    // ✅ Parse age properly
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
    } catch (e) {
      console.log("Age parse error:", e);
    }

    // ✅ Set form data
    setFormData((prev) => ({
      ...prev,
      patientName: data.patient_name || "",
      sex: data.sex || "",
      mobileNumber: data.mobile_number || "",
      fatherHusbandName: data.father_husband_name || "",
      hos_bill: data.hos_bill || "",
  reference_id: data.reference_id,

      // 🔥 IMPORTANT FIX
      ageYears: parsedAge.y,
      ageMonths: parsedAge.m,
      ageDays: parsedAge.d,
    }));

    toast.success("Patient loaded");

  } catch (err: any) {
    if (err.response?.status === 404) {
      toast.error("Reference not found");
    } else {
      toast.error("Error fetching data");
    }
  }
};

  useEffect(() => {
    const interval = setInterval(() => {
      const now = getCurrentDateTime();
      setFormData((prev) => ({
        ...prev,
        date: now,
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await axiosInstance.get(ProjectApiList.hospitals);
        setHospitals(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch hospitals");
      }
    };

    fetchHospitals();
  }, []);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load saved form data when component loads
  //   useEffect(() => {
  //     const saved = localStorage.getItem("patientFormData");
  //     if (saved) {
  //       setFormData(JSON.parse(saved));
  //     }
  //   }, []);

  //   useEffect(() => {
  //     localStorage.setItem("patientFormData", JSON.stringify(formData));
  //   }, [formData]);


  const fetchPatientByMobile = async (mobile: string) => {
    try {
      const res = await axiosInstance.get(
        `/billings/by-mobile/${mobile}`
      );

      const data = res.data.data;

      toast.success("Existing patient found");

      setFormData(prev => ({
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

        // ✅ CLEAR patient fields
        setFormData(prev => ({
          ...prev,
          patientName: "",
          age: "",
          sex: "",
          fatherHusbandName: "",
          hos_bill: ""
        }));
      } else {
        toast.error("Error fetching patient");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // TEXT ONLY FIELDS
    const textOnly = [
      "patientName",
      "fatherHusbandName",
      "hospitalName",
      "referredByDr",
    ];
    if (textOnly.includes(name)) {
      const letters = value.replace(/[^A-Za-z\s]/g, "");
      setFormData((prev) => ({ ...prev, [name]: letters }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    // MOBILE NUMBER - digits only, max 12
    // if (name === "mobileNumber") {
    //   const digits = value.replace(/\D/g, "").slice(0, 10);
    //   setFormData((prev) => ({ ...prev, mobileNumber: digits }));
    //   setErrors((prev) => ({ ...prev, mobileNumber: "" }));
    //   return;
    // }

    if (name === "mobileNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 10);

      setFormData(prev => ({ ...prev, mobileNumber: digits }));
      setErrors(prev => ({ ...prev, mobileNumber: "" }));

      if (digits.length === 10) {
        fetchPatientByMobile(digits);
      }

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.patientName.trim())
      newErrors.patientName = "Patient name is required";
    if (!formData.sex) newErrors.sex = "Please select sex";

    // if (!formData.age || parseInt(formData.age) <= 0)
    //   newErrors.age = "Enter valid age";
    //     if (!formData.age || parseFloat(formData.age) <= 0) {
    //   newErrors.age = "Enter valid age";
    // }
    const y = Number((formData as any).ageYears || 0);
    const m = Number((formData as any).ageMonths || 0);
    const d = Number((formData as any).ageDays || 0);

    if (y === 0 && m === 0 && d === 0) {
      newErrors.age = "Enter valid age";
    }
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10)
      newErrors.mobileNumber = "Enter valid 10-digit mobile number";
    if (!formData.fatherHusbandName.trim())
      newErrors.fatherHusbandName = "Required";
    if (!formData.hospitalName.trim()) newErrors.hospitalName = "Required";
    if (!formData.referredByDr.trim()) newErrors.referredByDr = "Required";
    // if (!formData.crn.trim()) newErrors.crn = "Required"
    if (!formData.ward.trim()) newErrors.ward = "Required";
    // if (!formData.bed.trim()) newErrors.bed = "Required"
    if (!formData.ipdNo.trim()) newErrors.ipdNo = "Required";
    // if (!formData.dateOfIPD) newErrors.dateOfIPD = "Required"
    if (!formData.hos_pat_reg.trim())
      newErrors.hos_pat_reg = "Required Hospital Patient No.";
    // if (!formData.hos_bill.trim()) newErrors.hos_bill = "Required Hospital Bill No."

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // const finalAge: any = JSON.stringify({
      //   y: Number(formData.ageYears || 0),
      //   m: Number(formData.ageMonths || 0),
      //   d: Number(formData.ageDays || 0),
      // });

        const finalData = {
      ...formData,
      age: JSON.stringify({
        y: Number(formData.ageYears || 0),
        m: Number(formData.ageMonths || 0),
        d: Number(formData.ageDays || 0),
      }),
    };


      console.log("formData", finalData)

      onSubmit(finalData);

      // ✅ Clear form
      const emptyForm = {
        date: getCurrentDateTime(),
        slNo: "",
        billNo: "",
        patientName: "",
        sex: "",
        age: "",
        mobileNumber: "",
        fatherHusbandName: "",
        hospitalName: "",
        referredByDr: "",
        ward: "",
        ipdNo: "",
        hos_pat_reg: "",
        hos_bill: "",
      };

      setFormData(emptyForm);

      // ✅ Clear localStorage
      localStorage.removeItem("patientFormData");
    }
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault()
  //     if (validateForm()) {
  //         onSubmit(formData)   // ✔ Direct submit (NO confirmation)
  //     }
  // }

  useEffect(() => {
    const fetchLastSerial = async () => {
      try {
        const res = await axiosInstance.get(
          ProjectApiList.billingsSerialNhumber,
        );

        const lastSerial = Number(res.data.lastSerial || 0);
        const nextSerial = lastSerial + 1;

        setFormData((prev) => ({
          ...prev,
          slNo: nextSerial.toString(), // 👉 Auto-fill
        }));

        localStorage.setItem(
          "patientFormData",
          JSON.stringify({
            ...formData,
            slNo: nextSerial.toString(),
          }),
        );
      } catch (err) {
        console.error("Failed to fetch last serial:", err);
      }
    };

    // Only fetch if no saved serial exists
    // const saved = localStorage.getItem("patientFormData");
    // if (!saved) {
    //     fetchLastSerial();
    // }
    fetchLastSerial();
  }, []);

  const inputClass = (name: string) =>
    `w-full px-4 py-2 border rounded-md bg-secondary/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors[name] ? "border-red-500" : "border-border"
    }`;

  return (
    <div className="min-h-screen bg-red-50 p-5">
      <Toaster position="top-right" />

      <Header />

      <div className=" mx-2 -mt-5">
        <div className="bg-white border p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-8">Patient Information -</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
  <input
    type="text"
    placeholder="Enter Reference ID"
    value={referenceInput}
    onChange={(e) => setReferenceInput(e.target.value)}
    className="w-full px-4 py-2 border rounded-md"
  />

  <button
    type="button"
    onClick={fetchByReference}
    className="bg-blue-600 text-white px-4 py-2 rounded-md"
  >
    Fetch Patient
  </button>
</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Serial Number */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Serial No{" "}
                </label>
                <input
                  disabled
                  type="number"
                  name="slNo"
                  value={formData.slNo}
                  onChange={handleChange}
                  className={inputClass("slNo")}
                  placeholder="Enter serial number"
                />
                {errors.slNo && (
                  <p className="text-red-500 text-sm mt-1">{errors.slNo}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date & Time
                </label>
                {/* <input
                                disabled
                                    type="datetime-local"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className={inputClass("date")}
                                    min={getCurrentDateTime()}
                                /> */}
                <input
                  disabled
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={inputClass("date")}
                  min={currentTime}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <span className="px-4 py-2 border rounded-md bg-secondary/50">
                    +91
                  </span>
                  <input
                    type="number"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className={inputClass("mobileNumber")}
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.mobileNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Aadhaar No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hos_bill"
                  value={formData.hos_bill}
                  onChange={handleChange}
                  className={inputClass("hos_bill")}
                />
                {errors.hos_bill && (
                  <p className="text-red-500 text-sm mt-1">{errors.hos_bill}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className={inputClass("patientName")}
                />
                {errors.patientName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.patientName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Sex <span className="text-red-500">*</span>
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className={inputClass("sex")}
                >
                  <option value="">-Please Select-</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.sex && (
                  <p className="text-red-500 text-sm mt-1">{errors.sex}</p>
                )}
              </div>
            </div>

            {/* Age & Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Age <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Years"
                    value={formData.ageYears || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, ageYears: e.target.value })
                    }
                    className="w-1/3 p-2 border rounded"
                  />

                  <input
                    type="number"
                    placeholder="Months"
                    value={formData.ageMonths || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, ageMonths: e.target.value })
                    }
                    className="w-1/3 p-2 border rounded"
                  />

                  <input
                    type="number"
                    placeholder="Days"
                    value={formData.ageDays || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, ageDays: e.target.value })
                    }
                    className="w-1/3 p-2 border rounded"
                  />
                </div>
                {/* <input
  type="number"
  name="age"
  value={formData.age}
  onChange={handleChange}
  className={inputClass("age")}
  min="0"
  step="0.01"
/> */}
                {/* <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={inputClass("age")}
                  min="0"
                /> */}
                {/* <input
  type="number"
  name="age"
  value={formData.age}
  onChange={handleChange}
  className={inputClass("age")}
  min="0"
  step="0.01"
/> */}
                {errors.age && (
                  <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Father/Husband Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fatherHusbandName"
                  value={formData.fatherHusbandName}
                  onChange={handleChange}
                  className={inputClass("fatherHusbandName")}
                />
                {errors.fatherHusbandName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fatherHusbandName}
                  </p>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-8">
              Patient Billing Information -{" "}
            </h2>

            {/* Guardian & Hospital */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hospital Patient Reg. No.{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hos_pat_reg"
                  value={formData.hos_pat_reg}
                  onChange={handleChange}
                  className={inputClass("hos_pat_reg")}
                />
                {errors.hos_pat_reg && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.hos_pat_reg}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Hospital Name <span className="text-red-500">*</span>
                </label>
                {/* <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className={inputClass("hospitalName")}
                /> */}

                <select
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className={inputClass("hospitalName")}
                >
                  <option value="">- Select Hospital -</option>

                  {hospitals.map((h) => (
                    <option key={h.id} value={h.hospital_name}>
                      {h.hospital_name}
                    </option>
                  ))}
                </select>
                {errors.hospitalName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.hospitalName}
                  </p>
                )}
              </div>
            </div>

            {/* Referral & CRN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Referred By Dr. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="referredByDr"
                  value={formData.referredByDr}
                  onChange={handleChange}
                  className={inputClass("referredByDr")}
                />
                {errors.referredByDr && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.referredByDr}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ward <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  className={inputClass("ward")}
                />
                {errors.ward && (
                  <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                )}
              </div>

              {/* <div>
                                <label className="block text-sm font-medium mb-2">  </label>
                                <input
                                    type="text"
                                    name="crn"
                                    value={formData.crn}
                                    onChange={handleChange}
                                    className={inputClass("crn")}
                                />
                                {errors.crn && <p className="text-red-500 text-sm mt-1">{errors.crn}</p>}
                            </div> */}
            </div>

            {/* IPD & Date of IPD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Patient Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="ipdNo"
                  value={formData.ipdNo}
                  onChange={handleChange}
                  className={inputClass("ipdNo")}
                >
                  <option value="">- Select Category -</option>
                  <option value="OPD">OPD</option>
                  <option value="IPD">IPD</option>
                </select>
                {/* <input
                  type="text"
                  name="ipdNo"
                  value={formData.ipdNo}
                  onChange={handleChange}
                  className={inputClass("ipdNo")}
                /> */}
                {errors.ipdNo && (
                  <p className="text-red-500 text-sm mt-1">{errors.ipdNo}</p>
                )}
              </div>

              {/* <div>
                                <label className="block text-sm font-medium mb-2">Date of IPD</label>
                                <input
                                    type="date"
                                    name="dateOfIPD"
                                    value={formData.dateOfIPD}
                                    onChange={handleChange}
                                    className={inputClass("dateOfIPD")}
                                    max={new Date().toISOString().split("T")[0]}
                                />
                                {errors.dateOfIPD && <p className="text-red-500 text-sm mt-1">{errors.dateOfIPD}</p>}
                            </div> */}
            </div>

            {/* Submit */}

            <button
              type="submit"
              className="w-full bg-[#C70414]  cursor-pointer text-white font-bold py-3 rounded-md hover:bg-[#C70414]/70 transition"
            >
              Start Billing
            </button>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("patientFormData");
                window.location.reload();
              }}
              className="w-full mt-2 cursor-pointer bg-gray-300 text-black font-bold py-3 rounded-md"
            >
              Reset Form
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
