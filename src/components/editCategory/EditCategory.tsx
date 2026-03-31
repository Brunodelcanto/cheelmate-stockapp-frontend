import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import api from "../../api/axiosConfig";
import Joi from "joi";

interface CategoryFormValues {
    name: string;
}

const categorySchema = Joi.object<CategoryFormValues>({
    name: Joi.string().min(3).required().messages({
        "string.empty": "El nombre es obligatorio",
        "string.min": "Mínimo 3 caracteres"
    })
});

const EditCategory = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

     const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({
        resolver: joiResolver(categorySchema)
    });

     useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await api.get(`/categories/${id}`);
                const categoryData = response.data.data;
                reset({
                    name: categoryData.name
                });
            } catch (err) {
                console.error("Error al actualizar la categoría", err);
                setErrorMessage("Error al cargar la categoría. Por favor, intenta nuevamente.");
                setTimeout(() => setErrorMessage(null), 2000);
                navigate("/categories");
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [id, reset, navigate]);

      const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
        try {
            await api.put(`/categories/${id}`, data);
            setSuccessMessage("¡Categoría actualizada!");
            setTimeout(() => setSuccessMessage(null), 2000);
            navigate("/categories");
        } catch (err) {
            console.error("Error al actualizar la categoría", err);
            setErrorMessage("Error al actualizar la categoría. Por favor, intenta nuevamente.");
            setTimeout(() => setErrorMessage(null), 2000);
        }
    };

    if (loading) return (
        <div>
            <div>Cargando categoría...</div>
        </div>
    );

    if (loading) return (
        <div>
            <p>Cargando categoría...</p>
        </div>
    )

    return (
        <div>

        {/* HEADER DE EDICION */}
        <div>
            <div>
                <h2>Editar Categoría</h2>
                <p>Modificación de Categoría • Ché, el mate</p>
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

        {/* CAMPO DE NOMBRE DE CATEGORÍA */}
        <div>
            <label>
                Nombre actualizado
            </label>
            <div>
                <input
                {...register("name")}
                placeholder="Ej: Bombillas"
                />
            </div>
            {errors.name && <p className="error-message">{errors.name.message}</p>}
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div>
            <button
            type="submit"
            disabled={isSubmitting}
            >
                <span>{isSubmitting ? "Actualizando..." : "Guardar Cambios"}</span>
            </button>
            <button
            type="button"
            onClick={() => navigate("/categories")}
            >
                Cancelar
            </button>
        </div>
    </form>
</div>
    );
};

export default EditCategory;