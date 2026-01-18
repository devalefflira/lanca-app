import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus, Upload, Download, Trash2, Edit, CheckCircle, AlertCircle, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NovaContaModal from '@/components/contas/NovaContaModal';
import ImportExcel from '@/components/contas/ImportExcel';
import { formatCurrency, formatDate, getDayOfWeekShort } from '@/components/shared/formatters';

export default function ContasPagar() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingConta, setEditingConta] = useState(null);

  // --- ESTADO DOS FILTROS ---
  const [filters, setFilters] = useState({
    dataInicio: '',
    dataFim: '',
    busca: '',
    minValor: '',
    maxValor: ''
  });

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas-pagar'],
    queryFn: () => base44.entities.ContaPagar.list(),
  });

  // --- LÓGICA DE FILTRAGEM (Frontend) ---
  const contasFiltradas = contas.filter(conta => {
    // Filtro de Data
    const dataVenc = conta.data_vencimento?.split('T')[0];
    if (filters.dataInicio && dataVenc < filters.dataInicio) return false;
    if (filters.dataFim && dataVenc > filters.dataFim) return false;

    // Filtro de Valor
    if (filters.minValor && Number(conta.valor_original) < Number(filters.minValor)) return false;
    if (filters.maxValor && Number(conta.valor_original) > Number(filters.maxValor)) return false;

    // Filtro de Texto (Fornecedor, Doc ou NF)
    if (filters.busca) {
      const busca = filters.busca.toLowerCase();
      const fornecedor = conta.tb_fornecedores?.nome_razao?.toLowerCase() || '';
      const doc = conta.numero_documento?.toLowerCase() || '';
      const nf = conta.nota_fiscal?.toLowerCase() || '';
      if (!fornecedor.includes(busca) && !doc.includes(busca) && !nf.includes(busca)) return false;
    }

    return true;
  });

  // --- EXPORTAR ---
  const handleExport = () => {
    if (contasFiltradas.length === 0) return toast.warning("Sem dados para exportar.");
    const dadosFormatados = contasFiltradas.map(c => ({
      Vencimento: formatDate(c.data_vencimento),
      Fornecedor: c.tb_fornecedores?.nome_razao || 'N/A',
      Valor: c.valor_original,
      Status: c.status,
      Tipo: c.tb_tipos_documento?.descricao || '-',
      Banco: c.tb_bancos?.nome_banco || '-',
      Obs: c.observacao
    }));
    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contas");
    XLSX.writeFile(wb, "Contas_a_Pagar.xlsx");
  };

  // --- IMPORTAR ---
  const importMutation = useMutation({
    mutationFn: async (dadosExcel) => {
      const promises = dadosExcel.map(linha => base44.entities.ContaPagar.create({
           valor_original: linha['Valor'] || 0,
           observacao: `Importado: ${linha['Fornecedor'] || ''}`,
           status: 'Pendente'
      }));
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contas-pagar']);
      toast.success("Dados importados!");
      setIsImportOpen(false);
    }
  });

  // --- SALVAR/EDITAR ---
  const saveMutation = useMutation({
    mutationFn: (dados) => {
      if (editingConta) return base44.entities.ContaPagar.update(editingConta.id, dados);
      return base44.entities.ContaPagar.create(dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contas-pagar']);
      toast.success(editingConta ? 'Atualizado!' : 'Criado!');
      setIsModalOpen(false);
      setEditingConta(null);
    },
    onError: (e) => toast.error("Erro ao salvar: " + (e.message || "Verifique os dados."))
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, novoStatus }) => base44.entities.ContaPagar.update(id, { status: novoStatus }),
    onSuccess: () => queryClient.invalidateQueries(['contas-pagar'])
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContaPagar.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['contas-pagar'])
  });

  // Totais Visuais
  const totalRegistros = contasFiltradas.length;
  const valorTotal = contasFiltradas.reduce((acc, curr) => acc + (Number(curr.valor_original) || 0), 0);

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contas a Pagar</h1>
          <p className="text-slate-500">Gerencie todas as contas a pagar</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2" onClick={() => setIsImportOpen(true)}>
             <Upload className="w-4 h-4"/> Importar Excel
           </Button>
           <Button variant="outline" className="gap-2" onClick={handleExport}>
             <Download className="w-4 h-4"/> Exportar
           </Button>
           <Button onClick={() => { setEditingConta(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 gap-2">
             <Plus className="w-4 h-4"/> Nova Conta
           </Button>
        </div>
      </div>

      <NovaContaModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={(dados) => saveMutation.mutate(dados)}
        isLoading={saveMutation.isPending}
        contaParaEditar={editingConta}
      />

      <ImportExcel 
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={(dados) => importMutation.mutate(dados)}
        isLoading={importMutation.isPending}
      />

      {/* ÁREA DE FILTROS REINSERIDA AQUI */}
      <Card className="p-4 bg-white shadow-sm border-slate-200">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-full sm:w-auto flex gap-2">
            <div className="space-y-1">
                <span className="text-xs text-slate-500 ml-1">De</span>
                <Input type="date" value={filters.dataInicio} onChange={e => setFilters({...filters, dataInicio: e.target.value})} className="w-40" />
            </div>
            <div className="space-y-1">
                <span className="text-xs text-slate-500 ml-1">Até</span>
                <Input type="date" value={filters.dataFim} onChange={e => setFilters({...filters, dataFim: e.target.value})} className="w-40" />
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px] space-y-1">
            <span className="text-xs text-slate-500 ml-1">Buscar</span>
            <Input 
                placeholder="Fornecedor, NF ou Doc..." 
                value={filters.busca}
                onChange={e => setFilters({...filters, busca: e.target.value})}
            />
          </div>

          <div className="w-full sm:w-auto flex gap-2">
             <div className="space-y-1">
                <span className="text-xs text-slate-500 ml-1">Min R$</span>
                <Input type="number" placeholder="0,00" value={filters.minValor} onChange={e => setFilters({...filters, minValor: e.target.value})} className="w-24" />
             </div>
             <div className="space-y-1">
                <span className="text-xs text-slate-500 ml-1">Max R$</span>
                <Input type="number" placeholder="0,00" value={filters.maxValor} onChange={e => setFilters({...filters, maxValor: e.target.value})} className="w-24" />
             </div>
          </div>

          <Button variant="ghost" className="text-slate-500 gap-2" onClick={() => setFilters({dataInicio:'', dataFim:'', busca:'', minValor:'', maxValor:''})}>
            <X className="w-4 h-4" /> Limpar Filtros
          </Button>
        </div>
      </Card>

      {/* TABELA COM DADOS CONECTADOS */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Dia</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4">Fornecedor</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Nº Doc</th>
                <th className="py-3 px-4">NF</th>
                <th className="py-3 px-4">Parcela</th>
                <th className="py-3 px-4">Razão</th>
                <th className="py-3 px-4">Banco</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contasFiltradas.length === 0 && (
                <tr><td colSpan={12} className="py-8 text-center text-slate-500">Nenhum registro encontrado.</td></tr>
              )}
              {contasFiltradas.map((conta) => (
                <tr key={conta.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-3 px-4 font-medium text-slate-700">{getDayOfWeekShort(conta.data_vencimento)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatDate(conta.data_vencimento)}</td>
                  
                  {/* AQUI ESTÁ O SEGREDO: Usamos o objeto aninhado (join) */}
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {conta.tb_fornecedores?.nome_razao || conta.tb_fornecedores?.nome_fantasia || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {conta.tb_tipos_documento?.descricao || '-'}
                  </td>
                  
                  <td className="py-3 px-4 text-slate-500">{conta.numero_documento || '-'}</td>
                  <td className="py-3 px-4 text-slate-500">{conta.nota_fiscal || '-'}</td>
                  
                  <td className="py-3 px-4 text-slate-500">
                     {conta.tb_parcelas?.descricao || 'Única'}
                  </td>
                  
                  <td className="py-3 px-4 text-slate-600">
                     {conta.tb_razoes?.descricao || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                     {conta.tb_bancos?.nome_banco || '-'}
                  </td>

                  <td className="py-3 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer select-none flex w-fit items-center gap-1 ${conta.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {conta.status === 'Pago' ? <CheckCircle className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
                          {conta.status || 'Pendente'}
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({id: conta.id, novoStatus: 'Pendente'})}>Pendente</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({id: conta.id, novoStatus: 'Pago'})}>Pago</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-700">{formatCurrency(conta.valor_original)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => { setEditingConta(conta); setIsModalOpen(true); }}><Edit className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => { if(window.confirm('Excluir?')) deleteMutation.mutate(conta.id); }}><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-600">
            <div>Mostrando {contasFiltradas.length} registros</div>
            <div className="flex gap-4 font-semibold">
                <span>Total Filtrado: {formatCurrency(valorTotal)}</span>
            </div>
        </div>
      </Card>
    </div>
  );
}