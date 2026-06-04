import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import api from "../../api/axiosConfig";
import Joi from "joi";
import type { ProductFormValues, Category, Color, ColorVariant } from "../../types/index";
import { 
  Edit3, UploadCloud, X, Plus, 
  Package, Trash2, ArrowLeft, ShieldAlert, CheckCircle 
} from "lucide-react";

const editSchema = Joi.object<ProductFormValues>({
    name: Joi.string().min(3).required().messages({
        "any.required": "El nombre es obligatorio",
        "string.empty": "El nombre no puede estar vacío",
        "string.min": "El nombre debe tener al menos 3 caracteres"
    }),
    category: Joi.string().min(3).required().messages({
        "any.required": "La categoría es obligatoria",
        "string.empty": "La categoría no puede estar vacía",
        "string.min": "La categoría debe tener al menos 3 caracteres"
    }),
    minStockAlert: Joi.number().default(5).min(0).required().messages({
        "any.required": "La alerta de stock es obligatoria",
        "number.base": "La alerta de stock debe ser un número",
        "number.min": "La alerta de stock no puede ser negativa"
    }),
    variants: Joi.array().items(
        Joi.object({
            _id: Joi.string().optional(),
            color: Joi.string().required(),
            amount: Joi.number().min(0).required(),
            priceCost: Joi.number().min(0).required(),
            priceSell: Joi.number().min(0).required()
        })
    ).min(1).required(),
    image: Joi.any().optional()
});

const EditProduct = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { register, control, handleSubmit, reset, resetField, formState: { errors } } = useForm<ProductFormValues>({
        resolver: joiResolver(editSchema)
    });

    const { fields, append, remove } = useFieldArray({ control, name: "variants" });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [resProduct, resCats, resCols] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get(`/categories`),
                    api.get(`/colors`)
                ]);

                const p = resProduct.data.data;
                setCategories(resCats.data.data);
                setColors(resCols.data.data);

                reset({
                    name: p.name,
                    category: typeof p.category === 'object' ? p.category._id : p.category,
                    minStockAlert: p.minStockAlert,
                    variants: p.variants.map((v: ColorVariant) => ({
                        _id: v._id,
                        color: typeof v.color === 'object' ? v.color._id : v.color,
                        amount: v.amount,
                        priceCost: v.priceCost,
                        priceSell: v.priceSell
                    }))
                });

                if (p.image?.url) setPreview(p.image.url);
            } catch (err) {
                console.error("Error cargando producto", err);
                navigate("/products");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id, reset, navigate]);

    const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("category", data.category);
            formData.append("minStockAlert", data.minStockAlert.toString());
            formData.append("variants", JSON.stringify(data.variants));

            if (data.image && data.image[0]) {
                formData.append("image", data.image[0]);
            }

            await api.put(`/products/${id}`, formData);
            setSuccessMessage("¡Producto actualizado!");
            setTimeout(() => setSuccessMessage(""), 2000);
            navigate("/products");
        } catch (err) {
            console.error(err);
            setErrorMessage("Error al actualizar");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8fafc]">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-brand-dark/40 font-black uppercase tracking-widest text-xs animate-pulse">Cargando...</p>
        </div>
    );

    const inputStyle = "w-full bg-[#f4f6f9] text-[#1e293b] font-bold text-sm px-5 py-4 rounded-2xl border border-transparent focus:bg-white focus:border-brand-primary/40 transition-all duration-200 outline-none placeholder:text-slate-400";
    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1";

    return (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 md:p-8">
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 max-w-4xl w-full"
            >
                {/* HEADER */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="bg-[#f4f6f9] p-4 rounded-2xl text-brand-primary shadow-inner">
                        <Edit3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter italic leading-none">Editar Producto</h2>
                        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-2">Edición de producto • Ché, el mate</p>
                    </div>
                </div>

                {successMessage && (
                    <div className="mb-6 p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-brand-accent font-bold text-sm flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" /> {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-6 p-4 bg-brand-alert/10 border border-brand-alert/20 rounded-xl text-brand-alert font-bold text-sm flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 flex-shrink-0" /> {errorMessage}
                    </div>
                )}

                {/* FILA SUPERIOR: DATOS GENERALES (IZQUERDA) + IMAGEN (DERECHA) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-10">
                    
                    {/* INPUTS PRINCIPALES */}
                    <div className="md:col-span-7 space-y-5">
                        <div>
                            <label className={labelStyle}>Nombre del producto</label>
                            <input {...register("name")} className={inputStyle} />
                            {errors.name && <p className="text-brand-alert font-bold text-[10px] uppercase mt-1 px-1">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Categoría</label>
                                <select {...register("category")} className={`${inputStyle} appearance-none cursor-pointer`}>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Alerta Stock</label>
                                <input type="number" {...register("minStockAlert")} className={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-5 flex justify-center md:justify-end">
                        <div className="w-full max-w-[280px] h-[165px] bg-white border-2 border-dashed border-slate-200 rounded-3xl relative transition-all duration-300 hover:border-brand-primary/40 flex items-center justify-center p-3 group">
                            {!preview ? (
                                <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer text-center select-none">
                                    <UploadCloud className="w-6 h-6 text-slate-300" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Subir imagen</span>
                                    <input 
                                        type="file" 
                                        {...register("image")} 
                                        accept="image/*" 
                                        className="hidden"
                                        onChange={(e) => {
                                            register("image").onChange(e);
                                            const file = e.target.files?.[0];
                                            if (file) setPreview(URL.createObjectURL(file));
                                        }} 
                                    />
                                </label>
                            ) : (
                                <div className="w-full h-full bg-[#f4f6f9] rounded-2xl overflow-hidden relative flex items-center justify-center">
                                    <img src={preview} alt="Preview" className="max-h-[120px] object-contain" />
                                    <button 
                                        type="button" 
                                        onClick={() => { setPreview(null); resetField("image"); }}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors active:scale-90 cursor-pointer z-10"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-base font-black text-brand-dark uppercase tracking-tighter italic flex items-center gap-2">
                            <Package className="w-4 h-4 text-brand-primary" /> Colores
                        </h3>
                        <button 
                            type="button" 
                            onClick={() => append({ color: "", amount: 0, priceCost: 0, priceSell: 0})}
                            className="flex items-center gap-1.5 bg-brand-light text-brand-primary text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md shadow-brand-dark/10 transition-all duration-200 hover:text-white hover:bg-brand-primary active:scale-[0.97] cursor-pointer"
                        >
                            <Plus className="w-3 h-3" /> Agregar color
                        </button>
                    </div>

                    {/* RECUADRO CONTENEDOR DE VARIANTES */}
                    <div className="bg-[#f4f6f9] p-4 rounded-[2rem] border border-transparent space-y-3">
                        {fields.map((field, index) => (
                            <div 
                                key={field.id} 
                                className="grid grid-cols-12 gap-3 items-center bg-white px-5 py-4 rounded-xl shadow-xs"
                            >
                                <div className="col-span-4">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-wider mb-1 block">Color</label>
                                    <select {...register(`variants.${index}.color` as const)} className="w-full text-sm font-bold bg-transparent border-b border-slate-100 py-1 focus:border-brand-primary outline-none text-brand-dark">
                                        {colors.map(col => <option key={col._id} value={col._id}>{col.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-wider mb-1 block">Stock</label>
                                    <input type="number" {...register(`variants.${index}.amount` as const)} className="w-full text-sm font-bold bg-transparent border-b border-slate-100 py-1 outline-none text-brand-dark" />
                                </div>
                                <div className="col-span-3">
                                    <label className="text-[9px] font-black text-brand-accent uppercase tracking-wider mb-1 block">Venta ($)</label>
                                    <input type="number" step="0.01" {...register(`variants.${index}.priceSell` as const)} className="w-full text-sm font-black bg-transparent border-b border-slate-100 py-1 outline-none text-brand-accent" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[9px] font-black text-brand-alert uppercase tracking-wider mb-1 block">Costo ($)</label>
                                    <input type="number" step="0.01" {...register(`variants.${index}.priceCost` as const)} className="w-full text-sm font-bold bg-transparent border-b border-slate-100 py-1 outline-none text-brand-alert" />
                                </div>
                                <div className="col-span-1 flex justify-end pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => remove(index)} 
                                        disabled={fields.length === 1}
                                        className="text-slate-300 hover:text-red-500 disabled:opacity-20 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

       <div className="flex flex-col sm:flex-row gap-4 pt-4">
    <button 
        type="submit"
        className="flex-1 bg-brand-primary text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-lg shadow-brand-primary/25 transition-all duration-300 hover:bg-[#765642] hover:shadow-xl hover:shadow-brand-primary/30 active:scale-[0.98] cursor-pointer text-center"
    >
        Guardar cambios
    </button>
    <button 
        type="button" 
        onClick={() => navigate("/products")}
        className="sm:w-56 bg-[#f4f6f9] text-[#475569] font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all duration-200 hover:bg-slate-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1"
    >
        <ArrowLeft className="w-3.5 h-3.5" /> Cancelar
    </button>
</div>
            </form>
        </div>
    );
};

export default EditProduct;