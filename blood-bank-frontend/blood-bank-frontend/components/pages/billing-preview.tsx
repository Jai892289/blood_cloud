"use client"

import { CloudCog } from "lucide-react"

interface PatientData {
  slNo: string
  billNo: string
  date: string
  patientName: string
  sex: string
age_years?: number
age_months?: number
age_days?: number
  mobileNumber: string
  fatherHusbandName: string
  hospitalName: string
  referredByDr: string
  crn: string
  ward: string
  bed: string
  ipdNo: string
  dateOfIPD: string

}

interface BloodComponent {
  id: string
  particulars: string
  quantity: number
  rate: number
  crossmatch: number
  amount: number
}

interface BillingPreviewProps {
  patientData: PatientData
  components: BloodComponent[]
  totalAmount: number
}

export default function BillingPreview({ patientData, components, totalAmount }: BillingPreviewProps) {
  const amountInWords = convertAmountToWords(totalAmount)

//   const parsedPatientData = {
//   ...patientData,
//   age: patientData.age ? JSON.parse(patientData.age) : null,
// };

  console.log("patientData", patientData)

  const formatAge = (
  y?: number,
  m?: number,
  d?: number
) => {
  const parts = [];

  if (y) parts.push(`${y}y`);
  if (m) parts.push(`${m}m`);
  if (d) parts.push(`${d}d`);

  return parts.length ? parts.join(" ") : "N/A";
};

//   const formatAge = (age: any) => {
//   if (!age) return "N/A";

//   const a = typeof age === "string" ? JSON.parse(age) : age;

//   const parts = [];
//   if (a.y) parts.push(`${a.y}y`);
//   if (a.m) parts.push(`${a.m}m`);
//   if (a.d) parts.push(`${a.d}d`);

//   return parts.join(" ") || "0d";
// };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-[#E72C3B] text-white rounded-lg p-6 shadow-md">
        <div className="text-xs font-medium mb-2 opacity-90">ORCHID BLOOD CENTER</div>
        <div className="text-sm font-semibold mb-3">Managed By Shonit Foundation</div>
        <div className="text-xs">H.B. Road, Ranchi, Jharkhand-834001</div>
        <div className="text-xs mt-2 font-medium">☎ 0651-7100845</div>
      </div>

      {/* Patient Details Card */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h4 className="font-bold text-foreground mb-4">Bill Details</h4>

        <div className="space-y-2 text-sm mb-4 pb-4 border-b border-border">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Patient:</span>
            <span className="font-semibold">{patientData.patientName || "N/A"}</span>
          </div>

          <div className="flex justify-between">
  <span className="text-muted-foreground">Age:</span>
 <span className="font-semibold">
  {formatAge(
  patientData.age_years,
  patientData.age_months,
  patientData.age_days
)}
  {/* {formatAge(parsedPatientData.age)} */}
</span>
</div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mobile NO.:</span>
            <span className="font-semibold">{patientData.mobileNumber || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sex.:</span>
            <span className="font-semibold">{patientData.sex || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-semibold">{patientData.date || "N/A"}</span>
          </div>
        </div>

        {/* Items */}
        <div className="mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-semibold">Item</th>
                <th className="text-center py-2 font-semibold">Qty</th>
                <th className="text-right py-2 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {components.map((comp) => (
                <tr key={comp.id} className="border-b border-border">
                  <td className="py-2 text-muted-foreground">{comp.particulars || "Item"}</td>
                  <td className="text-center py-2">{comp.quantity}</td>
                  <td className="text-right py-2 font-semibold">₹{comp.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="border-t-2 border-primary pt-4 mb-4">
          <div className="text-lg font-bold text-primary mb-2">Net Payable</div>
          <div className="text-xs text-muted-foreground mb-3">: {amountInWords}</div>
        </div>

        {/* Final Total */}
        <div className="bg-red-50 dark:bg-red-950 border border-primary/30 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-foreground">Net Payable</span>
            <span className="text-2xl font-bold text-primary">₹ {totalAmount.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  )
}

function convertAmountToWords(amount: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  const scales = ["", "Thousand", "Lakh", "Crore"]

  if (amount === 0) return "Zero"

  const convertHundreds = (num: number): string => {
    let result = ""

    const hundredDigit = Math.floor(num / 100)
    if (hundredDigit > 0) {
      result += ones[hundredDigit] + " Hundred "
    }

    const remainder = num % 100
    if (remainder >= 20) {
      result += tens[Math.floor(remainder / 10)]
      const unitDigit = remainder % 10
      if (unitDigit > 0) {
        result += " " + ones[unitDigit]
      }
    } else if (remainder >= 10) {
      result += teens[remainder - 10]
    } else if (remainder > 0) {
      result += ones[remainder]
    }

    return result.trim()
  }

  let words = ""
  let scaleIndex = 0

  while (amount > 0) {
    const groupValue = amount % 1000
    if (groupValue > 0) {
      words =
        convertHundreds(groupValue) + (scales[scaleIndex] ? " " + scales[scaleIndex] : "") + (words ? " " + words : "")
    }
    amount = Math.floor(amount / 1000)
    scaleIndex++
  }

  return words.trim() + " Only"
}
