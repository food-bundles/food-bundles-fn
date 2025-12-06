import createAxiosClient from '@/app/hooks/axiosClient';

export interface Invitation {
  id: string;
  email: string;
  role: 'ADMIN' | 'AGGREGATOR' | 'LOGISTICS';
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CreateInvitationData {
  email: string;
  role: 'ADMIN' | 'AGGREGATOR' | 'LOGISTICS';
}

export interface AcceptInvitationData {
  token: string;
  username: string;
  phone: string;
  password: string;
}

const axiosClient = createAxiosClient();

export const invitationService = {
  async createInvitation(data: CreateInvitationData): Promise<{ message: string; data: Invitation }> {
    const response = await axiosClient.post('/invites', data);
    return response.data;
  },

  async getInvitations(): Promise<{ message: string; data: Invitation[] }> {
    const response = await axiosClient.get('/invites');
    return response.data;
  },

  async getInvitationById(id: string): Promise<{ message: string; data: Invitation }> {
    const response = await axiosClient.get(`/invites/${id}`);
    return response.data;
  },

  async cancelInvitation(id: string): Promise<{ message: string }> {
    const response = await axiosClient.delete(`/invites/${id}`);
    return response.data;
  },

  async resendInvitation(id: string): Promise<{ message: string }> {
    const response = await axiosClient.post(`/invites/${id}/resend`);
    return response.data;
  },

  async acceptInvitation(data: AcceptInvitationData): Promise<{ message: string; data: any }> {
    const response = await axiosClient.post('/invites/accept', data);
    return response.data;
  }
};