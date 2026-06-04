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
    `flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wide text-xs transition-all duration-200 
    ${isActive 
      ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-[1.02] italic" 
      : "text-brand-dark/60 hover:text-brand-dark hover:bg-brand-primary/10 active:scale-95"
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div className="flex items-center gap-10">
          
          <div 
            onClick={() => { navigate("/dashboard"); setIsOpen(false); }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center font-serif text-xl font-black transition-transform duration-300 group-hover:rotate-6 shadow-md shadow-brand-dark/10">
              C
            </div>
            <h1 className="text-xl md:text-2xl font-black text-brand-primary tracking-tighter uppercase italic leading-none transition-colors group-hover:text-brand-primary">
              Ché, el mate
            </h1>
          </div>

          {/* NAV LINKS DESKTOP */}
          <div className="hidden lg:flex items-center gap-2">
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

        {/* BLOQUE DERECHO: ACCIONES Y RESPONSIVE BOTÓN */}
        <div className="flex items-center gap-4">
          
          {/* BOTON DE LOGOUT DESKTOP*/}
          <div className="hidden sm:block">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-brand-primary bg-brand-primary/5 border border-brand-primary/10 transition-all duration-200 hover:bg-brand-primary hover:text-white hover:shadow-md hover:shadow-brand-primary/10 active:scale-95 cursor-pointer"
            >
              <span>Cerrar Sesión</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* BOTÓN HAMBURGUESA MOBILE */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 text-brand-primary hover:bg-slate-100 active:scale-90 rounded-xl transition-all cursor-pointer border border-transparent active:border-slate-200"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      <div className={`
        lg:hidden fixed inset-x-0 top-[73px] h-[calc(100vh-73px)] bg-white/95 backdrop-blur-lg z-40 transition-all duration-300 ease-out
        ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
      `}>
        <div className="flex flex-col p-6 gap-3">
          <NavLink to="/dashboard" className={linkClass} onClick={() => setIsOpen(false)}>
            <LayoutDashboard className="w-4 h-4" /> Inicio
          </NavLink>
          <NavLink to="/products" className={linkClass} onClick={() => setIsOpen(false)}>
            <Package className="w-4 h-4" /> Productos
          </NavLink>
          <NavLink to="/colors" className={linkClass} onClick={() => setIsOpen(false)}>
            <Palette className="w-4 h-4" /> Colores
          </NavLink>
          <NavLink to="/categories" className={linkClass} onClick={() => setIsOpen(false)}>
            <Tags className="w-4 h-4" /> Categorías
          </NavLink>
          <NavLink to="/sales" className={linkClass} onClick={() => setIsOpen(false)}>
            <Receipt className="w-4 h-4" /> Ventas
          </NavLink>
          
          <div className="h-px bg-slate-100/80 my-4" />
          
          {/* Logout Mobile */}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 bg-brand-alert/10 text-brand-alert border border-brand-alert/10 p-4 rounded-[var(--radius-inner)] font-black uppercase text-xs tracking-widest active:scale-[0.97] transition-all cursor-pointer hover:bg-brand-alert hover:text-white"
          >
            Cerrar Sesión <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;