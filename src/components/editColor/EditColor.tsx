import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import api from "../../api/axiosConfig";
import Joi from "joi";
import { Edit3, Pipette, ArrowLeft, CheckCircle, ShieldAlert } from "lucide-react";

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
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8fafc]">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-brand-dark/40 font-black uppercase tracking-widest text-xs animate-pulse">Cargando...</p>
        </div>
    );

    const inputStyle = "w-full bg-[#f4f6f9] text-[#1e293b] font-bold text-sm px-5 py-4 rounded-2xl border border-transparent focus:bg-white focus:border-brand-primary/40 transition-all duration-200 outline-none placeholder:text-slate-400 shadow-inner";
    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1";

    return (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 md:p-8">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 max-w-xl w-full">
                
                {/* HEADER */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="bg-[#f4f6f9] p-4 rounded-2xl text-brand-primary shadow-inner">
                        <Edit3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter italic leading-none">Editar Color</h2>
                        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-2">Gestión de color • Ché, el mate</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {(serverError || errorMessage) && (
                        <div className="p-4 bg-brand-alert/10 border border-brand-alert/20 rounded-xl text-brand-alert font-bold text-xs flex items-center gap-3">
                            <ShieldAlert className="w-4 h-4 flex-shrink-0" /> {serverError || errorMessage}
                        </div>
                    )}
                    {successMessage && (
                        <div className="p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-brand-accent font-bold text-xs flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" /> {successMessage}
                        </div>
                    )}

                    {/* CAMPO NOMBRE DE COLOR */}
                    <div>
                        <label className={labelStyle}>Nombre del Color</label>
                        <input
                            {...register("name")}
                            placeholder="Ej: Suela, Negro Mate"
                            className={inputStyle}
                        />
                        {errors.name && <p className="text-brand-alert font-bold text-[10px] uppercase mt-2 px-1">{errors.name.message}</p>}
                    </div>

                    {/* CAMPO HEX + SELECTOR */}
                    <div>
                        <label className={labelStyle}>Código Hexadecimal</label>
                        <div className="grid grid-cols-12 gap-4 items-center">
                        
                            <div className="col-span-8">
                                <input
                                    {...register("hex")}
                                    placeholder="#000000"
                                    className={inputStyle}
                                />
                            </div>

                            <div className="col-span-4 flex justify-end relative h-14">
                                <input
                                    type="color"
                                    value={currentHex?.match(/^#([A-Fa-f0-9]{6})$/) ? currentHex : "#000000"}
                                    onChange={(e) => setValue("hex", e.target.value.toUpperCase())}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 rounded-xl"
                                />
                                <div
                                    style={{
                                        backgroundColor: currentHex?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? currentHex : "#f4f6f9",
                                        boxShadow: currentHex?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) 
                                            ? `0 10px 20px -3px ${currentHex}50` 
                                            : '0 4px 6px -1px rgba(0,0,0,0.05)'
                                    }}
                                    className="w-full h-full rounded-2xl flex items-center justify-center transition-all duration-300 border border-black/5 z-10 shadow-sm"
                                >
                                    <Pipette className={`w-5 h-5 ${parseInt((currentHex||'#ffffff').replace('#',''), 16) > 0xffffff/1.5 ? 'text-black/30' : 'text-white/60'}`} />
                                </div>
                            </div>
                        </div>
                        {errors.hex && <p className="text-brand-alert font-bold text-[10px] uppercase mt-2 px-1">{errors.hex.message}</p>}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-brand-primary text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-lg shadow-brand-primary/25 transition-all duration-300 hover:bg-[#765642] hover:shadow-xl hover:shadow-brand-primary/30 active:scale-[0.98] cursor-pointer text-center"
                        >
                            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/colors")}
                            className="sm:w-44 bg-[#f4f6f9] text-[#475569] font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all duration-200 hover:bg-slate-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditColor;