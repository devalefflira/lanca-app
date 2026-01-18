import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ImportExcel({ open, onOpenChange, onImport, isLoading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      readExcel(selectedFile);
    }
  };

  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setPreview(data.slice(0, 3)); // Mostra as 3 primeiras linhas como prévia
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirm = () => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Envia para o componente pai processar
        onImport(data);
        setFile(null);
        setPreview([]);
      } catch (error) {
        toast.error("Erro ao ler o arquivo Excel.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Importar Contas via Excel</DialogTitle>
          <DialogDescription>
            Selecione um arquivo .xlsx ou .csv para importar contas em massa.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-slate-400" />
                <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Clique para enviar</span></p>
                <p className="text-xs text-slate-500">XLSX ou CSV</p>
              </div>
              <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
                <span className="text-sm font-medium truncate">{file.name}</span>
                <Button variant="ghost" size="sm" className="ml-auto h-8 text-blue-700 hover:bg-blue-100" onClick={() => setFile(null)}>
                  Trocar
                </Button>
              </div>

              {preview.length > 0 && (
                <div className="bg-slate-50 p-3 rounded border text-xs space-y-1">
                  <p className="font-bold text-slate-500 mb-2">Prévia dos dados:</p>
                  {preview.map((row, i) => (
                    <div key={i} className="truncate text-slate-600">
                      {JSON.stringify(row)}
                    </div>
                  ))}
                  <p className="text-slate-400 italic mt-1">... e mais itens.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!file || isLoading} className="bg-green-600 hover:bg-green-700 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Confirmar Importação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}