import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Joi from "joi";
import { useForm } from "react-hook-form";
import axios from "axios";
import api from "../../api/axiosConfig";
import { joiResolver } from "@hookform/resolvers/joi";
import { useState } from "react";

// Definición de tipos para el formulario de login
type LoginFormInputs = {
    email: string;
    password: string;
}

// Esquema de validación con Joi para el formulario de login
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
    })

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

    return (
        <div>
            {apiError && (
                <div>
                    <p>{apiError}</p>
                </div>
            )}
            <form onSubmit={handleSubmit(handleLogin)}>
                <div>
                    <label>Credenciales de usuario</label>
                    <input type="email" placeholder="nombre@empresa.com" {...register("email")} />
                    {errors.email && <p>{errors.email.message}</p>}
                </div>
                <div>
                    <label>Contraseña</label>
                    <input type="password" placeholder="••••••••" {...register("password")} />
                    {errors.password && <p>{errors.password.message}</p>}
                </div>
                <button type="submit">Iniciar sesión</button>
                <div>
                    <p>¿Eres nuevo en el equipo? {' '}</p>
                    <button
                    onClick={() => navigate("/register")}
                    >
                        CREAR CUENTA
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Login;