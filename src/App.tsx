/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, Webhook, Zap, Server, Plus, Settings, MessageSquare, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface Instance {
  id: number;
  name: string;
  phoneNumberId: string | null;
  status: string;
  webhookUrl: string | null;
}

export default function App() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      const res = await fetch('/instance/fetchInstances');
      const data = await res.json();
      setInstances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createInstance = async () => {
    const name = prompt("Enter a unique name for the new connection instance (e.g., arm-cloud-01):");
    if (!name) return;
    try {
      await fetch('/instance/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      fetchInstances();
    } catch(err) {
      alert("Error creating instance");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans p-8">
      <div className="max-w-5xl mx-auto w-full">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Orchestration Hub</h1>
              <p className="text-neutral-400">WhatsApp • Chatwoot • n8n</p>
            </div>
          </div>
        </header>

        <main>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Connections (Instances)</h2>
            <button 
              onClick={createInstance}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              New Connection
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {loading ? (
              <div className="col-span-full py-12 text-center text-neutral-500">Loading connections...</div>
            ) : instances.length === 0 ? (
              <div className="col-span-full py-12 text-center text-neutral-500 bg-neutral-800/50 rounded-2xl border border-neutral-800 border-dashed">
                No connections configured yet.
              </div>
            ) : (
              instances.map(inst => (
                <InstanceCard key={inst.id} instance={inst} />
              ))
            )}
          </div>
          
          <div className="bg-neutral-800/50 rounded-2xl p-6 border border-neutral-800">
            <h3 className="text-lg font-medium text-white mb-4">API Documentation Overview</h3>
            <div className="space-y-4 font-mono text-xs">
              <LogLine label="Send Text" value="POST /api/message/send/text/:instanceName" />
              <LogLine label="Send List" value="POST /api/message/send/list/:instanceName" />
              <LogLine label="Meta Webhook Setup" value="GET /webhooks/meta/:instanceName" />
              <LogLine label="Chatwoot Webhook Setup" value="POST /webhooks/chatwoot/:instanceName" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function InstanceCard({ instance }: { instance: Instance }) {
  return (
    <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700/50 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-700 rounded-lg">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{instance.name}</h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">ID: {instance.id}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${instance.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-700 text-neutral-400'}`}>
          {instance.status}
        </div>
      </div>

      <div className="space-y-2 mt-2">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-500">Phone ID</span>
          <span className="text-neutral-300 font-mono">{instance.phoneNumberId || 'Not Configured'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-neutral-500">Events Webhook</span>
          <span className="text-neutral-300 truncate max-w-[150px]">{instance.webhookUrl || 'Not Configured'}</span>
        </div>
      </div>

      <div className="mt-2 pt-4 border-t border-neutral-700/50 flex justify-between">
         <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
           <Settings className="w-3.5 h-3.5" /> Configure
         </button>
      </div>
    </div>
  );
}

function LogLine({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-neutral-800/50 last:border-0 gap-1">
      <span className="text-neutral-500 font-sans text-sm">{label}</span>
      <span className="text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded select-all break-all">{value}</span>
    </div>
  );
}

