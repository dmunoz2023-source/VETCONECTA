import api from './axios';
import type {
  Client,
  CreateClientPayload,
  ListClientsParams,
  Paginated,
  UpdateClientPayload,
} from '../types/client';

export const clientsApi = {
  async list(params: ListClientsParams): Promise<Paginated<Client>> {
    const { data } = await api.get<Paginated<Client>>('/v1/clients', {
      params: { ...params, q: params.q || undefined },
    });
    return data;
  },

  async getById(id: string): Promise<Client> {
    const { data } = await api.get<Client>(`/v1/clients/${id}`);
    return data;
  },

  async create(payload: CreateClientPayload): Promise<Client> {
    const { data } = await api.post<Client>('/v1/clients', payload);
    return data;
  },

  async update(id: string, payload: UpdateClientPayload): Promise<Client> {
    const { data } = await api.patch<Client>(`/v1/clients/${id}`, payload);
    return data;
  },
};