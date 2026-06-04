import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import type { SubmitHandler } from "react-hook-form";
import { useForm, useFieldArray } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi"; 
import type { Category, Color, ColorVariant } from "../../types/index";
import Joi from "joi";
import imageCompression from "browser-image-compression";
import { 
  Package, UploadCloud, Trash2, Plus, 
  Layers, ShieldAlert, CheckCircle 
} from "lucide-react";

interface ProductFormValues {
    name: string;
    category: string;
    minStockAlert: number;
    variants: ColorVariant[];
    image: FileList | null;
}

interface CreateProductProps {
    onProductCreated: () => void;
}

const validationSchema = Joi.object<ProductFormValues>({
    name: Joi.string().min(3).max(50).required().messages({
        "string.base": "El nombre debe ser un texto",
        "string.empty": "El nombre es requerido",
        "string.min": "El nombre debe tener al menos 3 caracteres",
    }),
    category: Joi.string().required().messages({
        "string.empty": "La categoría es requerida",
    }),
    minStockAlert: Joi.number().default(5),
    variants: Joi.array().items(
        Joi.object({
            color: Joi.string().required().messages({
                "string.empty": "El color es requerido",
            }),
            amount: Joi.number().min(0).required().messages({
                "string.empty": "La cantidad es requerida",
                "number.base": "La cantidad debe ser un número",
                "number.min": "La cantidad no puede ser negativa",
            }),
            priceCost: Joi.number().min(0).required().messages({
                "string.empty": "El precio de costo es requerido",
                "number.base": "El precio de costo debe ser un número",
                "number.min": "El precio de costo no puede ser negativo",
            }),
            priceSell: Joi.number().min(0).required().messages({
                "string.empty": "El precio de venta es requerido",
                "number.base": "El precio de venta debe ser un número",
                "number.min": "El precio de venta no puede ser negativo",
            }),
        })
    ).min(1).required().messages({
        "array.min": "Debe haber al menos una variación de color",
    }),
    image: Joi.any().required().messages({
        "any.required": "La imagen es obligatoria"
    })
});

const CreateProduct = ({ onProductCreated }: CreateProductProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(false);
    const [preview , setPreview] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { register, control, handleSubmit, reset, resetField, watch, formState: { errors } } = useForm<ProductFormValues>({
        resolver: joiResolver(validationSchema),
        defaultValues: {
            name: "",
            category: "",
            minStockAlert: 5,
            variants: [{ color: "", amount: 0, priceCost: 0, priceSell: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "variants" });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [resCats, resCols] = await Promise.all([
                    api.get(`/categories`),
                    api.get(`/colors`)
                ]);
                setCategories(resCats.data.data);
                setColors(resCols.data.data);
            } catch (error) {
                console.error("Error cargando selectores:", error);
            }
        };
        loadInitialData();
    }, []);

    const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
        const selectedColors = data.variants.map(v => v.color);
        const hasDuplicates = selectedColors.some((color, index) => selectedColors.indexOf(color) !== index);
        
        if (hasDuplicates) {
            setErrorMessage("No puedes agregar el mismo color más de una vez");
            setTimeout(() => setErrorMessage(""), 2000);
            return;
        }
        
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("category", data.category);
            formData.append("minStockAlert", data.minStockAlert.toString());

            const cleanedVariants = data.variants.map(v => ({
                color: v.color,
                amount: Number(v.amount),
                priceCost: Number(v.priceCost),
                priceSell: Number(v.priceSell)
            }))

            formData.append("variants", JSON.stringify(cleanedVariants));

            if (data.image && data.image[0]) {
                const originalFile = data.image[0];
                const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true };

                try {
                    const compressedBlob = await imageCompression(originalFile, options);
                    const compressedFile = new File([compressedBlob], originalFile.name, {
                        type: originalFile.type,
                        lastModified: Date.now(),
                    });
                    formData.append("image", compressedFile);
                } catch (compressionError) {
                    console.error("Error al comprimir la imagen:", compressionError);
                    formData.append("image", originalFile);
                }
            }

            const token = localStorage.getItem("token");
            await api.post(`/products`, formData, {
                headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
            });

            setSuccessMessage("¡Producto cargado con éxito!");
            setTimeout(() => setSuccessMessage(""), 2000);
            setPreview(null);
            reset();
            onProductCreated();
        } catch (err) {
            const error = err as any;
            setErrorMessage(error.response?.data?.message || "Error al crear producto");
            setTimeout(() => setErrorMessage(""), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setPreview(reader.result as string); };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const clearImage = () => {
        setPreview(null);
        resetField("image"); 
    };

    const handleClearForm = () => {
        reset();
        setPreview(null);
    };

    const inputStyle = "w-full bg-[#f8fafc] text-brand-dark font-semibold text-sm px-5 py-4 rounded-xl border border-transparent focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200 outline-none placeholder:text-brand-dark/30 shadow-inner";
    const labelStyle = "text-[10px] font-black text-brand-dark/40 uppercase tracking-widest block mb-2 px-1";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-pop border border-slate-100/60 max-w-5xl mx-auto my-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="bg-brand-primary/10 p-3 rounded-2xl text-brand-primary">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter italic leading-none">Nuevo Producto</h2>
                        <p className="text-brand-dark/30 font-bold text-[10px] uppercase tracking-[0.2em] mt-1.5">Carga de inventario • Ché, el mate</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleClearForm}
                    className="self-start sm:self-auto text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/5 border border-brand-primary/10 px-4 py-2.5 rounded-xl transition-all duration-200 hover:bg-brand-primary hover:text-white active:scale-95 cursor-pointer"
                >
                    Vaciar formulario
                </button>
            </div>

            {successMessage && (
                <div className="mb-6 p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-brand-accent font-bold text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" /> {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="mb-6 p-4 bg-brand-alert/10 border border-brand-alert/20 rounded-xl text-brand-alert font-bold text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" /> {errorMessage}
                </div>
            )}

            {/* DATOS BÁSICOS E IMAGEN */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                {/* CAMPOS DE TEXTO (Izquierda) */}
                <div className="lg:col-span-7 space-y-6">
                    <div>
                        <label className={labelStyle}>Nombre del producto</label>
                        <input 
                            {...register("name")}
                            className={inputStyle}
                            placeholder="Ej: Camionero de algarrobo" 
                        />
                        {errors.name && <p className="text-brand-alert font-bold text-[10px] uppercase tracking-wide mt-2 px-1">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Categoría</label>
                            <select {...register("category")} className={`${inputStyle} appearance-none cursor-pointer`}>
                                <option value="">Seleccionar...</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.category && <p className="text-brand-alert font-bold text-[10px] uppercase tracking-wide mt-2 px-1">{errors.category.message}</p>}
                        </div>

                        <div>
                            <label className={labelStyle}>Alerta de stock</label>
                            <input 
                                type="number" 
                                {...register("minStockAlert")} 
                                className={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* CARGA DE IMAGEN (Derecha) */}
                <div className="lg:col-span-5 flex flex-col justify-end">
                    <label className={labelStyle}>Imagen</label>
                    <div className="h-[212px] bg-[#f8fafc] border-2 border-dashed border-slate-200 rounded-2xl relative transition-all duration-300 hover:border-brand-primary/40 group overflow-hidden flex items-center justify-center">
                        {!preview ? (
                            <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer p-6 text-center select-none">
                                <div className="bg-white p-3 rounded-xl shadow-md text-brand-dark/40 group-hover:text-brand-primary group-hover:scale-110 transition-all duration-300">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-brand-dark/70 block uppercase tracking-wide">Arrastra o selecciona</span>
                                    <span className="text-[10px] font-bold text-brand-dark/30 uppercase mt-1 block">PNG, JPG hasta 5MB</span>
                                </div>
                                <input 
                                    type="file" 
                                    {...register("image")} 
                                    accept="image/*" 
                                    className="hidden"
                                    onChange={(e) => { register("image").onChange(e); handleImageChange(e); }} 
                                />
                            </label>
                        ) : (
                            <div className="w-full h-full relative group/img">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-xs opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex items-center justify-center">
                                    <button 
                                        type="button" 
                                        onClick={clearImage}
                                        className="bg-brand-alert text-white p-3.5 rounded-xl shadow-lg active:scale-90 transition-transform cursor-pointer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {errors.image && <p className="text-brand-alert font-bold text-[10px] uppercase tracking-wide mt-2 px-1">{errors.image.message}</p>}
                </div>
            </div>

            {/* VARIANTES DE COLOR */}
            <div className="mb-10 bg-slate-50/50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                <div className="flex items-center justify-between mb-6 border-b border-slate-200/60 pb-4">
                    <h3 className="text-base font-black text-brand-dark uppercase tracking-tighter italic flex items-center gap-2">
                        <Layers className="w-4 h-4 text-brand-primary" /> Colores
                    </h3>
                    <button 
                        type="button" 
                        onClick={() => append({color: "", amount: 0, priceCost: 0, priceSell: 0})}
                        className="flex items-center gap-1.5 bg-brand-light text-brand-primary text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md shadow-brand-dark/10 transition-all duration-200 hover:text-white hover:bg-brand-primary active:scale-[0.97] cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" /> Agregar color
                    </button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div 
                            key={field.id} 
                            className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all duration-200 hover:shadow-md animate-in fade-in zoom-in-95 duration-200"
                        >
                            <div className="sm:col-span-4">
                                <label className={labelStyle}>Color</label>
                                <div className="relative">
                                    <select 
                                        {...register(`variants.${index}.color` as const)} 
                                        className={`${inputStyle} py-3.5`}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {colors.map(c => {
                                            const isAlreadySelected = fields.some((_, idx) =>
                                                idx !== index && watch(`variants.${idx}.color`) === c._id);

                                            return (
                                                <option key={c._id} value={c._id} disabled={isAlreadySelected}>
                                                    {c.name} {isAlreadySelected ? "✕" : ""}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className={labelStyle}>Stock</label>
                                <input 
                                    type="number" 
                                    {...register(`variants.${index}.amount` as const)} 
                                    className={`${inputStyle} py-3.5`}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className={labelStyle}>Costo ($)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    {...register(`variants.${index}.priceCost` as const)} 
                                    className={`${inputStyle} py-3.5`}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className={labelStyle}>Venta ($)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    {...register(`variants.${index}.priceSell` as const)} 
                                    className={`${inputStyle} py-3.5`}
                                />
                            </div>

                            <div className="sm:col-span-2 flex justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => remove(index)} 
                                    disabled={fields.length === 1}
                                    className="w-full sm:w-12 h-12 flex items-center justify-center bg-brand-alert/5 text-brand-alert border border-brand-alert/10 hover:bg-brand-alert hover:text-white rounded-xl transition-all duration-200 active:scale-90 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

          <div className="w-full flex justify-center pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full max-w-xs bg-brand-primary text-white font-black uppercase tracking-widest text-xs py-4 rounded-[var(--radius-action)] shadow-lg shadow-brand-primary/20 transition-all duration-300 hover:scale-[1.01] hover:bg-brand-primary/95 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-center"
                >
                    {loading ? "Procesando operación..." : "Crear producto"}
                </button>
            </div>
        </form>
    );
};

export default CreateProduct;