import { BrowserRouter, Routes, Route, Navigate} from "react-router";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ProtectedRoute from "./components/protectedRoute.tsx/ProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import CategoryPage from "./pages/Category/Category";

function App() {
  return (
    <BrowserRouter>
    <Routes>
       {/* RUTA PÚBLICA (Sin Navbar) */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* RUTA PRIVADA (Con Navbar) */}
        <Route element={<ProtectedRoute />}>
          <Route path="*" element={
            <div>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="categories/*" element={<CategoryPage />} />
              </Routes>
            </div>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
