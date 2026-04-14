"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/components/api/axiosInstance";
import ProjectApiList from "@/components/api/ProjectApiList";
import BloodComponentTable from "./blood-component-table";
import BillingPreview from "./billing-preview";
import { useRouter } from "next/navigation";
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
  crn: string;
  ward: string;
  bed: string;
  ipdNo: string;
  dateOfIPD: string;
  hos_pat_reg:string;
  hos_bill:string;
  reference_id?:string;
}

interface BloodComponent {
  id: string;
  sno?: number;            // <-- new persistent serial number
  category_id?: number;
  particulars: string;
  quantity: number;
  rate: number;
  crossmatch: number;
  amount: number;
}

interface BloodComponentDetailsProps {
  patientData: PatientData;
  onBack: () => void;
}

export default function BloodComponentDetails({
  patientData,
  onBack,
}: BloodComponentDetailsProps) {
  const [components, setComponents] = useState<BloodComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [submitted, setSubmitted] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
  transactionNumber: "",
  remarks: "",
  utr: "",
});

const [discountAmount, setDiscountAmount] = useState(0);
const [discountRemarks, setDiscountRemarks] = useState("");
const [focType, setFocType] = useState(""); // NGO | MANAGEMENT

  const router = useRouter();

  const addComponent = (e?: any) => {
    e?.preventDefault();

    // find max existing sno
    const maxSno = components.reduce((m, c) => Math.max(m, c.sno ?? 0), 0);
    const newComponent: BloodComponent = {
      id: Date.now().toString(),
      sno: maxSno,           // persistent serial
      category_id: undefined,
      particulars: "",
      quantity: 1,
      rate: 0,
      crossmatch: 0,
      amount: 0,
    };
    setComponents((prev) => [...prev, newComponent]);
  };


  // UPDATED: accepts single-field updates OR a "bulk" object to merge multiple fields at once
  const updateComponent = (
    id: string,
    field: keyof BloodComponent | "bulk",
    value: any
  ) => {
    setComponents((prev) =>
      prev.map((comp) => {
        if (comp.id !== id) return comp;

        // if bulk, merge provided object
        let updated: BloodComponent;
        if (field === "bulk") {
          updated = { ...comp, ...(value as Partial<BloodComponent>) } as BloodComponent;
        } else {
          updated = { ...comp, [field]: value } as BloodComponent;
        }

        // Ensure numeric types
        updated.quantity = Number(updated.quantity) || 0;
        updated.rate = Number(updated.rate) || 0;
        updated.crossmatch = Number(updated.crossmatch) || 0;

        // Recalculate amount always from numeric values
        updated.amount = Number(updated.quantity) * Number(updated.rate) + Number(updated.crossmatch);

        // keep 2 decimals (optional)
        updated.amount = Number(updated.amount);

        return updated;
      })
    );
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((comp) => comp.id !== id));
  };

  // const totalAmount = components.reduce((sum, comp) => sum + Number(comp.amount || 0), 0);

  // const totalAmount =
  // paymentMethod === "FOC"
  //   ? 0
  //   : components.reduce(
  //       (sum, comp) => sum + Number(comp.amount || 0),
  //       0
  //     );

  const actualTotal = components.reduce(
  (sum, comp) => sum + Number(comp.amount || 0),
  0
);

let totalAmount = actualTotal;

if (paymentMethod === "FOC") {
  totalAmount = 0;
}

if (paymentMethod === "Discount") {
  totalAmount = actualTotal - Number(discountAmount || 0);
}

//       const actualTotal = components.reduce(
//   (sum, comp) => sum + Number(comp.amount || 0),
//   0
// );

// const totalAmount = paymentMethod === "FOC" ? 0 : actualTotal;

  const user_id = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

// const preparePayload = () => {
//   const actualTotal = components.reduce(
//     (sum, comp) => sum + Number(comp.amount || 0),
//     0
//   );

//   const parsedAge = patientData.age ? JSON.parse(patientData.age) : null;


//   return {
//     patient_name: patientData.patientName,
//     sex: patientData.sex,
//     age: parsedAge || 0,   // or send full object if backend supports
//     // age: Number(patientData.age),
//     mobile_number: patientData.mobileNumber,
//     father_husband_name: patientData.fatherHusbandName,
//     hospital_name: patientData.hospitalName,
//     referred_by_dr: patientData.referredByDr,
//     crn: patientData.crn,
//     ward: patientData.ward,
//     bed: patientData.bed,
//     ipd_no: patientData.ipdNo,
//     user_id: Number(user_id),
//     is_paid: isPaid,
//     payment_method: paymentMethod,
//      hos_pat_reg: patientData.hos_pat_reg,
//   hos_bill: patientData.hos_bill,

//     // ✅ ADD THIS LINE
//     // total_amount: paymentMethod === "FOC" ? 0 : actualTotal,
//     total_amount:
//   paymentMethod === "FOC"
//     ? 0
//     : paymentMethod === "Discount"
//     ? actualTotal - Number(discountAmount || 0)
//     : actualTotal,

//     blood_component_details: components.map((comp, index) => ({
//       sno: index + 1,
//       particulars: comp.particulars,
//       quantity: comp.quantity,
//       rate: comp.rate,
//       crossmatch: comp.crossmatch ? "Yes" : "No",
//       amount: comp.amount,
//     })),

//     payment_details:
//      paymentMethod === "Discount"
//     ? { discount_amount: discountAmount, remarks: discountRemarks }:
//       paymentMethod === "FOC"
//     ? {
//         foc_type: focType,
//         ...(focType === "MANAGEMENT" && { remarks: paymentDetails.remarks }),
//       }:
//       paymentMethod === "Card"
//         ? { transaction_number: paymentDetails.transactionNumber }
//         : paymentMethod === "Bank"
//         ? { utr: paymentDetails.utr }
//         : paymentMethod === "Credit" 
//         ? { remarks: paymentDetails.remarks }
//         : {},
//   };
// };


const preparePayload = () => {
  const actualTotal = components.reduce(
    (sum, comp) => sum + Number(comp.amount || 0),
    0
  );

  let parsedAge = null;

  try {
    parsedAge = patientData.age
      ? typeof patientData.age === "string"
        ? JSON.parse(patientData.age)
        : patientData.age
      : null;
  } catch (e) {
    console.log("Age parse error", e);
  }

  return {
    patient_name: patientData.patientName,
    sex: patientData.sex,
    age: parsedAge || 0,
    mobile_number: patientData.mobileNumber,
    father_husband_name: patientData.fatherHusbandName,
    hospital_name: patientData.hospitalName,
    referred_by_dr: patientData.referredByDr,
    crn: patientData.crn,
    ward: patientData.ward,
    bed: patientData.bed,
    ipd_no: patientData.ipdNo,
    user_id: Number(user_id),
    is_paid: isPaid,
    payment_method: paymentMethod,
    hos_pat_reg: patientData.hos_pat_reg,
    hos_bill: patientData.hos_bill,

    // 🔥 CRITICAL FIX (THIS SOLVES YOUR ISSUE)
    reference_id: patientData.reference_id || null,

    total_amount:
      paymentMethod === "FOC"
        ? 0
        : paymentMethod === "Discount"
        ? actualTotal - Number(discountAmount || 0)
        : actualTotal,

    blood_component_details: components.map((comp, index) => ({
      sno: index + 1,
      particulars: comp.particulars,
      quantity: comp.quantity,
      rate: comp.rate,
      crossmatch: comp.crossmatch ? "Yes" : "No",
      amount: comp.amount,
    })),

    payment_details:
      paymentMethod === "Discount"
        ? { discount_amount: discountAmount, remarks: discountRemarks }
        : paymentMethod === "FOC"
        ? {
            foc_type: focType,
            ...(focType === "MANAGEMENT" && {
              remarks: paymentDetails.remarks,
            }),
          }
        : paymentMethod === "Card"
        ? { transaction_number: paymentDetails.transactionNumber }
        : paymentMethod === "Bank"
        ? { utr: paymentDetails.utr }
        : paymentMethod === "Credit"
        ? { remarks: paymentDetails.remarks }
        : {},
  };
};

  const handleFinalSubmit = async () => {
    const payload = preparePayload();
    console.log("_------------------------------------", payload)
    setLoading(true);
    setMessage("");
    try {
      const res = await axiosInstance.post(ProjectApiList.billings, payload);

      setMessage(res.data.message || "✅ Billing successfully created!");
      setSubmitted(true); // 👉 enable print button
    } catch (err: any) {
      console.error("Billing error:", err);
      setMessage(err?.response?.data?.message || "❌ Failed to create billing.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // ensure one single row is added on mount
    setComponents([
      {
        id: Date.now().toString(),
        sno: 1,
        category_id: undefined,
        particulars: "",
        quantity: 1,
        rate: 0,
        crossmatch: 0,
        amount: 0,
      },
    ]);
  }, []);


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 border border-primary/30 rounded-full px-4 py-2 transition-colors hover:bg-primary/5"
        >
          <span>← Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BloodComponentTable
              components={components}
              onAdd={addComponent}
              onUpdate={updateComponent}
              onRemove={removeComponent}
            />
          </div>

          <div className="lg:col-span-1">
            <BillingPreview patientData={patientData} components={components} totalAmount={totalAmount} />

            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Payment Details</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setMessage("");
                  }}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary/30 focus:outline-none ${!paymentMethod ? "border-red-500" : "border-gray-300"
                    }`}
                >
                  <option value="">-- Select Payment Method --</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Credit">Credit / Due</option>
                  <option value="FOC">FOC (Free of Cost)</option>
                  <option value="Bank">Bank</option>
                  <option value="Discount">Discount on Bill</option>
                </select>
                
                {!paymentMethod && <p className="text-red-500 text-sm mt-1">Please select a payment method.</p>}

                {/* Dynamic Fields Based on Payment Method */}

{paymentMethod === "Card" && (
  <div className="my-4">
    <label className="block text-sm font-medium mb-2">
      Transaction Number <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={paymentDetails.transactionNumber}
      onChange={(e) =>
        setPaymentDetails({ ...paymentDetails, transactionNumber: e.target.value })
      }
      className="w-full px-4 py-2 border rounded-md"
      placeholder="Enter transaction number"
    />
  </div>
)}

    {paymentMethod === "Discount" && (
  <div className="my-4 space-y-3">
    <div>
      <label className="block text-sm font-medium mb-2">
        Discount Amount <span className="text-red-500">*</span>
      </label>
      <input
  type="number"
  value={discountAmount}
          className="w-full px-4 py-2 border rounded-md"

  onChange={(e) => {
    const val = Number(e.target.value);

    if (val > actualTotal) {
      setMessage("❌ Discount cannot exceed total");
      return;
    }

    setDiscountAmount(val);
    setMessage("");
  }}
/>
      {/* <input
        type="number"
        value={discountAmount}
        onChange={(e) => setDiscountAmount(Number(e.target.value))}
        className="w-full px-4 py-2 border rounded-md"
        placeholder="Enter discount amount"
      /> */}
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">
        Remarks <span className="text-red-500">*</span>
      </label>
      <textarea
        value={discountRemarks}
        onChange={(e) => setDiscountRemarks(e.target.value)}
        className="w-full px-4 py-2 border rounded-md"
        placeholder="Enter reason for discount"
      />
    </div>
  </div>
)}

{paymentMethod === "Credit" && (
  <div className="my-4">
    <label className="block text-sm font-medium mb-2">
      Hospital Bill Receipt No. <span className="text-red-500">*</span>
    </label>
    <textarea
      value={paymentDetails.remarks}
      onChange={(e) =>
        setPaymentDetails({ ...paymentDetails, remarks: e.target.value })
      }
      className="w-full px-4 py-2 border rounded-md"
      placeholder="Enter remarks"
    />
  </div>
)}

{paymentMethod === "FOC" && (
  <div className="my-4 space-y-3">
    
    {/* FOC TYPE */}
    <div>
      <label className="block text-sm font-medium mb-2">
        FOC Type <span className="text-red-500">*</span>
      </label>
      <select
        value={focType}
        onChange={(e) => setFocType(e.target.value)}
        className="w-full px-4 py-2 border rounded-md"
      >
        <option value="">-- Select --</option>
        <option value="NGO">NGO</option>
        <option value="MANAGEMENT">By Management</option>
      </select>
    </div>

    {/* REMARKS ONLY FOR MANAGEMENT */}
    {focType === "MANAGEMENT" && (
      <div>
        <label className="block text-sm font-medium mb-2">
          Remarks <span className="text-red-500">*</span>
        </label>
        <textarea
          value={paymentDetails.remarks}
          onChange={(e) =>
            setPaymentDetails({ ...paymentDetails, remarks: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-md"
          placeholder="Enter remarks"
        />
      </div>
    )}
  </div>
)}

{/* {paymentMethod === "FOC" && (
  <div className="my-4">
    <label className="block text-sm font-medium mb-2">
      Remarks <span className="text-red-500">*</span>
    </label>
    <textarea
      value={paymentDetails.remarks}
      onChange={(e) =>
        setPaymentDetails({ ...paymentDetails, remarks: e.target.value })
      }
      className="w-full px-4 py-2 border rounded-md"
      placeholder="Enter remarks"
    />
  </div>
)} */}

{paymentMethod === "Bank" && (
  <div className="my-4">
    <label className="block text-sm font-medium mb-2">
      UTR Number <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={paymentDetails.utr}
      onChange={(e) =>
        setPaymentDetails({ ...paymentDetails, utr: e.target.value })
      }
      className="w-full px-4 py-2 border rounded-md"
      placeholder="Enter UTR number"
    />
  </div>

  
)}


              </div>

              <div className="flex items-center gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => {
                    setIsPaid(e.target.checked);
                    setMessage("");
                  }}
                  id="isPaid"
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />

                <label htmlFor="isPaid" className="text-sm text-gray-700">
                  Mark as Paid
                </label>
              </div>
              {!isPaid && <p className="text-red-500 text-sm mt-1">Please confirm payment before submitting.</p>}
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end items-center">
          <div className="text-right">
            <button
              onClick={() => {
  if (!paymentMethod) {
    setMessage("❌ Please select a payment method before proceeding.");
    return;
  }

  // ✅ ADD HERE (dynamic validation)
  if (paymentMethod === "Card" && !paymentDetails.transactionNumber) {
    setMessage("❌ Transaction Number is required for Card.");
    return;
  }

  if (paymentMethod === "FOC") {
  if (!focType) {
    setMessage("❌ Please select FOC type.");
    return;
  }

  if (focType === "MANAGEMENT" && !paymentDetails.remarks) {
    setMessage("❌ Remarks required for Management FOC.");
    return;
  }
}

  // if (
  //   (paymentMethod === "FOC") &&
  //   !paymentDetails.remarks
  // ) {
  //   setMessage("❌ Remarks are required.");
  //   return;
  // }

  if (
    (paymentMethod === "Credit") &&
    !paymentDetails.remarks
  ) {
    setMessage("❌ Hospital Bill Receipt No is required.");
    return;
  }

  if (paymentMethod === "Bank" && !paymentDetails.utr) {
    setMessage("❌ UTR Number is required.");
    return;
  }

  if (paymentMethod === "Discount") {
  if (!discountAmount || discountAmount <= 0) {
    setMessage("❌ Discount amount required.");
    return;
  }

  if (!discountRemarks) {
    setMessage("❌ Remarks required for discount.");
    return;
  }

  // ✅ ADD THIS IMPORTANT CHECK
  if (discountAmount > actualTotal) {
    setMessage("❌ Discount cannot exceed total amount.");
    return;
  }


  // if (paymentMethod === "Discount") {
  // if (!discountAmount || discountAmount <= 0) {
  //   setMessage("❌ Discount amount required.");
  //   return;
  // }

  // if (!discountRemarks) {
  //   setMessage("❌ Remarks required for discount.");
  //   return;
  // }
}

  if (!isPaid) {
    setMessage("❌ Please confirm payment before proceeding.");
    return;
  }

  if (components.length === 0) {
    setMessage("❌ Please add at least one blood component.");
    return;
  }

  setShowPreview(true);
  setMessage("");
}}
              disabled={components.length === 0}
              className="bg-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              Preview & Submit
            </button>

            {message && (
              <p className={`mt-3 font-medium ${message.includes("✅") ? "text-green-600" : "text-red-500"}`}>{message}</p>
            )}
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 a4-modal-wrapper">
          <div
            className="
        bg-white 
        shadow-2xl 
        rounded-lg 
        p-8 
        relative
        border border-gray-300
        overflow-visible
        a4-container
      "
          >
            {/* LETTERHEAD */}
           <div className="relative text-center mb-6">

  {/* LEFT LOGO */}
  <img
    src="/icon.png"   // 👉 replace with your actual path
    alt="Left Logo"
    className="absolute left-4 top-2 w-16 h-16 object-contain"
  />

  {/* RIGHT LOGO */}
  <img
    src="/icon2.png"  // 👉 replace with your actual path
    alt="Right Logo"
    className="absolute right-4 top-2 w-16 h-16 object-contain"
  />

  {/* CENTER CONTENT */}
  <h1 className="text-3xl font-extrabold mt-1">
    <span className="text-teal-600">ORCHID</span>{" "}
    <span className="text-red-600">BLOOD CENTER</span>
  </h1>

  <p className="text-sm text-gray-700 font-medium">
    Managed By Shonit Foundation
  </p>

  <p className="text-sm text-gray-700 mt-1">
    H.B. Road, Ranchi, Jharkhand-834001
  </p>

  <p className="text-sm text-gray-700 mt-1">
    ☎ 0651-7100845
  </p>
</div>

            {/* PATIENT INFO */}
            <div className="mb-6">
              <div className="flex justify-between text-sm">
                <div>
                  <p><strong>SL No:</strong> {patientData.slNo || "-"}</p>
                  <p className="mt-2"><strong>Patient’s Name:</strong> {patientData.patientName}</p>
                  <p>
  <strong>Age:</strong>{" "}
  {(() => {
    if (!patientData.age) return "N/A";

    const ageObj =
      typeof patientData.age === "string"
        ? JSON.parse(patientData.age)
        : patientData.age;

    const parts = [];
    if (ageObj.y) parts.push(`${ageObj.y}y`);
    if (ageObj.m) parts.push(`${ageObj.m}m`);
    if (ageObj.d) parts.push(`${ageObj.d}d`);

    return parts.join(" ");
  })()}
</p>
                  {/* <p><strong>Age:</strong> {patientData.age} Yr</p> */}
                  <p><strong>Father/Husband Name:</strong> {patientData.fatherHusbandName}</p>
                  <p><strong>Hospital Name:</strong> {patientData.hospitalName}</p>
                  {/* <p><strong>CRN:</strong> {patientData.crn}</p> */}
                </div>

                <div className="text-right">
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  <p className="mt-2"><strong>Sex:</strong> {patientData.sex}</p>
                  <p><strong>Mobile:</strong> {patientData.mobileNumber}</p>
                  <p><strong>Ward:</strong> {patientData.ward}</p>
                  {/* <p><strong>Bed:</strong> {patientData.bed}</p> */}
                  <p><strong>IPD No:</strong> {patientData.ipdNo}</p>
                </div>
              </div>
            </div>

            {/* DETAILS TABLE */}
            <div className="border border-black">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border px-3 py-2">SL</th>
                    <th className="border px-3 py-2 text-left">PARTICULARS</th>
                    <th className="border px-3 py-2">QUANTITY</th>
                    <th className="border px-3 py-2">PROCESSING CHARGE</th>
                    <th className="border px-3 py-2">CROSSMATCH BY GEL TECHNOLOGY</th>
                    <th className="border px-3 py-2">AMOUNT</th>
                  </tr>
                </thead>

                <tbody>
                  {components.map((comp, i) => (
                    <tr key={comp.id}>
                      <td className="border px-3 py-2 text-center">{i + 1}</td>
                      <td className="border px-3 py-2">
                        {comp.particulars}
                        {/* {i === 0 && (
                          <p className="text-xs text-gray-600 mt-2">
                            HIV I, II, HBsAg, HCV, Malaria done by fully automated Elisa , Reader.
                          </p>
                        )} */}
                      </td>
                      <td className="border px-3 py-2 text-center">{comp.quantity}</td>
                      <td className="border px-3 py-2 text-center">₹{comp.rate}</td>
                      <td className="border px-3 py-2 text-center">{comp.crossmatch}</td>
                      <td className="border px-3 py-2 text-right font-semibold">₹{comp.amount}</td>
                    </tr>
                  ))}

                  {/* GROSS TOTAL */}

                  {/* GROSS TOTAL */}
<tr>
  <td colSpan={4} className="border px-3 py-2 text-center font-bold">
    GROSS TOTAL
  </td>
  <td colSpan={2} className="border px-3 py-2 text-right font-semibold">
    ₹{actualTotal}
  </td>
</tr>

{/* DISCOUNT */}
{paymentMethod === "Discount" && (
  <tr>
    <td colSpan={4} className="border px-3 py-2 text-center font-bold">
      DISCOUNT
    </td>
    <td colSpan={2} className="border px-3 py-2 text-right text-red-600">
      - ₹{discountAmount}
    </td>
  </tr>
)}

{/* NET PAYABLE */}
<tr>
  <td colSpan={4} className="border px-3 py-2 text-center font-bold">
    NET PAYABLE
  </td>
  <td colSpan={2} className="border px-3 py-2 text-right font-bold text-green-700">
    ₹{totalAmount}
  </td>
</tr>


                  {/* <tr>
                    <td colSpan={3} className="border px-3 py-2"></td>
                    <td className="border px-3 py-2 text-center font-bold">GROSS TOTAL</td>
                    <td colSpan={2} className="border px-3 py-2 text-right font-semibold">
                      ₹{totalAmount}
                    </td>
                    {paymentMethod === "Discount" && (
  <tr>
    <td colSpan={4} className="border px-3 py-2 text-center font-bold">
      DISCOUNT
    </td>
    <td colSpan={2} className="border px-3 py-2 text-right text-red-600">
      - ₹{discountAmount}
    </td>
  </tr>
)}

<tr>
  <td colSpan={4} className="border px-3 py-2 text-center font-bold">
    NET PAYABLE
  </td>
  <td colSpan={2} className="border px-3 py-2 text-right font-bold text-green-700">
    ₹{totalAmount}
  </td>
</tr>
                  </tr> */}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-4 text-sm">
  <p><strong>Payment Method:</strong> {paymentMethod}</p>

  {paymentMethod === "Card" && (
    <p><strong>Transaction No:</strong> {paymentDetails.transactionNumber}</p>
  )}

  {(paymentMethod === "Credit") && (
    <p><strong>Remarks:</strong> {paymentDetails.remarks}</p>
  )}

  {paymentMethod === "FOC" && (
  <>
    <p><strong>FOC Type:</strong> {focType}</p>
    {focType === "MANAGEMENT" && (
      <p><strong>Remarks:</strong> {paymentDetails.remarks}</p>
    )}
  </>
)}

  {paymentMethod === "Bank" && (
    <p><strong>UTR:</strong> {paymentDetails.utr}</p>
  )}

   {paymentMethod === "Discount" && (
    <p><strong>Discount Remark:</strong> {discountRemarks}</p>
  )}




</div>

            <div className="mt-8 flex justify-between">
              <div className="text-sm">
                <strong>Rupees (in words):</strong> {numberToWordsIndian(totalAmount)} Only
              </div>

              <div className="text-right">
                <div className="font-semibold">Authorized Signature</div>
                <div className="h-[50px] w-[150px] border-b border-gray-400 mt-6 mx-auto"></div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-8 no-print">

              {/* CLOSE BTN always visible */}
              <button
                onClick={() => {
                  setShowPreview(false);

                  // If already submitted → refresh page
                  if (submitted) {
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 border rounded-md"
              >
                Close
              </button>


              {/* SHOW ONLY AFTER SUCCESSFUL SUBMIT */}
              {submitted && (
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Print
                </button>
              )}

              {/* SUBMIT − hides after successful submission */}
              {!submitted && (
                <button
                  disabled={loading}
                  onClick={handleFinalSubmit}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              )}

            </div>


          </div>
        </div>
      )}



    </div>
  );
}

// Converts number to Indian-style words (supports up to crores)
function numberToWordsIndian(amount: number) {
  if (!amount || isNaN(amount)) return "Zero";

  const words: any = {
    0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
    10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen',
    20: 'Twenty', 30: 'Thirty', 40: 'Forty', 50: 'Fifty', 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
  };

  const getTwo = (n: number) => {
    if (n === 0) return "";
    if (n < 20) return words[n];
    const ten = Math.floor(n / 10) * 10;
    const unit = n % 10;
    return unit ? words[ten] + " " + words[unit] : words[ten];
  };

  const getThree = (n: number) => {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    const hundredPart = hundred ? words[hundred] + " Hundred " : "";
    const restPart = rest ? (hundred ? "and " : "") + getTwo(rest) : "";
    return (hundredPart + restPart).trim();
  };

  let n = Math.floor(amount);
  const crore = Math.floor(n / 10000000);
  n = n % 10000000;
  const lakh = Math.floor(n / 100000);
  n = n % 100000;
  const thousand = Math.floor(n / 1000);
  n = n % 1000;
  const hundreds = n;

  const parts = [];
  if (crore) parts.push(getThree(crore) + " Crore");
  if (lakh) parts.push(getThree(lakh) + " Lakh");
  if (thousand) parts.push(getThree(thousand) + " Thousand");
  if (hundreds) parts.push(getThree(hundreds));

  return parts.length ? parts.join(" ") : "Zero";
}


