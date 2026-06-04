import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import api from "../../api/axiosConfig";
import Joi from "joi";
import { Tags, CheckCircle, ShieldAlert } from "lucide-react";

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

const CreateCategory = ({ onCategoryCreated }: CreateCategoryProps) => {
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const { register, reset, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({
        resolver: joiResolver(categorySchema)
    });

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
    };
    
    const inputStyle = "w-full bg-[#f4f6f9] text-[#1e293b] font-bold text-sm px-5 py-4 rounded-2xl border border-transparent focus:bg-white focus:border-brand-primary/40 transition-all duration-200 outline-none placeholder:text-slate-400 shadow-inner";
    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1";

    return (
        <div className="w-full flex justify-center py-4">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 max-w-md w-full text-center">
                
                {/* HEADER DEL FORMULARIO */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-[#f4f6f9] p-4 rounded-2xl text-brand-primary shadow-inner mb-4">
                        <Tags className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter italic leading-none">Nueva Categoría</h2>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-2">Configuración de Categorías • Ché, el mate</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {successMessage && (
                        <div className="p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-brand-accent font-bold text-xs flex items-center gap-3 text-left animate-in fade-in duration-200">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" /> {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="p-4 bg-brand-alert/10 border border-brand-alert/20 rounded-xl text-brand-alert font-bold text-xs flex items-center gap-3 text-left animate-in fade-in duration-200">
                            <ShieldAlert className="w-4 h-4 flex-shrink-0" /> {errorMessage}
                        </div>
                    )}

                    {/* CAMPO DE NOMBRE */}
                    <div className="text-left">
                        <label className={labelStyle}>Nombre</label>
                        <input
                            {...register("name")}
                            placeholder="Ej: Mates Imperiales, Camioneros, Bombillas"
                            className={inputStyle}
                        />
                        {errors.name && <p className="text-brand-alert font-bold text-[10px] uppercase mt-2 px-1">{errors.name.message}</p>}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-brand-primary text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-lg shadow-brand-primary/25 transition-all duration-300 hover:bg-[#765642] hover:shadow-xl hover:shadow-brand-primary/30 active:scale-[0.98] cursor-pointer text-center disabled:opacity-50"
                        >
                            {isSubmitting ? "Sincronizando..." : "Crear Categoría"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateCategory;