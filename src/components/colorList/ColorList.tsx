import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import type { Color } from "../../types";

interface ColorListProps {
    refreshTrigger: number
}

const ColorList = ({ refreshTrigger }: ColorListProps) => {
    const navigate = useNavigate();
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

       const fetchColors = async () => {
        try {
            const response = await api.get(`/colors`);
            setColors(response.data.data);
        } catch (err) {
            console.error("Error fetching colors:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchColors();
    }, [refreshTrigger]);

     const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const endpoint = isActive ? "deactivate" : "activate";
            await api.patch(`/colors/${id}/${endpoint}`);
            setColors(prev => prev.map(c => c._id === id ? { ...c, isActive: !isActive } : c));
            setSuccessMessage(isActive ? "Color desactivado correctamente" : "Color activado correctamente");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
             console.error("Error cambiando el estado del color:", err);
            setErrorMessage("No se puede desactivar este color porque está asociado a un producto");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/colors/${id}`);
            setColors(prev => prev.filter(c => c._id !== id));
            setSuccessMessage("Color eliminado correctamente");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
            console.error("Error deleting color:", err);
            setErrorMessage("No se puede eliminar este color porque está asociado a un producto");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const filteredColors = colors.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div>
            <p>Cargando...</p>
        </div>
    )

    return (
        <section>

        {/* HEADER DE SECCIÓN */}
        <div>
            <div>
                <h1>Lista de Colores</h1>
                <p>Gestión de colores • Inventario</p>
            </div>

            <div>
                <input
                    type="text"
                    placeholder="Filtrar colores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* MENSAJES DE ESTADO */}
        {successMessage && (
            <div className="alert alert-success" role="alert">
                {successMessage}
            </div>
        )}
        {errorMessage && (
            <div className="alert alert-danger" role="alert">
                {errorMessage}
            </div>
        )}

        <div>
            {filteredColors.map(color => (
                <div
                  key={color._id}
                  onClick={() => navigate(`/edit-color/${color._id}`)}
                >
                
                {/* MUESTRA CIRCULAR */}
                <div
                    style={{
                        backgroundColor: color.hex,
                        boxShadow: `0 20px 25px -5px ${color.hex + '30'}` 
                    }}
                >
                </div>
                <h3>{color.name}</h3>
                <p>{color.hex}</p>

                {/* INDICADOR DE ESTADO */}
                <div>
                    <div>{color.isActive ? "Activo" : "Pausado"}</div>
                </div>

                {/* ACCIONES */}
                <div>
                    <button
                    onClick={(e) => {e.stopPropagation(); handleToggleActive(color._id, color.isActive || false)}}

                    >
                    {color.isActive ? "Pausar" : "Activar"}
                    </button>

                    <button
                        onClick={(e) => {e.stopPropagation(); setShowModal(color._id)}}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
            ))}
        </div>

        {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
        {showModal && (
            <div>
                <div>
                    <h3>¿Eliminar color?</h3>
                    <p>Si este color está en uso, la operación sera rechazada automaticamente.</p>
                    <div>
                        <button
                            onClick={() => { handleDelete(showModal); setShowModal(null); }}
                        >
                            Confirmar
                        </button>
                        <button
                            onClick={() => setShowModal(null)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        )}
    </section>
    )
}

export default ColorList;