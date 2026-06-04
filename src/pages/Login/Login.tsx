import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Joi from "joi";
import { useForm } from "react-hook-form";
import axios from "axios";
import api from "../../api/axiosConfig";
import { joiResolver } from "@hookform/resolvers/joi";
import { useState } from "react";
import { LogIn, Mail, Lock, ShieldAlert } from "lucide-react";

type LoginFormInputs = {
    email: string;
    password: string;
}

const validationSchema = Joi.object<LoginFormInputs>({
    email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).min(3).max(30).required().messages({
        "string.empty": "El email es obligatorio",
        "string.min": "Mínimo 3 caracteres",
        "string.max": "Máximo 30 caracteres",
        "string.pattern.base": "Formato de email inválido",
    }),
    password: Joi.string().min(6).max(30).required().messages({
        "string.empty": "La contraseña es obligatoria",
        "string.min": "Mínimo 6 caracteres",
        "string.max": "Máximo 30 caracteres",
    })
});

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        resolver: joiResolver(validationSchema),
    });

    const handleLogin = async (formData: LoginFormInputs) => {
        setApiError(null);
        try {
            const response = await api.post(`/users/login`, formData)

            const { user, token } = response.data;

            if (user && token) {
                localStorage.setItem('token', token);

                login(user,token);
                navigate('/dashboard');
            } else {
                setApiError("Respuesta incompleta del servidor");
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setApiError(err.response?.data?.message || "Error en las credenciales");
            }
        }
    }

    const inputStyle = "w-full bg-[#f4f6f9] text-[#1e293b] font-bold text-sm pl-11 pr-4 py-4 rounded-2xl border border-transparent focus:bg-white focus:border-brand-primary/40 transition-all duration-200 outline-none placeholder:text-slate-400 shadow-inner";
    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1";

    return (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 max-w-md w-full">
                
                {/* HEADER */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="bg-[#f4f6f9] p-4 rounded-2xl text-brand-primary shadow-inner mb-4">
                        <LogIn className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter italic leading-none">Iniciar Sesión</h2>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-2">Panel Operativo • Ché, el mate</p>
                </div>

                {apiError && (
                    <div className="mb-6 p-4 bg-brand-alert/10 border border-brand-alert/20 rounded-xl text-brand-alert font-bold text-xs flex items-center gap-3">
                        <ShieldAlert className="w-4 h-4 flex-shrink-0" /> {apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
                    
                    {/* CAMPO DE EMAIL */}
                    <div>
                        <label className={labelStyle}>Credenciales de usuario</label>
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

                    {/* CAMPO DE CONTRASEÑA */}
                    <div>
                        <label className={labelStyle}>Contraseña</label>
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
                            Iniciar sesión
                        </button>
                    </div>

                    {/* FOOTER */}
                    <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">¿Eres nuevo en el equipo?</p>
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:opacity-80 transition-all cursor-pointer mt-1"
                        >
                            CREAR CUENTA
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login;