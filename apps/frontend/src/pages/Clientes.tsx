import { useEffect, useState } from 'react';
import axios from 'axios';

interface Cliente {
    id: string;
    rut: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
}

export default function Clientes() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarClientes = async () => {
            try {
                // Recuperamos el token que guardaste en el login
                const token = localStorage.getItem('jwt_token');
                
                // Petición al API Gateway que enruta al clients-pets-service
                const response = await axios.get('/v1/clients', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                // Dependiendo de cómo armaron la paginación en el backend, los datos vienen en .data o .data.data
                setClientes(response.data.data || response.data);
            } catch (error) {
                console.error("Error conectando con el backend:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarClientes();
    }, []);

    return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
            <h2 style={{ color: '#8b5cf6' }}>Directorio de Clientes (Vista Temporal)</h2>
            <p>Conectado al clients-pets-service mediante Axios.</p>
            
            {loading ? (
                <p>Cargando datos del servidor...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                            <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>RUT</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Nombre Completo</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Email</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Teléfono</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '10px', textAlign: 'center' }}>
                                    No hay clientes registrados en la base de datos.
                                </td>
                            </tr>
                        ) : (
                            clientes.map(cliente => (
                                <tr key={cliente.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '10px' }}>{cliente.rut}</td>
                                    <td style={{ padding: '10px' }}>{cliente.nombres} {cliente.apellidos}</td>
                                    <td style={{ padding: '10px' }}>{cliente.email}</td>
                                    <td style={{ padding: '10px' }}>{cliente.telefono}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}