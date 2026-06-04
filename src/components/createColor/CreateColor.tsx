import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import api from "../../api/axiosConfig";
import Joi from "joi";
import { Palette, Pipette, CheckCircle, ShieldAlert } from "lucide-react";

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

    const { register, reset, handleSubmit, setValue, formState: { errors, isSubmitting }, watch } = useForm<ColorFormValues>({
        resolver: joiResolver(colorSchema),
        defaultValues: {
            hex: "#8A6851" // Default con tu marrón cuero insignia
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

    const inputStyle = "w-full bg-[#f4f6f9] text-[#1e293b] font-bold text-sm px-5 py-4 rounded-2xl border border-transparent focus:bg-white focus:border-brand-primary/40 transition-all duration-200 outline-none placeholder:text-slate-400 shadow-inner";
    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1";

return (
        <div className="w-full flex justify-center py-4">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 max-w-md w-full text-center">
                
                {/* HEADER */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-[#f4f6f9] p-4 rounded-2xl text-brand-primary shadow-inner mb-4">
                        <Palette className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter italic leading-none">Crear Color</h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {successMessage && (
                        <div className="p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-brand-accent font-bold text-xs flex items-center gap-3 text-left">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" /> {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="p-4 bg-brand-alert/10 border border-brand-alert/20 rounded-xl text-brand-alert font-bold text-xs flex items-center gap-3 text-left">
                            <ShieldAlert className="w-4 h-4 flex-shrink-0" /> {errorMessage}
                        </div>
                    )}

                    {/* SELECCIÓN DE COLOR */}
                    <div className="flex flex-col items-center justify-center py-4 relative group">
                        <label className={`${labelStyle} text-center mb-4`}>Selecciona la tonalidad</label>
                        
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <input
                                type="color"
                                value={currentHex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? currentHex : "#000000"}
                                onChange={(e) => setValue("hex", e.target.value.toUpperCase())}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 rounded-full"
                            />
                        
                            <div
                                style={{ 
                                    backgroundColor: currentHex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? currentHex : "#F1F5F9",
                                    boxShadow: currentHex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) 
                                        ? `0 15px 30px -5px ${currentHex}60` 
                                        : '0 10px 15px -3px rgba(0,0,0,0.1)'
                                }}
                                className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 z-10 border border-white/20 shadow-lg relative"
                            >
                                <Pipette className={`w-6 h-6 transition-transform duration-300 group-hover:rotate-12 ${parseInt((currentHex||'#ffffff').replace('#',''), 16) > 0xffffff/1.5 ? 'text-black/30' : 'text-white/60'}`} />
                            </div>
                        </div>

                        {/* MUESTRA DEL CODIGO STRING HEX */}
                        <span className="mt-4 bg-[#f4f6f9] px-4 py-1.5 rounded-full font-mono text-xs font-black text-slate-600 border border-slate-100 uppercase shadow-xs">
                            {currentHex || "#000000"}
                        </span>
                        {errors.hex && <p className="text-brand-alert font-bold text-[10px] uppercase mt-2">{errors.hex.message}</p>}
                    </div>

                    {/* CAMPO DE NOMBRE DEL COLOR */}
                    <div className="text-left">
                        <label className={labelStyle}>Nombre descriptivo</label>
                        <input
                            {...register("name")}
                            placeholder="Ej: Suela, Negro Mate, Madera Coihue"
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
                            {isSubmitting ? "Creando..." : "Crear Color"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateColor;