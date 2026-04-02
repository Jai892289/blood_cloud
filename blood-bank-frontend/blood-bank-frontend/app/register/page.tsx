"use client";

import AddUserPage from "@/components/pages/AddUserPage";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <AddUserPage onBack={function (): void {
              throw new Error("Function not implemented.");
          } } />
     
    </div>
  );
}