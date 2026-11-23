import { useState } from "react";
import { getErrorMessage } from "../api/axios";

interface CrudMutations<T, V, R> {
  /** Crea (sin `item`) o edita (con `item`). Si la API falla, la promesa se rechaza. */
  save: (values: V, item: T | null) => Promise<R>;
  remove: (item: T) => Promise<void>;
  /** Se llama con el resultado tras guardar (p. ej. para mostrar advertencias). */
  onSaved?: (result: R) => void;
  saveError: string;
  removeError: string;
}

/**
 * Estado de los diálogos de una lista editable: formulario de alta/edición y
 * confirmación de borrado. Si la API falla, el diálogo queda abierto con el
 * `message` del servidor (p. ej. 409 por turno solapado).
 */
export function useCrudDialogs<T, V, R = unknown>({ save, remove, onSaved, saveError, removeError }: CrudMutations<T, V, R>) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openForm = (item: T | null) => {
    setEditing(item);
    setError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setError(null);
  };

  const submit = async (values: V) => {
    setError(null);
    try {
      const result = await save(values, editing);
      closeForm();
      onSaved?.(result);
    } catch (err: unknown) {
      setError(getErrorMessage(err, saveError));
    }
  };

  const cancelDelete = () => {
    setDeleting(null);
    setError(null);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setError(null);
    try {
      await remove(deleting);
      setDeleting(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, removeError));
    }
  };

  return {
    form: { open: formOpen, item: editing, openNew: () => openForm(null), openEdit: openForm, close: closeForm, submit },
    remove: {
      item: deleting,
      ask: (item: T) => {
        setError(null);
        setDeleting(item);
      },
      cancel: cancelDelete,
      confirm: confirmDelete,
    },
    error,
  };
}
