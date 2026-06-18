/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, Webhook, Zap, Server } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans flex items-center justify-center p-8">
      <div className="max-w-3xl w-full bg-neutral-800 rounded-2xl shadow-2xl p-8 border border-neutral-700/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Server className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Orchestration Hub</h1>
            <p className="text-neutral-400">WhatsApp • Chatwoot • n8n</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatusCard 
            icon={<Webhook className="w-5 h-5 text-emerald-400" />}
            title="Chatwoot Webhook"
            value="Online"
            status="active"
          />
          <StatusCard 
            icon={<Activity className="w-5 h-5 text-blue-400" />}
            title="Meta API Webhook"
            value="Listening"
            status="active"
          />
          <StatusCard 
            icon={<Zap className="w-5 h-5 text-amber-400" />}
            title="n8n Integration"
            value="Configured"
            status="active"
          />
        </div>

        <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <h2 className="text-sm font-medium text-neutral-300 uppercase tracking-wider mb-4">
            System Configuration
          </h2>
          <div className="space-y-3 font-mono text-xs">
            <LogLine label="PORT" value="3000" />
            <LogLine label="ENVIRONMENT" value="docker / development" />
            <LogLine label="DATABASE" value="PostgreSQL Ready" />
            <LogLine label="META_GRAPH_VERSION" value="v19.0" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ icon, title, value, status }: { icon: React.ReactNode, title: string, value: string, status: 'active' | 'warning' }) {
  return (
    <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 flex items-center gap-4">
      <div className="p-2.5 bg-neutral-800 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-neutral-400 mb-1">{title}</p>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
          <span className="font-semibold text-white">{value}</span>
        </div>
      </div>
    </div>
  );
}

function LogLine({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-neutral-800/50 last:border-0">
      <span className="text-neutral-500">{label}</span>
      <span className="text-indigo-300">{value}</span>
    </div>
  );
}

