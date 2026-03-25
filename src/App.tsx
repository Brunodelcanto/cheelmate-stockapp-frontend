import { BrowserRouter, Routes, Route} from "react-router";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

function App() {
  return (
    <BrowserRouter>
    <Routes>
       {/* RUTA PÚBLICA (Sin Navbar) */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* RUTA PRIVADA (Con Navbar) */}
    </Routes>
    </BrowserRouter>
  )
}

export default App
