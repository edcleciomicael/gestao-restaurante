import { initialData, AppDatabase } from './initialData';
import { Usuario, Categoria, Produto, Mesa, Cliente, Pedido, Pagamento, MovimentacaoFinanceira } from '../types';

const STORAGE_KEY = 'restaurante_manager_db_v1';

export function loadDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDatabase(initialData);
      return initialData;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error('Error loading database:', e);
    return initialData;
  }
}

export function saveDatabase(data: AppDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving database:', e);
  }
}

export function resetDatabase(): AppDatabase {
  localStorage.removeItem(STORAGE_KEY);
  saveDatabase(initialData);
  return initialData;
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

export function formatarDataHora(dataStr?: string | null): string {
  if (!dataStr) return '-';
  try {
    const d = new Date(dataStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dataStr;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dataStr;
  }
}
