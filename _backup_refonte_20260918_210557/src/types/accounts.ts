/** Types partagés pour le système de comptes & providers. */
export type ProviderCategory = 'chat' | 'social' | 'dev' | 'productivity';

export interface ConnectedAccount {
  provider: string;
  account_id?: string | null;
  display_name?: string | null;
  email?: string | null;
  scopes: string[];
  connected_at?: string | null;
  expires_at?: string | null;
}

export interface AccountProvider {
  id: string;
  name: string;
  icon: string;
  category: ProviderCategory;
  color: string;
  doc_url: string;
  description: string;
  configured: boolean;
  client_id_present: boolean;
  connected: boolean;
  account?: ConnectedAccount | null;
}