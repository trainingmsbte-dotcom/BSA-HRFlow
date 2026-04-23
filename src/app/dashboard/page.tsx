
import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Logic to determine role (mocking for now)
  const role = "employee"; 
  
  if (role === "admin") {
    redirect("/dashboard/admin");
  } else {
    redirect("/dashboard/employee");
  }
}
