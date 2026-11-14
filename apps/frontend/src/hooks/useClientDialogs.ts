import { useState } from "react";
import { getErrorMessage } from "../api/axios";
import type { Client, ClientFormValues } from "../types/client.types";

interface ClientMutations {
  saveClient: (values: ClientFormValues, id?: string) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
}

/**
 * State of the dialogs of the clients page: create/edit form
 * and delete confirmation. If the API answers with an error, the dialog stays open
 * and shows the server `message` (for example 409 if the RUT already exists).
 */
export function useClientDialogs({ saveClient, removeClient }: ClientMutations) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openForm = (client: Client | null) => {
    setEditing(client);
    setError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setError(null);
  };

  const submitForm = async (values: ClientFormValues) => {
    setError(null);
    try {
      await saveClient(values, editing?.id);
      closeForm();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo guardar el cliente."));
    }
  };

  const askDelete = (client: Client) => {
    setError(null);
    setDeleting(client);
  };

  const cancelDelete = () => {
    setDeleting(null);
    setError(null);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setError(null);
    try {
      await removeClient(deleting.id);
      setDeleting(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo eliminar el cliente."));
    }
  };

  return {
    form: { open: formOpen, client: editing, openNew: () => openForm(null), openEdit: openForm, close: closeForm, submit: submitForm },
    remove: { client: deleting, ask: askDelete, cancel: cancelDelete, confirm: confirmDelete },
    error,
  };
}
