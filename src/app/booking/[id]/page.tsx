import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import HistoryBookingDetailPage from "./HistoryBookingDetailPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <HistoryBookingDetailPage />
    </ProtectedRoute>
  );
}
