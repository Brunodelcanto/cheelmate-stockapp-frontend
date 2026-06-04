import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import api from "../../api/axiosConfig";
import { UserPlus, User, Mail, Lock, ShieldAlert } from "lucide-react";

type RegisterFormInputs = { 
    name: string;
    email: string;
    password: string;
}

const validationSchema = Joi.object<RegisterFormInputs>({
    name: Joi.string().min(3).max(30).required().messages({
        "string.base": "Name must be a string",
        "string.empty": "Name is required",
    }),
    email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).min(3).max(30).required().messages({
        "string.base": "Email must be a string",
        "string.empty": "Email is required",
        "any.required": "Email is required",
        "string.min": "Email must be at least 3 characters long",
        "string.max": "Email must be at most 30 characters long",
        "string.pattern.base": "Email must be a valid email address",
    }),
    password: Joi.string().min(6).max(30).required().messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is required",
        "any.required": "Password is required",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password must be at most 30 characters long",
    })
})

const Register = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormInputs>({
        resolver: joiResolver(validationSchema),
    });

    const handleRegister = async (formData: RegisterFormInputs) => {
        setApiError(null);

        try {
            const response = await api.post(`/users/register`, formData)

            const { user, token } = response.data;

            if (user && token) {
                login(user, token);
                navigate('/dashboard');
            } else {
                setApiError("Respuesta incompleta del servidor");
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setApiError(err.response?.data?.message || "Error en el registro");
            }
            console.error("Complete error:", err);
        }
    }

    const inputStyle = "w-full bg-[#f4f6f9] text-[#1e293b] font-bold text-sm pl-11 pr-4 py-4 rounded-2xl border border-transparent focus:bg-white focus:border-brand-primary/40 transition-all duration-200 outline-none placeholder:text-slate-400/80 shadow-inner";
    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1";

    return (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 max-w-md w-full">
                
                {/* HEADER */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="bg-[#f4f6f9] p-4 rounded-2xl text-brand-primary shadow-inner mb-4">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter italic leading-none">Crear Cuenta</h2>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-2">Registro de Personal • Ché, el mate</p>
                </div>

                {apiError && (
                    <div className="mb-6 p-4 bg-brand-alert/10 border border-brand-alert/20 rounded-xl text-brand-alert font-bold text-xs flex items-center gap-3">
                        <ShieldAlert className="w-4 h-4 flex-shrink-0" /> {apiError}
                    </div>
                )}
                
                <form onSubmit={handleSubmit(handleRegister)} className="space-y-5">
                    
                    {/* NOMBRE COMPLETO */}
                    <div>
                        <label className={labelStyle}>Nombre completo</label>
                        <div className="relative flex items-center">
                            <User className="w-4 h-4 text-slate-400 absolute left-4" />
                            <input 
                                type="text" 
                                placeholder="Ej: Bruno"
                                {...register("name")} 
                                className={inputStyle}
                            />
                        </div>
                        {errors.name && <p className="text-brand-alert font-bold text-[10px] uppercase mt-2 px-1">{errors.name.message}</p>}
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className={labelStyle}>Correo electrónico</label>
                        <div className="relative flex items-center">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-4" />
                            <input 
                                type="email" 
                                placeholder="nombre@empresa.com"
                                {...register("email")} 
                                className={inputStyle}
                            />
                        </div>
                        {errors.email && <p className="text-brand-alert font-bold text-[10px] uppercase mt-2 px-1">{errors.email.message}</p>}
                    </div>

                    {/* CONTRASEÑA */}
                    <div>
                        <label className={labelStyle}>Contraseña de seguridad</label>
                        <div className="relative flex items-center">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-4" />
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                {...register("password")} 
                                className={inputStyle}
                            />
                        </div>
                        {errors.password && <p className="text-brand-alert font-bold text-[10px] uppercase mt-2 px-1">{errors.password.message}</p>}
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit"
                            className="w-full bg-brand-primary text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-lg shadow-brand-primary/25 transition-all duration-300 hover:bg-[#765642] hover:shadow-xl hover:shadow-brand-primary/30 active:scale-[0.98] cursor-pointer text-center"
                        >
                            Registrarse
                        </button>
                    </div>

                    {/* FOOTER */}
                    <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">¿Ya tienes cuenta?</p>
                        <button 
                            type="button" 
                            onClick={() => navigate("/login")}
                            className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:opacity-80 transition-all cursor-pointer mt-1"
                        >
                            INICIAR SESIÓN
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;