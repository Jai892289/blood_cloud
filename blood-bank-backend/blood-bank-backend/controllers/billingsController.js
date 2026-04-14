// import { client_encoding } from "pg/lib/defaults";
import { db } from "../db/index.js";
import { billings, users } from "../db/schema.js";
import { eq, like, desc, sql, between, and, isNotNull } from "drizzle-orm";

// ✅ Get all billings
export const getAllBillings = async (req, res) => {
  try {
    const {
      fromDate,
      toDate,
      particulars,
      user,
      user_id, 
       patient_name,    
  mobile_number,  
  payment_method,  
  is_cancelled,    
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];

    // 🗓️ Date range filter
    if (fromDate && toDate) {
      whereConditions.push(
        between(billings.date, new Date(fromDate), new Date(toDate))
      );
    } else if (fromDate) {
      whereConditions.push(sql`${billings.date} >= ${new Date(fromDate)}`);
    } else if (toDate) {
      whereConditions.push(sql`${billings.date} <= ${new Date(toDate)}`);
    }

    // ❌ / ✅ Cancel filter
if (is_cancelled === "true") {
  whereConditions.push(eq(billings.is_cancelled, true));
} else if (is_cancelled === "false") {
  whereConditions.push(eq(billings.is_cancelled, false));
}

    // 🔍 Patient name search (case-insensitive)
if (patient_name) {
  whereConditions.push(
    sql`${billings.patient_name} ILIKE ${`%${patient_name}%`}`
  );
}

// 📱 Mobile number search
if (mobile_number) {
  whereConditions.push(
    sql`${billings.mobile_number} ILIKE ${`%${mobile_number}%`}`
  );
}

// 💳 Payment method filter
if (payment_method) {
  whereConditions.push(
    eq(billings.payment_method, payment_method)
  );
}

    // 🩸 Particulars filter
    if (particulars) {
      whereConditions.push(
        sql`${billings.blood_component_details}::text ILIKE ${`%${particulars}%`}`
      );
    }

    // 👤 User name filter
    if (user) {
      whereConditions.push(sql`${users.full_name} ILIKE ${`%${user}%`}`);
    }

    // ⭐ NEW — Filter by user_id (optional)
    if (user_id) {
      whereConditions.push(eq(billings.user_id, Number(user_id)));
    }

    const whereQuery = whereConditions.length ? and(...whereConditions) : undefined;

    /* ------------------------------------
      STEP 1: Get total record count
    ------------------------------------ */
    const totalRows = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(billings)
      .leftJoin(users, eq(billings.user_id, users.id))
      .where(whereQuery);

    const totalRecords = totalRows[0]?.count || 0;
    const totalPages = Math.ceil(totalRecords / limitNum);

    /* ------------------------------------
      STEP 2: Fetch paginated billing data
    ------------------------------------ */
    const data = await db
      .select({
        id: billings.id,
        bill_no: billings.bill_no,
        date: billings.date,
        patient_name: billings.patient_name,
        sex: billings.sex,
        age: billings.age,
        mobile_number: billings.mobile_number,
        father_husband_name: billings.father_husband_name,
        hospital_name: billings.hospital_name,
        referred_by_dr: billings.referred_by_dr,
        crn: billings.crn,
        ward: billings.ward,
        bed: billings.bed,
        ipd_no: billings.ipd_no,
        blood_component_details: billings.blood_component_details,
        total_amount: billings.total_amount,
        is_paid: billings.is_paid,
        payment_method: billings.payment_method,
    payment_details: billings.payment_details,
    hos_pat_reg: billings.hos_pat_reg,
hos_bill: billings.hos_bill,
is_cancelled: billings.is_cancelled,
cancel_remark: billings.cancel_remark,
cancelled_at: billings.cancelled_at,

        user: {
          id: users.id,
          full_name: users.full_name,
          email: users.email,
          role: users.role,
          created_at: users.created_at,
        },
      })
      .from(billings)
      .leftJoin(users, eq(billings.user_id, users.id))
      .where(whereQuery)
      .orderBy(desc(billings.id))
      .limit(limitNum)
      .offset(offset);

    res.json({
      message: "Billings fetched successfully",
      page: pageNum,
      limit: limitNum,
      totalRecords,
      totalPages,
      data,
    });

  } catch (err) {
    console.error("❌ Fetch Billings Error:", err.message);
    res.status(500).json({
      message: "Failed to fetch billings",
      error: err.message,
    });
  }
};



// ✅ Get billing by ID
export const getBillingById = async (req, res) => {
  try {
    const data = await db.select().from(billings).where(eq(billings.id, req.params.id));
    res.json({
      message: data.length ? "Billing fetched successfully" : "Billing not found",
      data: data[0] || null,
    });
  } catch (err) {
    console.error("❌ Get Billing By ID Error:", err.message);
    res.status(500).json({ message: "Failed to fetch billing", error: err.message });
  }
};


export const createBilling = async (req, res) => {
  try {
    const {
      patient_name,
      sex,
      age,
      mobile_number,
      father_husband_name,
      hospital_name,
      referred_by_dr,
      crn,
      ward,
      bed,
      ipd_no,
      user_id,
      blood_component_details,
      is_paid,
      payment_method,
      payment_details,
      hos_pat_reg,
      hos_bill,
      reference_id, // ✅ NEW
    } = req.body;

    // ✅ Validate only for FINAL billing (not init)
    if (!patient_name || !sex || !age || !blood_component_details) {
      return res.status(400).json({
        message: "Missing required fields.",
      });
    }

    // 🧮 Parse blood component details
    let bloodDetails = blood_component_details;
    if (typeof blood_component_details === "string") {
      try {
        bloodDetails = JSON.parse(blood_component_details);
      } catch {
        return res.status(400).json({
          message: "Invalid blood_component_details JSON format.",
        });
      }
    }

    // 🧾 Calculate total amount
    let total_amount = bloodDetails.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    // ✅ Payment logic
    if (payment_method === "FOC") {
      total_amount = 0;
    }

    if (payment_method === "Discount") {
      const discount = Number(payment_details?.discount_amount || 0);

      if (discount > total_amount) {
        return res.status(400).json({
          message: "Discount cannot exceed total amount",
        });
      }

      total_amount = total_amount - discount;
    }

    // ✅ Payment validations
    if (payment_method === "Card" && !payment_details?.transaction_number) {
      return res.status(400).json({
        message: "Transaction number required for Card payment.",
      });
    }

    if (payment_method === "Credit" && !payment_details?.remarks) {
      return res.status(400).json({
        message: "Remarks required for Credit.",
      });
    }

    if (payment_method === "FOC") {
      if (!payment_details?.foc_type) {
        return res.status(400).json({
          message: "FOC type required.",
        });
      }

      if (
        payment_details.foc_type === "MANAGEMENT" &&
        !payment_details?.remarks
      ) {
        return res.status(400).json({
          message: "Remarks required for MANAGEMENT FOC.",
        });
      }
    }

    if (payment_method === "Bank" && !payment_details?.utr) {
      return res.status(400).json({
        message: "UTR number required for Bank payment.",
      });
    }

    // 🧾 Generate Bill Number (only for new insert)
    let newBillNo = null;

    if (!reference_id) {
      const year = new Date().getFullYear();
      const prefix = `BB${year}`;

      const lastBill = await db
        .select({ bill_no: billings.bill_no })
        .from(billings)
        .where(like(billings.bill_no, `${prefix}%`))
        .orderBy(desc(billings.id))
        .limit(1);

      let newSerial = 1;
      if (lastBill.length > 0) {
        const lastNo = lastBill[0].bill_no;
        const serialPart = parseInt(lastNo.slice(prefix.length), 10);
        newSerial = serialPart + 1;
      }

      const formattedNumber = String(newSerial).padStart(10, "0");
      newBillNo = `${prefix}${formattedNumber}`;
    }

    // ✅ Prepare JSONB
    const bloodJson = sql.raw(`'${JSON.stringify(bloodDetails)}'::jsonb`);
    const paymentJson = sql.raw(
      `'${JSON.stringify(payment_details || {})}'::jsonb`
    );

    let result;

    // =========================================================
    // 🔄 UPDATE FLOW (Reference ID exists)
    // =========================================================
    if (reference_id) {
      const updated = await db
        .update(billings)
        .set({
          hospital_name: hospital_name || null,
          referred_by_dr: referred_by_dr || null,
          crn: crn || null,
          ward: ward || null,
          bed: bed || null,
          ipd_no: ipd_no || null,
          blood_component_details: bloodJson,
          payment_details: paymentJson,
          total_amount: total_amount.toFixed(2),
          user_id: user_id ? Number(user_id) : null,
          is_paid: is_paid ?? false,
          payment_method: payment_method || "Cash",
          hos_pat_reg,
          hos_bill,
          status: "COMPLETED",
          updated_at: new Date(),
        })
        .where(eq(billings.reference_id, reference_id))
        .returning();

      if (!updated.length) {
        return res.status(404).json({
          message: "Reference ID not found",
        });
      }

      result = updated[0];
    }

    // =========================================================
    // 🆕 INSERT FLOW (Normal billing)
    // =========================================================
    else {
      const inserted = await db
        .insert(billings)
        .values({
          bill_no: newBillNo,
          patient_name,
          sex,
          age,
          mobile_number: mobile_number || null,
          father_husband_name: father_husband_name || null,
          hospital_name: hospital_name || null,
          referred_by_dr: referred_by_dr || null,
          crn: crn || null,
          ward: ward || null,
          bed: bed || null,
          ipd_no: ipd_no || null,
          blood_component_details: bloodJson,
          payment_details: paymentJson,
          total_amount: total_amount.toFixed(2),
          user_id: user_id ? Number(user_id) : null,
          is_paid: is_paid ?? false,
          payment_method: payment_method || "Cash",
          hos_pat_reg,
          hos_bill,
          reference_id: null,
          status: "COMPLETED",
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      result = inserted[0];
    }

    return res.status(201).json({
      message: "✅ Billing processed successfully",
      data: result,
    });
  } catch (err) {
    console.error("❌ Create Billing Error:", err);
    return res.status(500).json({
      message: "Failed to create billing",
      error: err.message,
    });
  }
};

// export const createBilling = async (req, res) => {
//   try {
//     const {
//       patient_name,
//       sex,
//       age,
//       mobile_number,
//       father_husband_name,
//       hospital_name,
//       referred_by_dr,
//       crn,
//       ward,
//       bed,
//       ipd_no,
//       user_id,
//       blood_component_details,
//       is_paid,
//       payment_method,
//       payment_details,
//       hos_pat_reg,
//       hos_bill
//        // ✅ NEW
//     } = req.body;

//     // ✅ Basic validation
//     if (!patient_name || !sex || !age || !blood_component_details) {
//       return res.status(400).json({ message: "Missing required fields." });
//     }

//     // 🧮 Parse blood component details
//     let bloodDetails = blood_component_details;
//     if (typeof blood_component_details === "string") {
//       try {
//         bloodDetails = JSON.parse(blood_component_details);
//       } catch {
//         return res.status(400).json({
//           message: "Invalid blood_component_details JSON format.",
//         });
//       }
//     }

//     // 🧾 Calculate total amount
//     // const total_amount = bloodDetails.reduce(
//     //   (sum, item) => sum + Number(item.amount || 0),
//     //   0
//     // );

//     // 🧾 Calculate total amount
// let total_amount = bloodDetails.reduce(
//   (sum, item) => sum + Number(item.amount || 0),
//   0
// );

// // ✅ OVERRIDE for FOC
// if (payment_method === "FOC") {
//   total_amount = 0;
// }

// if (payment_method === "Discount") {
//   const discount = Number(payment_details?.discount_amount || 0);

//   if (discount > total_amount) {
//     return res.status(400).json({
//       message: "Discount cannot exceed total amount",
//     });
//   }

//   total_amount = total_amount - discount;
// }

//     // ✅ Payment validation (based on method)
//     if (payment_method === "Card" && !payment_details?.transaction_number) {
//       return res.status(400).json({
//         message: "Transaction number required for Card payment.",
//       });
//     }

//     // ✅ Credit validation
// if (payment_method === "Credit" && !payment_details?.remarks) {
//   return res.status(400).json({
//     message: "Remarks required for Credit.",
//   });
// }

// // ✅ FOC validation
// if (payment_method === "FOC") {
//   if (!payment_details?.foc_type) {
//     return res.status(400).json({
//       message: "FOC type required.",
//     });
//   }

//   if (
//     payment_details.foc_type === "MANAGEMENT" &&
//     !payment_details?.remarks
//   ) {
//     return res.status(400).json({
//       message: "Remarks required for MANAGEMENT FOC.",
//     });
//   }
// }

//     // if (
//     //   (payment_method === "Credit" || payment_method === "FOC") &&
//     //   !payment_details?.remarks
//     // ) {
//     //   return res.status(400).json({
//     //     message: "Remarks required for Credit/FOC.",
//     //   });
//     // }

//     if (payment_method === "Bank" && !payment_details?.utr) {
//       return res.status(400).json({
//         message: "UTR number required for Bank payment.",
//       });
//     }

//     // 🧾 Generate Bill Number (BB + year + 10 digits)
//     const year = new Date().getFullYear();
//     const prefix = `BB${year}`;

//     const lastBill = await db
//       .select({ bill_no: billings.bill_no })
//       .from(billings)
//       .where(like(billings.bill_no, `${prefix}%`))
//       .orderBy(desc(billings.id))
//       .limit(1);

//     let newSerial = 1;
//     if (lastBill.length > 0) {
//       const lastNo = lastBill[0].bill_no;
//       const serialPart = parseInt(lastNo.slice(prefix.length), 10);
//       newSerial = serialPart + 1;
//     }

//     const formattedNumber = String(newSerial).padStart(10, "0");
//     const newBillNo = `${prefix}${formattedNumber}`;

//     // ✅ Prepare JSONB values safely
//     const bloodJson = sql.raw(`'${JSON.stringify(bloodDetails)}'::jsonb`);
//     const paymentJson = sql.raw(
//       `'${JSON.stringify(payment_details || {})}'::jsonb`
//     );

//     // ✅ Insert billing
//     const result = await db
//       .insert(billings)
//       .values({
//         bill_no: newBillNo,
//         patient_name,
//         sex,
//         age,
//         mobile_number: mobile_number || null,
//         father_husband_name: father_husband_name || null,
//         hospital_name: hospital_name || null,
//         referred_by_dr: referred_by_dr || null,
//         crn: crn || null,
//         ward: ward || null,
//         bed: bed || null,
//         ipd_no: ipd_no || null,
//         blood_component_details: bloodJson,
//         payment_details: paymentJson, // ✅ NEW COLUMN
//         total_amount: total_amount.toFixed(2),
//         user_id: user_id ? Number(user_id) : null,
//         is_paid: is_paid ?? false,
//         payment_method: payment_method || "Cash",
//         hos_pat_reg,
//         hos_bill,
//         created_at: new Date(),
//         updated_at: new Date(),
//       })
//       .returning();

//     return res.status(201).json({
//       message: "✅ Billing created successfully",
//       data: result[0],
//     });
//   } catch (err) {
//     console.error("❌ Create Billing Error:", err);
//     return res.status(500).json({
//       message: "Failed to create billing",
//       error: err.message,
//     });
//   }
// };

// ✅ Update billing
export const updateBilling = async (req, res) => {
  try {
    const {
      blood_component_details,
      patient_name,
      sex,
      age,
      mobile_number,
      father_husband_name,
      hospital_name,
      referred_by_dr,
      crn,
      ward,
      bed,
      ipd_no,
      user_id,
      is_paid,           // ✅ new
      payment_method,    // ✅ new
    } = req.body;

    let bloodDetails = blood_component_details;
    if (typeof blood_component_details === "string") {
      try {
        bloodDetails = JSON.parse(blood_component_details);
      } catch {
        return res.status(400).json({ message: "Invalid blood_component_details JSON format." });
      }
    }

    const total_amount = bloodDetails
      ? bloodDetails.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      : 0;

    const jsonValue = sql.raw(`'${JSON.stringify(bloodDetails)}'::jsonb`);

    const result = await db
      .update(billings)
      .set({
        patient_name,
        sex,
        age,
        mobile_number: mobile_number || null,
        father_husband_name: father_husband_name || null,
        hospital_name: hospital_name || null,
        referred_by_dr: referred_by_dr || null,
        crn: crn || null,
        ward: ward || null,
        bed: bed || null,
        ipd_no: ipd_no || null,
        blood_component_details: jsonValue,
        total_amount: total_amount.toFixed(2),
        user_id: user_id ? Number(user_id) : null, // 👈 Safe FK
        is_paid: is_paid ?? false, // ✅ update payment status
        payment_method: payment_method || "Cash", // ✅ update payment method
        updated_at: new Date(),
      })
      .where(eq(billings.id, req.params.id))
      .returning();

    res.json({
      message: result.length ? "Billing updated successfully" : "Billing not found",
      data: result[0] || null,
    });
  } catch (err) {
    console.error("❌ Update Billing Error:", err.message);
    res.status(500).json({ message: "Failed to update billing", error: err.message });
  }
};

// ✅ Delete billing
export const deleteBilling = async (req, res) => {
  try {
    await db.delete(billings).where(eq(billings.id, req.params.id));
    res.json({ message: "Billing deleted successfully", data: null });
  } catch (err) {
    console.error("❌ Delete Billing Error:", err.message);
    res.status(500).json({ message: "Failed to delete billing", error: err.message });
  }
};

export const cancelBilling = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    if (!remark) {
      return res.status(400).json({ message: "Remark is required" });
    }

    const result = await db
      .update(billings)
      .set({
        is_cancelled: true,
        cancel_remark: remark,
        cancelled_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(billings.id, Number(id)))
      .returning();

    return res.json({
      message: "Billing cancelled successfully",
      data: result[0],
    });
  } catch (err) {
    console.error("❌ Cancel Billing Error:", err);
    return res.status(500).json({
      message: "Failed to cancel billing",
      error: err.message,
    });
  }
};


export const getAllLatestBillings = async (req, res) => {
  try {
    const { fromDate, toDate, particulars, user, userId, limit, page } = req.query;

    const whereConditions = [];

    // 🗓 Date range filter
    if (fromDate && toDate) {
      whereConditions.push(
        between(billings.date, new Date(fromDate), new Date(toDate))
      );
    } else if (fromDate) {
      whereConditions.push(sql`${billings.date} >= ${new Date(fromDate)}`);
    } else if (toDate) {
      whereConditions.push(sql`${billings.date} <= ${new Date(toDate)}`);
    }

    // 🔍 Particulars filter (JSON search)
    if (particulars) {
      whereConditions.push(
        sql`${billings.blood_component_details}::text ILIKE ${`%${particulars}%`}`
      );
    }

    // 👤 User name filter (search inside user data)
    if (user) {
      whereConditions.push(sql`${users.full_name} ILIKE ${`%${user}%`}`);
    }

    // 🔥 EXACT USER ID FILTER (for Counter Dashboard)
    if (userId) {
      whereConditions.push(eq(billings.user_id, Number(userId)));
    }

    // 📄 Pagination
    const perPage = Math.max(1, Number(limit) || 50);
    const pageNum = Math.max(1, Number(page) || 1);
    const offset = (pageNum - 1) * perPage;

    /* --------------------------------------
      Fetch Billing Data (Paginated)
    -------------------------------------- */
    const data = await db
      .select({
        id: billings.id,
        bill_no: billings.bill_no,
        date: billings.date,
        patient_name: billings.patient_name,
        sex: billings.sex,
        age: billings.age,
        mobile_number: billings.mobile_number,
        father_husband_name: billings.father_husband_name,
        hospital_name: billings.hospital_name,
        referred_by_dr: billings.referred_by_dr,
        crn: billings.crn,
        ward: billings.ward,
        bed: billings.bed,
        ipd_no: billings.ipd_no,
        blood_component_details: billings.blood_component_details,
        total_amount: billings.total_amount,
        is_paid: billings.is_paid,
        payment_method: billings.payment_method,

        user: {
          id: users.id,
          full_name: users.full_name,
          email: users.email,
          role: users.role,
          created_at: users.created_at,
        },
      })
      .from(billings)
      .leftJoin(users, eq(billings.user_id, users.id))
      .where(whereConditions.length ? and(...whereConditions) : undefined)
      .orderBy(desc(billings.date), desc(billings.id))
      .limit(perPage)
      .offset(offset);

    /* --------------------------------------
      Get Total Count (for Pagination)
    -------------------------------------- */
    const totalCountQuery = await db
      .select({ count: sql`COUNT(*)` })
      .from(billings)
      .leftJoin(users, eq(billings.user_id, users.id))
      .where(whereConditions.length ? and(...whereConditions) : undefined);

    const total = Number(totalCountQuery[0].count || 0);

    res.json({
      message: "Latest billings fetched successfully",
      total,
      page: pageNum,
      perPage,
      totalPages: Math.ceil(total / perPage),
      count: data.length,
      data,
    });

  } catch (err) {
    console.error("❌ Fetch Latest Billings Error:", err.message);
    res.status(500).json({
      message: "Failed to fetch latest billings",
      error: err.message,
    });
  }
};

export const getLastBillNoSerial = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const prefix = `BB${year}`;

    const lastBill = await db
      .select({ bill_no: billings.bill_no })
      .from(billings)
      .where(like(billings.bill_no, `${prefix}%`))
      .orderBy(desc(billings.id))
      .limit(1);

    let lastSerial = 0;

    if (lastBill.length > 0) {
      const billNo = lastBill[0].bill_no;
      lastSerial = parseInt(billNo.slice(prefix.length), 10);
    }

    res.json({
      message: "Last bill number serial fetched successfully",
      lastSerial
    });

  } catch (err) {
    console.error("❌ Get Last Bill Serial Error:", err.message);
    res.status(500).json({
      message: "Failed to fetch last bill number serial",
      error: err.message,
    });
  }
};

export const getPatientByMobile = async (req, res) => {
  try {
    const { mobile } = req.params;
console.log("mobile", mobile)
    const data = await db
      .select()
      .from(billings)
      .where(sql`${billings.mobile_number} = ${mobile}`)
      .orderBy(desc(billings.id))
      .limit(1);

    if (!data.length) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.json({
      message: "Patient found",
      data: data[0]
    });

  } catch (err) {
    console.error("❌ Fetch Patient Error:", err.message);
    res.status(500).json({
      message: "Failed to fetch patient",
      error: err.message
    });
  }
};

// for receptionist part

export const initBilling = async (req, res) => {
  try {
    const {
      patient_name,
      sex,
      age,
      mobile_number,
      father_husband_name,
      hos_bill
    } = req.body;

    const referenceId = "REF" + Date.now();

    const result = await db.insert(billings).values({
      reference_id: referenceId,
      patient_name,
      sex,
      age,
      mobile_number,
      father_husband_name,
      hos_bill,
      status: "PENDING",
      created_at: new Date(),
      updated_at: new Date()
    }).returning();

    return res.json({
      message: "Patient saved",
      referenceId,
      data: result[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
};

export const getByReference = async (req, res) => {
  const { refId } = req.params;

  const result = await db
    .select()
    .from(billings)
    .where(eq(billings.reference_id, refId));

  if (!result.length) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json(result[0]);
};


export const getReferenceList = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = db
      .select({
        reference_id: billings.reference_id,
        patient_name: billings.patient_name,
        mobile_number: billings.mobile_number,
        created_at: billings.created_at,
        status: billings.status,
      })
      .from(billings)
      .where(isNotNull(billings.reference_id))
      .orderBy(desc(billings.id));

    // 🔍 Filter by status (optional)
    if (status) {
      query = query.where(eq(billings.status, status));
    }

    const results = await query;

    // 🔎 Search filter (simple)
    let filtered = results;
    if (search) {
      const s = search.toLowerCase();

      filtered = results.filter((item) =>
        item.reference_id?.toLowerCase().includes(s) ||
        item.patient_name?.toLowerCase().includes(s) ||
        item.mobile_number?.includes(s)
      );
    }

    return res.json({
      count: filtered.length,
      data: filtered,
    });

  } catch (err) {
    console.error("Reference List Error:", err);
    return res.status(500).json({
      message: "Failed to fetch references",
    });
  }
};