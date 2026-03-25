import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import api from "../../api/axiosConfig";

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

  return (
        <div>
            {apiError && <p style={{ color: 'red' }}>{apiError}</p>}
            
            <form onSubmit={handleSubmit(handleRegister)}>
                <div>
                    <label>Nombre completo</label>
                    <input type="text" {...register("name")} />
                    {errors.name && <p>{errors.name.message}</p>}
                </div>

                <div>
                    <label>Email</label>
                    <input type="email" {...register("email")} />
                    {errors.email && <p>{errors.email.message}</p>}
                </div>

                <div>
                    <label>Contraseña</label>
                    <input type="password" {...register("password")} />
                    {errors.password && <p>{errors.password.message}</p>}
                </div>

                <button type="submit">Registrarse</button>
                
                <p>¿Ya tienes cuenta? 
                    <button type="button" onClick={() => navigate("/login")}>INICIAR SESIÓN</button>
                </p>
            </form>
        </div>
    );
};

export default Register;