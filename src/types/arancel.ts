export interface Arancel {
  id: number;
  descripcion: string;
  precio: string;
  tipo: 'c' | 'p';
  created_user: number;
  update_user: number;
  deleted_user: number | null;
}
