// "use client"

// import { useState } from "react"
// import PatientForm from "./patient-form"
// import BloodComponentsTable from "./blood-components-table"
// import BillPreview from "./bill-preview"
// // import PatientForm from "@/components/patient-form"
// // import BloodComponentsTable from "@/components/blood-components-table"
// // import BillPreview from "@/components/bill-preview"

// interface PatientInfo {
//   patientName: string
//   uhid: string
//   age: string
//   gender: string
//   contactNo: string
//   address: string
//   ward: string
//   bedNo: string
//   doctorName: string
//   billDate: string
//   billNo: string
//   paymentType: string
//   paymentStatus: string
// }

// export interface BloodComponent {
//   id: string
//   product: string
//   group: string
//   bagId: string
//   qty: number
//   price: number
//   discount: number
//   tax: number
// }

// export default function CounterNewBilling() {
//   const [patientInfo, setPatientInfo] = useState<PatientInfo>({
//     patientName: "",
//     uhid: "BB-2025-000554",
//     age: "",
//     gender: "Male",
//     contactNo: "",
//     address: "",
//     ward: "",
//     bedNo: "",
//     doctorName: "",
//     billDate: new Date().toLocaleDateString("en-IN"),
//     billNo: "BB-2025-000554",
//     paymentType: "Cash",
//     paymentStatus: "Unpaid",
//   })

//   const [components, setComponents] = useState<BloodComponent[]>([])

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       {/* <div className="bg-white border-b border-gray-200 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Billing Counter</h1>
//             <p className="text-sm text-gray-500 mt-1">ABC City Hospital – Blood Bank</p>
//           </div>
//         </div>
//       </div> */}

//       {/* Main Content */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
//         {/* Left Panel - Patient Information */}
//         <div className="lg:col-span-1">
//           {/* <PatientForm patientInfo={patientInfo} setPatientInfo={setPatientInfo} /> */}
//         </div>

//         {/* Middle Panel - Blood Components */}
//         <div className="lg:col-span-1">
//           {/* <BloodComponentsTable components={components} setComponents={setComponents} /> */}
//         </div>

//         {/* Right Panel - Bill Preview */}
//         <div className="lg:col-span-1">
//           {/* <BillPreview patientInfo={patientInfo} components={components} /> */}
//         </div>
//       </div>
//     </div>
//   )
// }


"use client"

import { useState } from "react"
import PatientInformation from "./patient-information"
import BloodComponentDetails from "./blood-component-details"

export default function CounterNewBilling() {
  const [currentStep, setCurrentStep] = useState<"patient" | "components">("patient")
  const [patientData, setPatientData] = useState({
    slNo: "",
    billNo: "",
    date: "",
    patientName: "",
    sex: "",
    age: "",
    mobileNumber: "",
    fatherHusbandName: "",
    hospitalName: "",
    referredByDr: "",
    crn: "",
    ward: "",
    bed: "",
    ipdNo: "",
    dateOfIPD: "",
  })

  const handlePatientSubmit = (data: typeof patientData) => {
    setPatientData(data)
    setCurrentStep("components")
  }

  const handleBack = () => {
    setCurrentStep("patient")
  }

  return (
    <div className="min-h-screen bg-background">
      {currentStep === "patient" ? (
        <PatientInformation onSubmit={handlePatientSubmit} />
      ) : (
        <BloodComponentDetails patientData={patientData} onBack={handleBack} />
      )}
    </div>
  )
}
