"use client"

const ProjectApiList = {
  // 🔐 Auth APIs
  register: "/auth/register",
  login: "/auth/login",
  users: "/users",

  // 🧾 GST APIs
  gst: "/gst",

  // 🧾 GST APIs
  bloodCategories: "/blood-categories",
  billings: "/billings",
  billingsSerialNhumber: "/billings/last-billno-serial",
  dashboard: "/dashboard",
  dashboardRecentBills: "/billings/latest",

  //  masters
  bloodGroupMaster: "blood-group-master",
  bloodComponentMaster: "blood-component-master",
  counters: "counters",

  // 👥 Users
  // getAllUsers: "/users",
  // getUserById: (id: number) => `/users/${id}`,
  // createUser: "/users",
  // updateUser: (id: number) => `/users/${id}`,
  // deleteUser: (id: number) => `/users/${id}`,

  // // 🩸 Blood Categories
  // getBloodCategories: "/blood-categories",
  // getBloodCategoryById: (id: number) => `/blood-categories/${id}`,
  // createBloodCategory: "/blood-categories",
  // updateBloodCategory: (id: number) => `/blood-categories/${id}`,
  // deleteBloodCategory: (id: number) => `/blood-categories/${id}`,

  // // 🧾 Billings
  // getBillings: "/billings",
  // getBillingById: (id: number) => `/billings/${id}`,
  // createBilling: "/billings",
  // updateBilling: (id: number) => `/billings/${id}`,
  // deleteBilling: (id: number) => `/billings/${id}`,

  // // 💸 GST
  // getGST: "/gst",
  // getGSTById: (id: number) => `/gst/${id}`,
  // createGST: "/gst",
  // updateGST: (id: number) => `/gst/${id}`,
  // deleteGST: (id: number) => `/gst/${id}`,

  // // 📦 Categories
  // getCategories: "/categories",
  // getCategoryById: (id: number) => `/categories/${id}`,
  // createCategory: "/categories",
  // updateCategory: (id: number) => `/categories/${id}`,
  // deleteCategory: (id: number) => `/categories/${id}`,

  // // 🩸 Blood Groups
  // getBloodGroups: "/blood-group",
  // getBloodGroupById: (id: number) => `/blood-group/${id}`,
  // createBloodGroup: "/blood-group",
  // updateBloodGroup: (id: number) => `/blood-group/${id}`,
  // deleteBloodGroup: (id: number) => `/blood-group/${id}`,
}

export default ProjectApiList
