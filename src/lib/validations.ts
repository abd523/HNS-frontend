import * as z from "zod";

export const LoginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const PatientSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  date_of_birth: z.string().optional(),
  gender: z.enum(["M", "F"]),
  phone_number: z.string().min(10, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  medical_history: z.string().optional(),
});

export const AppointmentSchema = z.object({
  patient: z.string().min(1, "Select a patient"),
  doctor: z.string().min(1, "Select a doctor"),
  appointment_date: z.string().min(1, "Date is required"),
  appointment_time: z.string().min(1, "Time is required"),
  reason: z.string().optional(),
  status: z.enum(["Pending", "Confirmed", "Cancelled", "Completed"]),
});

export const InvoiceSchema = z.object({
  patient: z.string().min(1, "Select a patient"),
  total_amount: z.string().min(1, "Amount is required"),
});
