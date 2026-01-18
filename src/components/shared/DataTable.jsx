import React from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2, Inbox } from "lucide-react";

export default function DataTable({ 
  columns, 
  data, 
  isLoading, 
  onEdit, 
  onDelete, 
  emptyMessage = "Nenhum registro encontrado",
  showActions = true 
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              {columns.map((col, idx) => (
                <TableHead key={idx} className="font-semibold text-slate-700 whitespace-nowrap">
                  {col.header}
                </TableHead>
              ))}
              {showActions && <TableHead className="font-semibold text-slate-700 text-right w-24">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActions ? 1 : 0)} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox className="w-10 h-10 mb-2 opacity-20" />
                    <p>{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow key={row.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} className="py-3">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {onEdit && (
                          <Button variant="ghost" size="icon" onClick={() => onEdit(row)} className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button variant="ghost" size="icon" onClick={() => onDelete(row)} className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}