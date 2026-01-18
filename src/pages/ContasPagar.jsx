import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseISO, isWithinInterval, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Loader2, Upload, Download } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import ContaModal from '@/components/contas/ContaModal';
import ContaFilters from '@/components/contas/ContaFilters';
import ImportExcel from '@/components/contas/ImportExcel';
import ExportExcel from '@/components/contas/ExportExcel';
import { formatCurrency, formatDate, getDayOfWeekShort } from '@/components/shared/formatters';

const initialFilters = {
  dataInicio: '',
  dataFim: '',
  fornecedor: '',
  valorMin: '',
  valorMax: '',
  tipoDocumento: '',
  notaFiscal: '',
  numeroDocumento: ''
};

const ITEMS_PER_PAGE = 100;

export default function ContasPagar() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [userRole, setUserRole] = useState('user');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setUserRole(user?.role || 'user');
      } catch (e) {
        setUserRole('user');
      }
    };
    loadUser();
  }, []);

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas-pagar'],
    queryFn: () => base44.entities.ContaPagar.list('-data_vencimento', 500),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ContaPagar.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
      queryClient.invalidateQueries({ queryKey: ['contas-dashboard'] });
      toast.success('Conta cadastrada com sucesso!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContaPagar.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
      queryClient.invalidateQueries({ queryKey: ['contas-dashboard'] });
      toast.success('Conta atualizada com sucesso!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContaPagar.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
      queryClient.invalidateQueries({ queryKey: ['contas-dashboard'] });
      toast.success('Conta excluída com sucesso!');
      setDeleteOpen(false);
      setEditingItem(null);
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item) => {
    setEditingItem(item);
    setDeleteOpen(true);
  };

  const handleSave = async (formData, andNew) => {
    if (!formData.data_vencimento) {
      toast.error('Data de vencimento é obrigatória');
      return;
    }
    if (!formData.id_fornecedor) {
      toast.error('Fornecedor é obrigatório');
      return;
    }
    if (!formData.valor_original || formData.valor_original <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }

    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }

    if (!andNew) {
      closeModal();
    }
  };

  // Filter logic
  const filteredContas = contas.filter(conta => {
    if (filters.dataInicio || filters.dataFim) {
      const dataVenc = conta.data_vencimento ? parseISO(conta.data_vencimento) : null;
      if (dataVenc) {
        if (filters.dataInicio && dataVenc < parseISO(filters.dataInicio)) return false;
        if (filters.dataFim && dataVenc > parseISO(filters.dataFim)) return false;
      }
    }

    if (filters.fornecedor && conta.id_fornecedor !== filters.fornecedor) return false;
    if (filters.tipoDocumento && conta.id_tipo_documento !== filters.tipoDocumento) return false;

    if (filters.valorMin && conta.valor_original < filters.valorMin) return false;
    if (filters.valorMax && conta.valor_original > filters.valorMax) return false;

    if (filters.notaFiscal && !conta.nota_fiscal?.toLowerCase().includes(filters.notaFiscal.toLowerCase())) return false;
    if (filters.numeroDocumento && !conta.numero_documento?.toLowerCase().includes(filters.numeroDocumento.toLowerCase())) return false;

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredContas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedContas = filteredContas.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 9;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(1, currentPage - 4);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pago': return 'bg-green-100 text-green-700';
      case 'Pendente': return 'bg-amber-100 text-amber-700';
      case 'Cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contas a Pagar</h1>
          <p className="text-slate-500 mt-1">Gerencie todas as contas a pagar</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Importar Excel
          </Button>
          <ExportExcel contas={filteredContas} isLoading={isLoading} />
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      </div>

      <ContaFilters filters={filters} setFilters={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700">Dia</TableHead>
                  <TableHead className="font-semibold text-slate-700">Vencimento</TableHead>
                  <TableHead className="font-semibold text-slate-700">Fornecedor</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tipo</TableHead>
                  <TableHead className="font-semibold text-slate-700">Nº Doc</TableHead>
                  <TableHead className="font-semibold text-slate-700">NF</TableHead>
                  <TableHead className="font-semibold text-slate-700">Parcela</TableHead>
                  <TableHead className="font-semibold text-slate-700">Razão</TableHead>
                  <TableHead className="font-semibold text-slate-700">Banco</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Valor</TableHead>
                  <TableHead className="font-semibold text-slate-700">Tags</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-12 text-slate-400">
                      Nenhuma conta encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedContas.map((conta) => (
                    <TableRow key={conta.id} className="hover:bg-slate-50/50">
                      <TableCell className="capitalize">
                        {getDayOfWeekShort(conta.data_competencia || conta.data_vencimento)}
                      </TableCell>
                      <TableCell>{formatDate(conta.data_vencimento)}</TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {conta.nome_fornecedor || '-'}
                      </TableCell>
                      <TableCell>{conta.tipo_documento || '-'}</TableCell>
                      <TableCell>{conta.numero_documento || '-'}</TableCell>
                      <TableCell>{conta.nota_fiscal || '-'}</TableCell>
                      <TableCell>{conta.parcela || '-'}</TableCell>
                      <TableCell>{conta.razao || '-'}</TableCell>
                      <TableCell>{conta.banco || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(conta.status)}>
                          {conta.status || 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        {formatCurrency(conta.valor_original)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {conta.tags?.slice(0, 2).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {conta.tags?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{conta.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(conta)}
                            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {userRole === 'admin' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(conta)}
                              className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="text-xs"
          >
            Primeira
          </Button>
          
          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={`w-9 text-xs ${currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-xs"
          >
            Próxima
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="text-xs"
          >
            Última
          </Button>
        </div>
      )}

      {/* Summary */}
      {filteredContas.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-6 justify-between items-center">
          <div className="text-sm text-slate-500">
            Mostrando {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredContas.length)} de {filteredContas.length}
          </div>
          <div className="flex gap-6">
            <div>
              <span className="text-sm text-slate-500">Registros:</span>
              <span className="ml-2 font-semibold text-slate-700">{filteredContas.length}</span>
            </div>
            <div>
              <span className="text-sm text-slate-500">Total:</span>
              <span className="ml-2 font-semibold text-emerald-600">
                {formatCurrency(filteredContas.reduce((sum, c) => sum + (c.valor_original || 0), 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      <ContaModal
        open={modalOpen}
        onClose={closeModal}
        editingItem={editingItem}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(editingItem?.id)}
        isLoading={deleteMutation.isPending}
      />

      <ImportExcel
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </div>
  );
}