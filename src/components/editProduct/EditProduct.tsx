import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import api from "../../api/axiosConfig";
import Joi from "joi";
import type { ProductFormValues, Category, Color, ColorVariant } from "../../types/index";

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
            amount: Joi.number().min(0).required().messages({
                "any.required": "El color es obligatorio",
                "string.empty": "El color no puede estar vacío"
            }),
            priceCost: Joi.number().min(0).required().messages({
                "any.required": "El precio de costo es obligatorio",
                "number.base": "El precio de costo debe ser un número",
                "number.min": "El precio de costo no puede ser negativo"
            }),
            priceSell: Joi.number().min(0).required().messages({
                "any.required": "El precio de venta es obligatorio",
                "number.base": "El precio de venta debe ser un número",
                "number.min": "El precio de venta no puede ser negativo"
            })
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
        <div>
            <p>Cargando producto...</p>
        </div>
    )

    return (
        <form onSubmit={handleSubmit(onSubmit)}>

            {/* HEADER DE EDICION */}
            <div>
                <div>
                    <h2>Editar producto</h2>
                    <p>Gestión de Stock • Ché, el mate</p>
                </div>
            </div>

            {/* MENSAJES DE ESTADO */}
            {successMessage && <div><p>{successMessage}</p></div>}
            {errorMessage && <div><p>{errorMessage}</p></div>}

            {/* SECCION 1: DATOS GENERALES E IMAGEN */}
            <div>
                <div>
                    <div>
                        <label>Nombre del producto</label>
                        <input
                            {...register("name")}
                        />
                        {errors.name && <p>{errors.name.message}</p>}
                    </div>

                    <div>
                        <div>
                            <label>Categoría</label>
                            <select {...register("category")}>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Alerta stock</label>
                            <input type="number" {...register("minStockAlert")} />
                        </div>
                    </div>
                </div>

                {/* PREVIEW DE IMAGEN */}
                <div>
                    {!preview ? (
                        <label>
                            <span>Cambiar imagen</span>
                            <input type="file" {...register("image")} accept="image/*" 
                                onChange={(e) => {
                                    register("image").onChange(e);
                                    const file = e.target.files?.[0];
                                    if (file) setPreview(URL.createObjectURL(file))
                                }}
                            />
                        </label>
                    ): (
                        <div>
                            <img src={preview} alt="Preview" />
                            <button type="button" onClick={() => { setPreview(null); resetField("image"); }}>
                                Eliminar imagen
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* SECCION VARIANTES */}
            <div>
                <div>
                    <h3>
                        Variantes de Stock
                    </h3>
                    <button type="button" onClick={() => append({ color: "", amount: 0, priceCost: 0, priceSell: 0})}>
                        Nueva variante
                    </button>
                </div>

                <div>
                    {fields.map((field, index) => (
                        <div key={field.id}>
                            <div>
                                <label>Color</label>
                                <select {...register(`variants.${index}.color` as const)}>
                                    {colors.map(col => <option key={col._id} value={col._id}>{col.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label>Stock</label>
                                <input type="number" {...register(`variants.${index}.amount` as const)} />
                            </div>
                            <div>
                                <label>Venta ($)</label>
                                <input type="number" step="0.01" {...register(`variants.${index}.priceSell` as const)} />
                            </div>
                            <div>
                                <label>Costo ($)</label>
                                <input type="number" step="0.01" {...register(`variants.${index}.priceCost` as const)} />
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
            {/* ACCIONES FINALES */}
            <div>
                <button type="submit">
                    <span>Guardar cambios</span>
                </button>
                <button type="button" onClick={() => navigate("/products")}>
                    <span>Cancelar</span>
                </button>
            </div>
        </form>
    )
}

export default EditProduct;