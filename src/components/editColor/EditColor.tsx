import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import api from "../../api/axiosConfig";
import Joi from "joi";
import { Pipette } from "lucide-react";

interface ColorFormValues {
    name: string;
    hex: string;
}

const colorSchema = Joi.object<ColorFormValues>({
    name: Joi.string().min(3).required().messages({
        "string.empty": "El nombre es obligatorio",
        "string.min": "Mínimo 3 caracteres"
    }),
    hex: Joi.string()
        .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .required()
        .messages({
            "string.pattern.base": "Formato HEX inválido (ej: #FF5733)"
        })
});

const EditColor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<ColorFormValues>({
        resolver: joiResolver(colorSchema)
    });

    const currentHex = watch("hex");

      useEffect(() => {
        const fetchColor = async () => {
            try {
                const response = await api.get(`/colors/${id}`);
                const colorData = response.data.data;
                reset({
                    name: colorData.name,
                    hex: colorData.hex
                });
            } catch (err) {
                console.error("Error al actualizar el color", err);
                setErrorMessage("Error al cargar el color. Por favor, intenta nuevamente.");
                setTimeout(() => setErrorMessage(null), 2000);
                navigate("/colors");
            } finally {
                setLoading(false);
            }
        };
        fetchColor();
    }, [id, reset, navigate]);

       const onSubmit: SubmitHandler<ColorFormValues> = async (data) => {
        setServerError(null);
        try {
            await api.put(`/colors/${id}`, data);
            setSuccessMessage("¡Color actualizado!");
            setTimeout(() => setSuccessMessage(null), 2000);
            navigate("/colors");
        } catch (err) {
            console.error("Error al actualizar el color", err);
            setErrorMessage("Error al actualizar el color. Por favor, intenta nuevamente.");
            setTimeout(() => setErrorMessage(null), 2000);
        }
    };

    if (loading) return (
        <div>
            <p>Cargando...</p>
        </div>
    )

    return (
        <div>

        {/* HEADER DE ACCIÓN */}
        <div>
            <div>
                <h2>Editar Color</h2>
                <p>Modificación de color • Ché, el mate</p>
            </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
            {/* MENSAJES DE ESTADO */}
            {(serverError || errorMessage) && (
            <div className="alert alert-danger" role="alert">
                {serverError || errorMessage}
            </div>
            )}
            {(successMessage) && (
            <div className="alert alert-success" role="alert">
                {successMessage}
            </div>
            )}

            {/* CAMPO NOMBRE DE COLOR */}
            <div>
                <label>
                    Nombre del Color
                </label>
                <div>
                    <input
                        {...register("name")}
                        placeholder="Nombre del color"
                    />
                </div>
                {errors.name && <p className="error-message">{errors.name.message}</p>}
            </div>


            {/* CAMPO HEX */}
            <div>
                <label>
                    Código Hexadecimal
                </label>
                <div>
                    <div>
                        <input
                            {...register("hex")}
                            placeholder="#000000"
                        />
                    </div>

                    <div>
                        <input
                            type="color"
                            value={currentHex?.match(/^#([A-Fa-f0-9]{6})$/) ? currentHex : "#000000"}
                            onChange={(e) => setValue("hex", e.target.value.toUpperCase())}
                        />
                        <div
                        style={{
                            backgroundColor: currentHex?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? currentHex : "#F1F5F9",
                            boxShadow: `0 10px 15px -3px ${currentHex?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? currentHex + '40' : 'rgba(0,0,0,0.1)'}`
                        }}
                        >
                            <Pipette className={`w-5 h-5 ${parseInt((currentHex||'#ffffff').replace('#',''), 16) > 0xffffff/1.5 ? 'text-black/20' : 'text-white/40'}`} />
                        </div>
                    </div>
                </div>
                {errors.hex && <p className="error-message">{errors.hex.message}</p>}
            </div>
            
            {/* BOTONES DE ACCIÓN */}
            <div>
                <button
                type="submit"
                disabled={isSubmitting}
                >
                    <span>{isSubmitting ? "Guardando..." : "Guardar Cambios"}</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/colors")}
                >
                    Cancelar
                </button>
            </div>
        </form>
    </div>
    );
};

export default EditColor;