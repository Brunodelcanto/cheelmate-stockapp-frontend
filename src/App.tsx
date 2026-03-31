import { BrowserRouter, Routes, Route, Navigate} from "react-router";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ProtectedRoute from "./components/protectedRoute.tsx/ProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import CategoryPage from "./pages/Category/Category";
import EditCategory from "./components/editCategory/EditCategory";
import ColorPage from "./pages/Color/Color";
import EditColor from "./components/editColor/EditColor";

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
                <Route path="categories/" element={<CategoryPage />} />
                <Route path="/edit-category/:id" element={<EditCategory />} />
                <Route path="colors/" element={<ColorPage />} />
                <Route path="/edit-color/:id" element={<EditColor />} />
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
