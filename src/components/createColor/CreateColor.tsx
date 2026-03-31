import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import api from "../../api/axiosConfig";
import Joi from "joi";
import { Pipette } from "lucide-react";

interface ColorFormValues {
    name: string;
    hex: string;
}

interface CreateColorProps {
    onColorCreated: () => void;
}

const colorSchema = Joi.object<ColorFormValues>({
    name: Joi.string().min(3).required().messages({
        "string.empty": "El nombre es obligatorio",
        "string.min": "El nombre debe tener al menos 3 caracteres"
    }),
    hex: Joi.string()
        .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .required()
        .messages({
            "string.pattern.base": "Debe ser un código hexadecimal válido (ej: #000000)",
            "string.empty": "El código HEX es obligatorio"
        })
});

const CreateColor = ({ onColorCreated }: CreateColorProps) => {
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const { register,reset, handleSubmit,setValue, formState: { errors, isSubmitting }, watch } = useForm<ColorFormValues>({
        resolver: joiResolver(colorSchema),
        defaultValues: {
            hex: "#000000"
        }
    });

    const currentHex = watch("hex");


    const onSubmit: SubmitHandler<ColorFormValues> = async (data) => {
        try {
            const response = await api.post(`/colors`, data);
            if (!response.data.error) {
                setSuccessMessage("Color creado correctamente");
                setTimeout(() => setSuccessMessage(""), 2000);
                reset();
                onColorCreated();
        }
        } catch (err) {
            console.error("Error creando color:", err);
            setErrorMessage("Error al crear el color. Por favor, intenta nuevamente.");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    return (
        <div>
        {/* HEADER DEL FORMULARIO */}
        <div>
            <div>
                <h2>Crear Color</h2>
                <p>Registro de nuevo color • Ché, el mate</p>
            </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
            {/* MENSAJES DE ESTADO */}
                   {successMessage && (
            <div className="alert alert-success" role="alert">
                {successMessage}
            </div>
        )}
        {errorMessage && (
            <div className="alert alert-danger" role="alert">
                {errorMessage}
            </div>
        )}

        {/* CAMPO DE NOMBRE DEL COLOR */}
        <div>
            <label>
                Nombre del Color
            </label>
            <div>
                <input
                {...register("name")}
                placeholder="Ej: Azul"
                />
            </div>
            {errors.name && <p className="error-message">{errors.name.message}</p>}
        </div>

        {/* CAMPO DE CÓDIGO HEX */}
        <div>
            <input
            type="color"
            value={currentHex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? currentHex : "#000000"}
            onChange={(e) => setValue("hex", e.target.value.toUpperCase())}
            />
            <div
             style={{ 
            backgroundColor: currentHex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? currentHex : "#F1F5F9",
            boxShadow: `0 10px 15px -3px ${currentHex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? currentHex + '40' : 'rgba(0,0,0,0.1)'}`
            }}
            >
                <Pipette className={`w-5 h-5 ${parseInt((currentHex||'#ffffff').replace('#',''), 16) > 0xffffff/1.5 ? 'text-black/20' : 'text-white/40'}`} />
            </div>
            {errors.hex && <p className="error-message">{errors.hex.message}</p>}
        </div>

        {/* ACCIONES */}
        <div>
            <button
            type="submit"
            disabled={isSubmitting}
            >
                <span>{isSubmitting ? "Guardando..." : "Crear Color"}</span>
            </button>
        </div>
    </form>
</div>
    )
};
    export default CreateColor;