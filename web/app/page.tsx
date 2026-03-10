import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./interview/pages/Home";

function Page() {
  return (
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  )
}

export default Page;