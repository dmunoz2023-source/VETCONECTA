import { useState } from "react";
import { Search, Plus, SquarePen, X, ChevronLeft, ChevronRight } from "lucide-react";
import "./ClientsPage.css";

interface Client {
  id: string;
  nombre: string;
  rut: string;
  telefono: string;
  correo: string;
  mascotas: number;
}

const CLIENTS: Client[] = [
  { id: "1", nombre: "María González", rut: "17.456.932-1", telefono: "+56 9 8765 4321", correo: "mgonzalez@gmail.com", mascotas: 2 },
  { id: "2", nombre: "Carlos Muñoz", rut: "12.891.445-3", telefono: "+56 9 6234 8871", correo: "cmunoz@outlook.com", mascotas: 5 },
  { id: "3", nombre: "Javiera Soto", rut: "19.234.567-8", telefono: "+56 9 7412 5590", correo: "jsoto@hotmail.com", mascotas: 1 },
  { id: "4", nombre: "Andrés Reyes", rut: "15.678.321-K", telefono: "+56 9 5123 9087", correo: "areyes@gmail.com", mascotas: 3 },
  { id: "5", nombre: "Camila Figueroa", rut: "20.112.889-2", telefono: "+56 9 9301 2244", correo: "cfigueroa@icloud.com", mascotas: 4 },
  { id: "6", nombre: "Roberto Espinoza", rut: "11.345.670-5", telefono: "+56 9 8210 6653", correo: "respinoza@yahoo.com", mascotas: 7 },
  { id: "7", nombre: "Valentina Pérez", rut: "18.903.214-0", telefono: "+56 9 4578 3312", correo: "vperez@gmail.com", mascotas: 1 },
  { id: "8", nombre: "Fernando Kramer", rut: "14.221.098-7", telefono: "+56 9 3390 1187", correo: "fkramer@gmail.com", mascotas: 1 },
  { id: "9", nombre: "Valentina Pérez", rut: "18.903.214-0", telefono: "+56 9 4578 3312", correo: "vperez@gmail.com", mascotas: 1 },
];

const PAGE_SIZE = 8;
const TOTAL_CLIENTS_MOCK = 125;

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const filtered = CLIENTS.filter((c) =>
    [c.nombre, c.rut, c.telefono].some((v) =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setModalOpen(true);
  };

  return (
    <div className="vc-dashboard">
      <div className="vc-dash-header">
        <div>
          <h1>Panel de Clientes</h1>
          <p>Gestiona y administra la información de los dueños de mascotas.</p>
        </div>
        <div className="vc-dash-actions">
          <div className="vc-clients-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar clientes, rut, teléfono..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <button className="vc-btn primary" onClick={openNew}>
            <Plus size={16} /> Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="vc-card">
        <div className="vc-table-wrap">
          <table className="vc-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Teléfono</th>
                <th>Correo Electrónico</th>
                <th>Mascotas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((c) => (
                <tr key={c.id}>
                  <td className="vc-pet-name">{c.nombre}</td>
                  <td>{c.rut}</td>
                  <td>{c.telefono}</td>
                  <td>{c.correo}</td>
                  <td>
                    <span className="vc-badge vc-badge-count">{c.mascotas}</span>
                  </td>
                  <td>
                    <button
                      className="vc-icon-btn"
                      onClick={() => openEdit(c)}
                      aria-label={`Editar a ${c.nombre}`}
                    >
                      <SquarePen size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="vc-empty-row">
                    No se encontraron clientes para "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="vc-pagination">
          <span>
            Mostrados {filtered.length === 0 ? 0 : pageStart + 1}-
            {Math.min(pageStart + PAGE_SIZE, filtered.length)} de{" "}
            {search ? filtered.length : TOTAL_CLIENTS_MOCK} clientes
          </span>
          <div className="vc-pagination-controls">
            <button
              className="vc-icon-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`vc-page-btn ${p === currentPage ? "active" : ""}`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="vc-icon-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <ClientFormModal
          client={editing}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

function ClientFormModal({
  client,
  onClose,
}: {
  client: Client | null;
  onClose: () => void;
}) {
  return (
    <div className="vc-modal-overlay" onClick={onClose}>
      <div className="vc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vc-modal-header">
          <h2>{client ? "Editar Cliente" : "Nuevo Cliente"}</h2>
          <button className="vc-icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <form
          className="vc-modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          <label>
            Nombre completo
            <input type="text" defaultValue={client?.nombre} placeholder="María González" required />
          </label>
          <label>
            RUT
            <input type="text" defaultValue={client?.rut} placeholder="17.456.932-1" required />
          </label>
          <label>
            Teléfono
            <input type="tel" defaultValue={client?.telefono} placeholder="+56 9 8765 4321" required />
          </label>
          <label>
            Correo electrónico
            <input type="email" defaultValue={client?.correo} placeholder="correo@ejemplo.com" required />
          </label>
          <div className="vc-modal-actions">
            <button type="button" className="vc-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="vc-btn primary">
              {client ? "Guardar cambios" : "Registrar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}