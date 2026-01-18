import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy');
  } catch (e) {
    return dateString;
  }
};

// --- FUNÇÃO ADICIONADA PARA CORRIGIR O ERRO ---
export const getDayOfWeek = (dateString) => {
  if (!dateString) return '';
  try {
    const day = format(parseISO(dateString), 'EEEE', { locale: ptBR });
    return day.charAt(0).toUpperCase() + day.slice(1);
  } catch (e) {
    return '';
  }
};
// ---------------------------------------------

export const getDayOfWeekShort = (dateString) => {
  if (!dateString) return '';
  try {
    const day = format(parseISO(dateString), 'eee', { locale: ptBR });
    return day.charAt(0).toUpperCase() + day.slice(1);
  } catch (e) {
    return '';
  }
};

export const formatCpfCnpj = (value) => {
  if (!value) return '';
  const v = value.replace(/\D/g, '');
  if (v.length <= 11) {
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4");
  }
  return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "$1.$2.$3/$4-$5");
};

export const parseCpfCnpj = (value) => {
    if (!value) return '';
    return value.replace(/\D/g, '');
};