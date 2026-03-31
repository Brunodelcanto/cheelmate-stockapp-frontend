import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import api from "../../api/axiosConfig";
import Joi from "joi";

interface CategoryFormValues {
    name: string;
}

interface CreateCategoryProps {
    onCategoryCreated: () => void;
}

const categorySchema = Joi.object<CategoryFormValues>({
    name: Joi.string().min(3).required().messages({
        "string.empty": "El nombre es obligatorio",
        "string.min": "Debe tener al menos 3 caracteres"
    })
});

const CreateCategory = ({ onCategoryCreated}: CreateCategoryProps) => {
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const { register, reset, handleSubmit, formState: { errors, isSubmitting} } = useForm<CategoryFormValues>({
        resolver: joiResolver(categorySchema)
    })

    const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
        try {
            const response = await api.post("/categories", data);
            if (!response.data.error) {
                setSuccessMessage("Categoría creada exitosamente");
                setTimeout(() => setSuccessMessage(""), 2000);
                reset();
                onCategoryCreated();
            }
        } catch (err) {
            console.error("Error al crear categoría:", err);
            setErrorMessage("Error al crear categoría. Inténtalo de nuevo.");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    }

    return (
    <div>

    {/* HEADER DE CATEGORIA */}
    <div>
        <div>
            <h2>Nueva Categoría</h2>
            <p>Organización de Stock • Ché, el mate</p>
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

        {/* CAMPO DE NOMBRE */}
        <div>
            <label>
                Nombre
            </label>
            <div>
                <input
                    {...register("name")}
                    placeholder="Ej: Termos"
                />
            </div>
            {errors.name && <p className="error-message">{errors.name.message}</p>}
        </div>

        {/* BOTON DE CREACION */}
        <button
        type="submit"
        disabled={isSubmitting}       
        >
            <span>{isSubmitting ? "Guardando..." : "Crear Categoría"}</span>
        </button>
    </form>
    </div>
    );
};

export default CreateCategory;