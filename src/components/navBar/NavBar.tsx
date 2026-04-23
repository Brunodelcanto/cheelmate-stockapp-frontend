import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, Package, Palette, Tags, 
  Receipt, LogOut, Menu, X 
} from "lucide-react";

const NavBar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false); 

    const handleLogout = async () => {
    await logout(); 
    setIsOpen(false); 
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
      <nav>
          <div>
              <div>
  
                  {/* LOGO */}
                  <div>
                      <div
                      onClick={() => { navigate("/dashboard"); setIsOpen(false)}}
                      >
                      <div>
                          C
                      </div>
                      <h1>
                          Ché, el mate
                      </h1>
                      </div>
  
                      {/* LINKS DESKTOP */}
                      <div className="hidden lg:flex items-center space-x-2">
                <NavLink to="/dashboard" className={linkClass}>
                  <LayoutDashboard className="w-4 h-4" /> Inicio
                </NavLink>
                <NavLink to="/products" className={linkClass}>
                  <Package className="w-4 h-4" /> Productos
                </NavLink>
                <NavLink to="/colors" className={linkClass}>
                  <Palette className="w-4 h-4" /> Colores
                </NavLink>
                <NavLink to="/categories" className={linkClass}>
                  <Tags className="w-4 h-4" /> Categorías
                </NavLink>
                <NavLink to="/sales" className={linkClass}>
                  <Receipt className="w-4 h-4" /> Ventas
                </NavLink>
                      </div>
                  </div>
  
                  {/* BOTONES DERECHA (Logout en Desktop / Menu en Mobile) */}
                  <div>
                      <div>
                          <button
                              onClick={handleLogout}
                          >
                              <span>Cerrar Sesión</span>
                              <LogOut className="w-4 h-4" />
                          </button>
                      </div>
  
                      {/* BOTÓN HAMBURGUESA (Solo mobile) */}
                      <button
                          onClick={toggleMenu}
                      >
                          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                      </button>
                  </div>
              </div>
          </div>
  
                {/* MENÚ DESPLEGABLE MÓVIL */}
      <div className={`
        lg:hidden fixed inset-0 top-20 bg-white/95 backdrop-blur-md z-50 transition-all duration-500 ease-in-out
        ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"}
      `}>
        <div className="flex flex-col p-6 gap-2">
          <NavLink to="/dashboard" className={linkClass} onClick={() => setIsOpen(false)}>
            <LayoutDashboard className="w-5 h-5" /> Inicio
          </NavLink>
          <NavLink to="/products" className={linkClass} onClick={() => setIsOpen(false)}>
            <Package className="w-5 h-5" /> Productos
          </NavLink>
          <NavLink to="/colors" className={linkClass} onClick={() => setIsOpen(false)}>
            <Palette className="w-5 h-5" /> Colores
          </NavLink>
          <NavLink to="/categories" className={linkClass} onClick={() => setIsOpen(false)}>
            <Tags className="w-5 h-5" /> Categorías
          </NavLink>
          <NavLink to="/sales" className={linkClass} onClick={() => setIsOpen(false)}>
            <Receipt className="w-5 h-5" /> Ventas
          </NavLink>
          
          <div className="h-px bg-slate-100 my-4" />
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 bg-accent-red/10 text-accent-red p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
          >
            Cerrar Sesión <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};


export default NavBar;