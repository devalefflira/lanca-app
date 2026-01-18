import React from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from 'date-fns';

export default function ExportExcel({ contas, isLoading }) {
  const handleExport = () => {
    if (!contas || contas.length === 0) return;

    // Formata os dados para exportação (Flattening)
    const dataToExport = contas.map(c => ({
      'Dia': c.data_competencia,
      'Vencimento': c.data_vencimento ? format(new Date(c.data_vencimento), 'dd/MM/yyyy') : '',
      'Fornecedor': c.nome_fornecedor,
      'Tipo de Documento': c.tipo_documento,
      'Número Documento': c.numero_documento,
      'Nota Fiscal': c.nota_fiscal,
      'Parcela': c.parcela,
      'Razão Social': c.razao,
      'Banco': c.banco,
      'Valor Original': c.valor_original,
      'Status': c.status,
      'Observação': c.observacao,
      'Tags': c.tags ? c.tags.join(', ') : ''
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contas a Pagar");
    XLSX.writeFile(wb, `Lanca_Export_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={isLoading || !contas.length} className="gap-2">
      <Download className="w-4 h-4" />
      Exportar
    </Button>
  );
}