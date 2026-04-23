import { useEffect, useState } from "react";
import type { Sale } from "../../types";
import api from "../../api/axiosConfig";

interface SalesListProps {
    refreshTrigger: number;
}

const SalesList = ({ refreshTrigger }: SalesListProps) => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [totals, setTotals] = useState({ count: 0, revenue: 0, profit: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    const fetchSales = async () => {
    try {
        setLoading(true);
        let endpoint = `/sales?t=${Date.now()}`;
        if (startDate && endDate) {
            endpoint += `&startDate=${startDate}&endDate=${endDate}`;
        }
        const res = await api.get(endpoint);

        setSales(res.data.data);
        setTotals({ 
            count: res.data.count, 
            revenue: res.data.totalRevenue, 
            profit: res.data.totalProfit 
        });
    } catch (err) {
        console.error("Error al traer ventas:", err);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchSales();
    }, [refreshTrigger, startDate, endDate]);
    
    const filteredSales = sales.filter((sale) => {
        const term = searchTerm.toLowerCase();
        const matchesComment = sale.comment?.toLowerCase().includes(term);
        const matchesCustomer = sale.customerName.toLowerCase().includes(term);
        const matchesProduct = sale.items.some((item) =>
            item.name.toLowerCase().includes(term)
        );
        return matchesComment || matchesCustomer || matchesProduct;
    });

    if (loading) return (
        <div>Cargando ventas...</div>
    )

    return (
        <div>

            {/* HEADER DE MÉTRICAS */}
            <div>
                {/* Card ventas */}
                <div>
                    <div>
                        <h2>Total ventas</h2>
                        <p>{totals.count}</p>
                    </div>
                    <div>
                        <div></div>
                    </div>
                </div>

                {/* Card Ingresos */}
                <div>
                    <div>
                        <h2>Ingresos totales</h2>
                        <p>${totals.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                        <div></div>
                    </div>
                </div>

                {/* Card Ganancia */}
                <div>
                    <div>
                        <h2>Ganancia estimada</h2>
                        <p>${totals.profit.toLocaleString()}</p>
                    </div>
                    <div>
                        <div></div>
                    </div>
                </div>
            </div>

            {/* FILTROS Y BÚSQUEDA */}
            <div>
                <div>
                    <h3>Panel de filtros</h3>
                </div>

                <div>
                    <div>
                        <label>Búsqueda rapida</label>
                        <div>
                            <input 
                            type="text" 
                            placeholder="Buscar producto o nota..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label>Fecha inicial</label>
                        <div>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label>Fecha final</label>
                        <div>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLA DE VENTAS */}
                <div>
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Artículos vendidos</th>
                                    <th>Notas</th>
                                    <th>Monto final</th>
                                </tr>
                            </thead>
                            <tbody>
                        {filteredSales.map((sale) => (
                            <tr key={sale._id}>
                                <td>
                                    <span>
                                        {new Date(sale.createdAt).toLocaleString()}
                                    </span>
                                </td>
                                <td>
                                    <span>{sale.customerName || "Consumidor final"}</span>
                                </td>
                                <td>
                                    <div>
                                        {sale.items.map((item, idx) => (
                                            <div key={idx}>
                                                {/* Nombre del producto y cantidad */}
                                                <div>
                                                    {item.name}
                                                    <span>x{item.quantity}</span>
                                                </div>
                                                {/* Precio individual por artículo */}
                                                <div>
                                                    <span>
                                                        Unitario: <span>${item.priceAtSale.toLocaleString()}</span>
                                                    </span>
                                                    <span>|</span>
                                                    <span>
                                                        Subtotal: <span>${(item.priceAtSale * item.quantity).toLocaleString()}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td>
                            {sale.comment ? (
                                <div>
                                    <p>
                                        {sale.comment}
                                    </p>
                                    <button
                                        onClick={() => setSelectedSale(sale)}
                                    >
                                        Ver detalles
                                    </button>
                                </div>
                            ):(
                                <span>— Sin notas —</span>
                            )}
                        </td>
                                <td>
                                    <div>
                                        <span>Monto final</span>
                                        <span>
                                            ${sale.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredSales.length === 0 && (
                        <div>
                            <p>No hay ventas para mostrar.</p>
                        </div>
                    )}
                </div>

                {/* MODAL DE DETALLE DE VENTA */}
            {selectedSale && (
                <div>
                    <div>
                        {/* Decoración superior */}

                        <button
                            onClick={() => setSelectedSale(null)}
                        >
                            Cerrar
                        </button>

                        <div>
                            <div>
                                <div></div>
                            </div>
                            <div>
                                <h3>Detalle de venta</h3>
                                <p>{new Date(selectedSale.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <div>
                            <div>
                                <h4>Comentario de la venta</h4>
                                <p>
                                    "{selectedSale.comment}"
                                </p>
                            </div>

                            <div>
                                <h4>Resumen de artículos</h4>
                                <div>
                                    {selectedSale.items.map((item, idx) => (
                                        <div key={idx}>
                                            <span>{item.name}<span>x{item.quantity}</span></span>
                                            <span>${(item.priceAtSale * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <span>Total cobrado</span>
                                <span>${selectedSale.totalAmount.toLocaleString()}</span>
                            </div>

                            <button
                                onClick={() => setSelectedSale(null)}
                            >
                                Cerrar detalle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SalesList;