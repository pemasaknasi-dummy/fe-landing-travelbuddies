import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import OrderSuccessPage from "./OrderSuccessPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <OrderSuccessPage />
    </ProtectedRoute>
  );
}
