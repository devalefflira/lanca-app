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

export default function Razoes() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ descricao: '' });
  const queryClient = useQueryClient();

  const { data: razoes = [], isLoading } = useQuery({
    queryKey: ['razoes'],
    queryFn: () => base44.entities.Razao.list('descricao'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Razao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['razoes'] });
      toast.success('Razão cadastrada com sucesso!');
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Razao.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['razoes'] });
      toast.success('Razão atualizada com sucesso!');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Razao.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['razoes'] });
      toast.success('Razão excluída com sucesso!');
      setDeleteOpen(false);
      setEditingItem(null);
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setForm({ descricao: '' });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({ descricao: item.descricao || '' });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.descricao.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const columns = [
    { header: 'Descrição', accessor: 'descricao' }
  ];

  return (
    <div>
      <PageHeader
        title="Razões"
        subtitle="Gerencie os centros de custo e entidades pagadoras"
        onAdd={() => setModalOpen(true)}
        addLabel="Nova Razão"
      />

      <DataTable
        columns={columns}
        data={razoes}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={(item) => { setEditingItem(item); setDeleteOpen(true); }}
        emptyMessage="Nenhuma razão cadastrada"
      />

      <CrudModal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar Razão' : 'Nova Razão'}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <div>
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            value={form.descricao}
            onChange={(e) => setForm({ descricao: e.target.value })}
            placeholder="Ex: Matriz, Filial SP"
            className="mt-1"
          />
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