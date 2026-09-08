import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import BookingPage from "./BookingPage";

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <ProtectedRoute>
      <BookingPage params={params} />
    </ProtectedRoute>
  );
}
