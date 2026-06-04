import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8fafc]">
                <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                
                <p className="text-brand-dark/40 font-black uppercase tracking-widest text-xs animate-pulse select-none">
                    Verificando credenciales...
                </p>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;