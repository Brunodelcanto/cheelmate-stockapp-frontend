import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import type { Product, Color, CartItem, ColorVariant } from "../../types";

interface CreateSaleProps {
    onSaleCreated: () => void;
    refreshTrigger: number;
}

const CreateSale = ({ onSaleCreated, refreshTrigger }: CreateSaleProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [comment, setComment] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

        useEffect(() => {
        const fetchProducts = async () => {
            const res = await api.get(`/products`);
            setProducts(res.data.data.filter((p: Product) => p.isActive));
        };
        fetchProducts();
    }, [refreshTrigger]);

     const reset = () => {
        setCart([]);
        setComment("");
        setCustomerName("");
    };

        const addToCart = (product: Product, variant: ColorVariant) => {
        const existing = cart.find(item => item.variantId === variant._id);
        
        if (existing) {
            if (existing.quantity >= variant.amount) {
                setErrorMessage("Sin stock suficiente");
                setTimeout(() => setErrorMessage(""), 2000);
                return;
            }
            setCart(cart.map(item => 
                item.variantId === variant._id 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            ));
        } else {
            setCart([...cart, {
                productId: product._id,
                variantId: variant._id!,
                name: `${product.name} (${(variant.color as Color)?.name})`,
                quantity: 1,
                price: variant.priceSell,
                maxStock: variant.amount
            }]);
        }
    };

        const handleConfirmSale = async () => {
        if (cart.length === 0) return;
        try {
            const saleData = {
                items: cart.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity
                })),
                customerName,
                comment
            };
            await api.post(`/sales`, saleData);
            setSuccessMessage("Venta realizada con éxito");
            setTimeout(() => setSuccessMessage(""), 2000);
            reset();
            onSaleCreated();
        } catch (err) {
            console.error("Error realizando venta:", err);
            setErrorMessage("Error al realizar la venta");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

        const removeFromCart = (variantId: string) => {
        const existing = cart.find(item => item.variantId === variantId);
        if (!existing) return;

        if(existing.quantity > 1) {
            setCart(cart.map(item =>
                item.variantId === variantId
                ? {...item, quantity: item.quantity -1 }
                : item
            ))
        } else {
            setCart(cart.filter(item => item.variantId !== variantId));
        }
    }   

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div>

            {/* SECCIÓN IZQUIERDA: CATÁLOGO DE PRODUCTOS */}
            <div>
                <div>
                    <div>

                    </div>
                    <div>
                        <h2>Catálogo de Productos</h2>
                        <p>Selecciona los productos que deseas vender:</p>
                    </div>
                <div>
                    <span>
                        {products.length} Items
                    </span>
                </div>
                </div>

                {/* MENSAJES DE ESTADO */}
                <div>
                    {errorMessage && <div>{errorMessage}</div>}
                    {successMessage && <div>{successMessage}</div>}
                </div>

                {/* LISTADO DE PRODUCTOS */}
                <div>
                    {products.map(product => (
                        <div key={product._id}>
                            <p>
                                {product.name}
                            </p>
                            <div>
                                {product.variants.map(v => (
                                    <button
                                        key={v._id}
                                        onClick={() => addToCart(product, v)}
                                        disabled={v.amount <= 0}
                                        className={`${v.amount <= 0 ? "disabled" : ""}`}
                                    >
                                        <div>
                                            <span>{(v.color as Color)?.name}</span>
                                            <span className={`${v.amount < 5 ? "low-stock" : ""}`}>
                                                {v.amount}
                                            </span>
                                        </div>
                                        {/* PRECIO ESPECÍFICO DE LA VARIANTE */}
                                        <span className={`${v.amount <= 0 ? "disabled" : ""}`}>
                                            ${v.priceSell.toLocaleString()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECCIÓN DERECHA: RESUMEN DE VENTA */}
            <div>
                <div>
                    <div>
                        <div>
                            <h2>Resumen de venta</h2>
                        </div>

                        {cart.length > 0 && (
                            <button
                            onClick={reset}
                            >
                              Vaciar
                            </button>
                        )}
                    </div>

                    {/* CARRITO INTERACTIVO */}
                    <div>
                        {cart.length === 0 ? (
                            <div>
                                <p>Carrito Vacio</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.variantId}>
                                    <div>
                                        <p>{item.name}</p>
                                        <div>
                                            <div>
                                                <button
                                                    onClick={() => removeFromCart(item.variantId)}
                                                >
                                                    Eliminar
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                onClick={() => {
                                                    const prod = products.find(p => p._id === item.productId);
                                                    const variant = prod?.variants.find(v => v._id === item.variantId);
                                                    if(variant) addToCart(prod!, variant);
                                                }}
                                                >
                                                    Agregar
                                                </button>
                                            </div>
                                            <span>Unit: ${item.price}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <span>
                                            ${(item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* TOTAL Y CONFIRMACIÓN */}

                    <div>
                        <div>
                            <div>
                                <span>Total a cobrar</span>
                                <span>{cart.reduce((sum, i) => sum + i.quantity, 0)} artículos en total</span>
                            </div>
                            <p>${total.toLocaleString()}</p>
                        </div>

                        <input
                        type="text"
                        placeholder="NOMBRE EL CLIENTE..."
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        />

                        <textarea
                            placeholder="NOTAS DE LA VENTA..."
                            rows={2}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />

                        <div>
                            <button
                                onClick={handleConfirmSale}
                                disabled={cart.length === 0}
                            >
                                <span>Confirmar Venta</span>
                            </button>

                            {cart.length > 0 && (
                                <button
                                    onClick={reset}
                                >
                                    Cancelar operación
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateSale;