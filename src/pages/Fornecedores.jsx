import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import CrudModal from '@/components/shared/CrudModal';
import DeleteConfirmDialog from '@/components/shared/DeleteConfirmDialog';
import { formatCpfCnpj, parseCpfCnpj } from '@/components/shared/formatters';

const initialFormState = {
  nome_razao: '',
  cpf_cnpj: ''
};

export default function Fornecedores() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const queryClient = useQueryClient();

  const { data: fornecedores = [], isLoading } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list('nome_razao'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Fornecedor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      toast.success('Fornecedor cadastrado com sucesso!');
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Fornecedor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      toast.success('Fornecedor atualizado com sucesso!');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Fornecedor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      toast.success('Fornecedor excluído com sucesso!');
      setDeleteOpen(false);
      setEditingItem(null);
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setForm(initialFormState);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      nome_razao: item.nome_razao || '',
      cpf_cnpj: item.cpf_cnpj || ''
    });
    setModalOpen(true);
  };

  const handleDelete = (item) => {
    setEditingItem(item);
    setDeleteOpen(true);
  };

  const handleSave = () => {
    if (!form.nome_razao.trim()) {
      toast.error('Nome/Razão Social é obrigatório');
      return;
    }

    const data = {
      ...form,
      cpf_cnpj: parseCpfCnpj(form.cpf_cnpj)
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCpfCnpjChange = (value) => {
    const formatted = formatCpfCnpj(value);
    setForm({ ...form, cpf_cnpj: formatted });
  };

  const columns = [
    { header: 'Nome/Razão Social', accessor: 'nome_razao' },
    {
      header: 'CPF/CNPJ',
      accessor: 'cpf_cnpj',
      render: (row) => formatCpfCnpj(row.cpf_cnpj) || '-'
    }
  ];

  return (
    <div>
      <PageHeader
        title="Fornecedores"
        subtitle="Gerencie os fornecedores cadastrados"
        onAdd={() => setModalOpen(true)}
        addLabel="Novo Fornecedor"
      />

      <DataTable
        columns={columns}
        data={fornecedores}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="Nenhum fornecedor cadastrado"
      />

      <CrudModal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome_razao">Nome/Razão Social *</Label>
            <Input
              id="nome_razao"
              value={form.nome_razao}
              onChange={(e) => setForm({ ...form, nome_razao: e.target.value })}
              placeholder="Digite o nome ou razão social"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input
              id="cpf_cnpj"
              value={form.cpf_cnpj}
              onChange={(e) => handleCpfCnpjChange(e.target.value)}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              className="mt-1"
              maxLength={18}
            />
          </div>
        </div>
      </CrudModal>

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(editingItem?.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}