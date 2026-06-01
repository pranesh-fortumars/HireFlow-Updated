"use client";

import React from 'react';
import { useHireFlowStore } from '@/lib/store';
import { GlassCard } from '@/components/glass-card';
import { 
  ShieldAlert, Clock, User, Activity, Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AuditLogsPage() {
  const { auditLogs } = useHireFlowStore();
  const [search, setSearch] = React.useState('');

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.entityType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-headline font-bold flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-indigo-400" /> System Audit Logs
        </h2>
        <p className="text-muted-foreground mt-2">Track all critical actions and changes within the HireFlow platform.</p>
      </div>

      <GlassCard noHover className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search by user, action, or entity..." 
            className="pl-11 bg-white/5 border-white/10 w-full h-12 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </GlassCard>

      <GlassCard noHover className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Timestamp</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">User</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Action</th>
                <th className="p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">Entity</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-indigo-300">
                        <Clock className="w-4 h-4 opacity-50" />
                        <span>{log.date}</span>
                        <span className="text-muted-foreground">{log.time}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
                          {log.user.charAt(0)}
                        </div>
                        {log.user}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {log.action}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-white/5 border-white/10 text-xs">
                        {log.entityType} ({log.entityId.slice(0, 8)}...)
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No audit logs found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
