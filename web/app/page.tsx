import ProtectedRoute from "./components/ProtectedRoute";

function Page() {
  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-screen">
          <h1 className="text-white text-4xl font-bold">Gen AI + Full Stack</h1>
      </div>
    </ProtectedRoute>
  )
}

export default Page;