import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import type { Category, Product } from "../../types";
import { useNavigate } from "react-router-dom";

interface InventoryCardsProps {
    refreshTrigger: number;
 }

 const InventoryCards = ({ refreshTrigger }: InventoryCardsProps) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            const response = await api.get(`/products`);
            setProducts(response.data.data);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [refreshTrigger]);

    const filteredProducts = products.filter(product =>{
    const term = searchTerm.toLowerCase();

    const categoryName = typeof product.category === 'object' && product.category !== null
        ? (product.category as Category).name.toLowerCase()
        : '';

    const productName = product.name.toLowerCase();

    return productName.includes(term) || categoryName.includes(term);
   });

    const groupedProducts = filteredProducts.reduce((acc: Record<string, Product[]>, product) => {
    const categoryName = 
        typeof product.category === 'object' && product.category !== null
            ? (product.category as Category).name 
            : 'Sin Categoría';
    
    if (!acc[categoryName]) {
        acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
}, {});

       const handleQuantityChange = async (productId: string, color: string, quantity: number) => {
       try {
        const response = await api.patch(`/products/update-stock/${productId}`, {
            color,
            quantity
        });

        if (!response.data.error) {
            setProducts(prev => prev.map(p => p._id === productId ? response.data.data : p));
        }
       } catch (err) {
        console.error("Error actualizando stock:", err);
       }
   }

   const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
        const endpoint = isActive ? "deactivate" : "activate";

        const response = await api.patch(`/products/${endpoint}/${productId}`);

        if (!response.data.error) {
            setProducts(prev => prev.map(p =>
                p._id === productId ? { ...p, isActive: !isActive} : p
            ))
        }
    } catch (err) {
        console.error("Error al cambiar el estado del producto:", err);
        alert("Error al cambiar el estado del producto");
    }
   }

   const eliminateProduct = async (productId: string) => {
    try {
        const response = await api.delete(`/products/${productId}`);

        if (!response.data.error) {
            setProducts(prev => prev.filter(p => p._id !== productId));
        }
    } catch (err) {
        console.error("Error al eliminar el producto:", err);
        alert("Error al eliminar el producto");
    }
   }

   if (loading) return (
    <div>
        <p>Cargando productos...</p>
    </div>
   )

    return (
        <div>
            
            {/* BUSCADOR */}
            <div>
                <label>Filtrar por nombre o categoría</label>
                <div>
                    <input 
                    type="text" 
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* CONTENEDOR DE CATEGORÍAS */}
            <div>
                {Object.keys(groupedProducts).map((categoryName) => (
                    <div key={categoryName}>
                        <div>
                            <h2>{categoryName}</h2>
                        </div>

                        <div>
                            {groupedProducts[categoryName].map((product) => {
                            const totalStock = product.variants.reduce((sum, v) => sum + v.amount, 0);
                            const outOfStock = totalStock === 0;
                            const lowStock = totalStock > 0 && totalStock <= 5;

                            const prices = product.variants.map(v => v.priceSell);
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            const priceDisplay = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;

                            return (
                                <div
                                key={product._id}
                                onClick={() => navigate(`/edit-product/${product._id}`)}
                                className={`product-card ${outOfStock ? "out-of-stock" : lowStock ? "low-stock" : ""}`}
                                >
                                
                                {/* BADGES DE ESTADO */}
                                <div>
                                    {outOfStock && (
                                        <div>
                                            Agotado
                                        </div>
                                    )}
                                    {lowStock && !outOfStock && (
                                        <div>
                                            Reponer
                                        </div>
                                    )}
                                </div>

                                {/* IMAGEN E INFO PRINCIPAL */}
                                <div>
                                    <div>
                                        {product.image?.url ? (
                                            <img src={product.image.url} alt={product.name} />
                                        ) : (
                                            <div>
                                                Sin imagen
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3>{product.name}</h3>
                                        <p>{priceDisplay}</p>
                                    </div>
                                </div>

                                {/* LISTADO DE VARIANTES */}
                                <div>
                                    {product.variants.map((v, idx) => {
                                        const colorName = typeof v.color === 'object' && v.color !== null ? v.color.name : 'Color...';
                                        const colorId = typeof v.color === 'object' && v.color !== null ? v.color._id : v.color;

                                        return (
                                            <div key={idx}>
                                                <div>
                                                    <span>{colorName}</span>
                                                    {/* PRECIO ESPECIFICO POR COLOR */}
                                                    <span>${v.priceSell.toLocaleString()}</span>
                                                </div>

                                                <div>
                                                    <span className={`${v.amount < 3 ? "low-stock" : ""}`}>{v.amount} u.</span>
                                                    <div>
                                                        <button
                                                            onClick={(e) => {e.stopPropagation(); handleQuantityChange(product._id, colorId, -1)}}
                                                            disabled={v.amount <= 0 || !product.isActive}
                                                        >
                                                            -
                                                        </button>
                                                        <button
                                                            onClick={(e) => {e.stopPropagation(); handleQuantityChange(product._id, colorId, 1)}}
                                                            disabled={!product.isActive}
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            {/* FOOTER DE CARD CON ACCIONES */}
                             <div>
                                <div>
                                    <span>{product.isActive ? 'Activo' : 'Pausado'}</span>
                                </div>
                            <div>
                                <button
                                onClick={(e) => {e.stopPropagation(); handleToggleActive(product._id, product.isActive)}}
                                title={product.isActive ? "Desactivar" : "Activar"}
                                >
                                    {product.isActive ? "Pausar" : "Activar"}
                                </button>
                                <button
                                onClick={(e) => {e.stopPropagation(); setShowModal(product._id)}}
                                title="Eliminar"
                                >
                                    Eliminar
                                </button>
                                </div>
                            </div>
                                </div>
                            )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL DE ELIMINACION */}
            {showModal && (
                <div>
                    <div>
                        <div>
                            Alert
                        </div>
                        <h3>¿Eliminar producto?</h3>
                        <p>Esta acción no se puede deshacer.</p>
                        <div>
                            <button
                                onClick={() => {eliminateProduct(showModal); setShowModal(null); }}
                            >
                                Sí, eliminar
                            </button>
                            <button
                                onClick={() => setShowModal(null)}
                            >
                                No, cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
 }

 export default InventoryCards;