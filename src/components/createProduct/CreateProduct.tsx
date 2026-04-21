import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import type {SubmitHandler } from "react-hook-form";
import { useForm, useFieldArray } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi"; 
import type { Category, Color, ColorVariant } from "../../types/index";
import Joi from "joi";
import imageCompression from "browser-image-compression";

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
        "string.empty": "La categoría es requerida",}),
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
        }).min(1).required().messages({
            "array.min": "Debe haber al menos una variación de color",
        }),
    ),
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

    useEffect(() => {
    if (Object.keys(errors).length > 0) {
        console.log("Errors en validaciones:", errors);
    }
}, [errors]);

    const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
        const selectedColors = data.variants.map(v => v.color);
        const hasDuplicates = selectedColors.some((color, index) => selectedColors.indexOf(color) !== index);
        
        if (hasDuplicates) {
            setErrorMessage("No puedes agregar el mismo color más de una vez");
            setTimeout(() => setErrorMessage(""), 2000);
            setLoading(false);
            return;
        }
        
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("category", data.category);
            formData.append("minStockAlert", data.minStockAlert.toString());
            formData.append("variants", JSON.stringify(data.variants));

            if (data.image && data.image[0]) {
                const originalFile = data.image[0];

                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                };

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
        reader.onloadend = () => {
            setPreview(reader.result as string); 
        };
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


    return (
       <form onSubmit={handleSubmit(onSubmit)}>

        {/* HEADER DEL FORMULARIO */}
        <div>
            <div>
                <div>
                    <h2>Nuevo Producto</h2>
                    <p>Carga de inventario • Ché, el mate</p>
                </div>
                <button
                type="button"
                onClick={handleClearForm}
                >
                    <span>Vaciar formulario</span>
                </button>
            </div>

        {/* MENSAJES DE ESTADO */}
        {successMessage && <div>{successMessage}</div>}
        {errorMessage && <div>{errorMessage}</div>}
        </div>


        {/* SECCION 1: DATOS BÁSICOS E IMAGEN */}
        <div>
            <div>
                <div>
                    <label>Nombre del producto</label>
                    <input 
                    {...register("name")}
                    placeholder="Ej: Camionero de algarrobo" 
                    />
                    {errors.name && <p>{errors.name.message}</p>}
                </div>
                <div>
                    <label>Categoría</label>
                    <div>
                        <select
                        {...register("category")}
                        >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(c => (
                            <option key={c._id} value={c._id}>
                                {c.name}
                            </option>
                        ))}
                        </select>
                    </div>
                {errors.category && <p>{errors.category.message}</p>}
                </div>
            </div>

        {/* CARGA DE IMAGEN CON PREVIEW */}
            <div>
                {!preview ? (
                    <label>
                        <span>Subir imagen</span>
                        <input type="file" {...register("image")} accept="image/*" onChange={(e) => {register("image").onChange(e); handleImageChange(e)}} />
                    </label>
                ):(
                    <div>
                        <img src={preview} alt="Preview" />
                        <button type="button" onClick={clearImage}>
                            <span>Eliminar imagen</span>
                        </button>
                    </div>
                )}
                {errors.image && <p>{errors.image.message}</p>}
            </div>
        </div>

        {/* SECCION 2: VARIANTES DE COLOR */}
        <div>
            <div>
                <h3>Configuracion de variantes</h3>
                <button type="button" onClick={() => append({color: "", amount: 0, priceCost: 0, priceSell: 0})}>
                Agregar variante
                </button>
            </div>

            <div>
                {fields.map((field, index) => (
                    <div key={field.id}>
                        <div>
                            <label>Color</label>
                            <select {...register(`variants.${index}.color` as const)}>
                                <option value="">Color...</option>
                                {colors.map(c => {
                                    const isAlreadySelected = fields.some((_, idx) =>
                                    idx !== index && watch(`variants.${idx}.color`) === c._id);

                                    return (
                                        <option
                                            key={c._id}
                                            value={c._id}
                                            disabled={isAlreadySelected}
                                        >
                                            {c.name} {isAlreadySelected ? "(Ya seleccionado)" : ""}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                        <div>
                            <label>Stock</label>
                            <input type="number" {...register(`variants.${index}.amount` as const)} />
                        </div>
                        <div>
                            <label>Costo ($)</label>
                            <input type="number" step="0.01" {...register(`variants.${index}.priceCost` as const)} />
                        </div>
                        <div>
                            <label>Venta ($)</label>
                            <input type="number" step="0.01" {...register(`variants.${index}.priceSell` as const)} />
                        </div>
                        <div>
                            <button type="button" onClick={() => remove(index)} disabled={fields.length === 1}>
                                Eliminar variante
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        {/* BOTON FINAL */}
        <button
        type="submit"
        disabled={loading}
        >
            <span>
                {loading ? "Cargando..." : "Crear producto"}
            </span>
        </button>
    </form>
    )
}

export default CreateProduct;