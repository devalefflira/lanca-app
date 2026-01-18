import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, icon: Icon, iconClassName }) {
  return (
    <Card className="p-6 border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 bg-white group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", iconClassName)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}