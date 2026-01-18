import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { formatDate } from '@/components/shared/formatters';
import { Shield, User } from 'lucide-react';

export default function Usuarios() {
  const [userRole, setUserRole] = useState('user');

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

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list('full_name'),
    enabled: userRole === 'admin',
  });

  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Shield className="w-16 h-16 mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
        <p>Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  const columns = [
    { header: 'Nome', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Perfil',
      accessor: 'role',
      render: (row) => (
        <Badge
          variant="secondary"
          className={row.role === 'admin' 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-blue-100 text-blue-700'
          }
        >
          {row.role === 'admin' ? (
            <><Shield className="w-3 h-3 mr-1" /> Admin</>
          ) : (
            <><User className="w-3 h-3 mr-1" /> Padrão</>
          )}
        </Badge>
      )
    },
    {
      header: 'Cadastrado em',
      accessor: 'created_date',
      render: (row) => formatDate(row.created_date)
    }
  ];

  return (
    <div>
      <PageHeader
        title="Usuários"
        subtitle="Visualize os usuários do sistema"
      />

      <DataTable
        columns={columns}
        data={usuarios}
        isLoading={isLoading}
        showActions={false}
        emptyMessage="Nenhum usuário cadastrado"
      />
    </div>
  );
}