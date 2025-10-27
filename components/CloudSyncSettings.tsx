import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import { cloudSyncService, CloudSyncConfig, CloudSyncStatus } from '../services/cloudSyncService';

interface CloudSyncSettingsProps {
  onClose?: () => void;
}

const CloudSyncSettings: React.FC<CloudSyncSettingsProps> = ({ onClose }) => {
  const [config, setConfig] = useState<CloudSyncConfig>(cloudSyncService.getConfig());
  const [status, setStatus] = useState<CloudSyncStatus>(cloudSyncService.getStatus());
  const [showSetup, setShowSetup] = useState(!config.enabled && !config.backend);
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [projectId, setProjectId] = useState(config.projectId || '');
  const [customEndpoint, setCustomEndpoint] = useState(config.customEndpoint || '');

  useEffect(() => {
    const unsubscribe = cloudSyncService.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  const handleBackendChange = (backend: 'firebase' | 'supabase' | 'custom') => {
    setConfig(prev => ({ ...prev, backend }));
  };

  const handleInitialize = async () => {
    if (!config.backend) return;

    const backendConfig: Record<string, any> = {};
    if (config.backend === 'supabase') {
      backendConfig.projectId = projectId;
      backendConfig.apiKey = apiKey;
    } else if (config.backend === 'custom') {
      backendConfig.customEndpoint = customEndpoint;
      backendConfig.apiKey = apiKey;
    }

    const success = await cloudSyncService.initializeBackend(config.backend, backendConfig);
    if (success) {
      setShowSetup(false);
      setConfig(cloudSyncService.getConfig());
    }
  };

  const handleSync = async () => {
    await cloudSyncService.syncToCloud({
      presets: [],
      gallery: [],
      settings: {},
      timestamp: Date.now(),
      version: '1.0.0',
    });
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    cloudSyncService.setConfig({ autoSync: enabled });
    setConfig(cloudSyncService.getConfig());
    if (enabled) {
      cloudSyncService.startAutoSync();
    } else {
      cloudSyncService.stopAutoSync();
    }
  };

  const handleDisable = () => {
    cloudSyncService.disable();
    setConfig(cloudSyncService.getConfig());
    setShowSetup(true);
  };

  if (showSetup && !config.enabled) {
    return (
      <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Cloud Sync Setup</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <Icon type="close" className="w-5 h-5" />
            </button>
          )}
        </div>

        <p className="text-sm text-gray-300">
          Sync your presets and gallery across devices. Choose a backend service.
        </p>

        <div className="space-y-2">
          {(['supabase', 'custom'] as const).map(backend => (
            <button
              key={backend}
              onClick={() => handleBackendChange(backend)}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                config.backend === backend
                  ? 'bg-primary-500/20 border border-primary-500'
                  : 'bg-gray-700 border border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="font-semibold text-white capitalize">{backend}</div>
              <div className="text-xs text-gray-300 mt-1">
                {backend === 'supabase' && 'PostgreSQL backend with Supabase'}
                {backend === 'custom' && 'Custom REST API endpoint'}
              </div>
            </button>
          ))}
        </div>

        {config.backend === 'supabase' && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Project ID"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:border-primary-500 outline-none"
            />
            <input
              type="password"
              placeholder="API Key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:border-primary-500 outline-none"
            />
          </div>
        )}

        {config.backend === 'custom' && (
          <div className="space-y-2">
            <input
              type="url"
              placeholder="Endpoint URL (e.g., https://sync.example.com)"
              value={customEndpoint}
              onChange={e => setCustomEndpoint(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:border-primary-500 outline-none"
            />
            <input
              type="password"
              placeholder="API Key (optional)"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:border-primary-500 outline-none"
            />
          </div>
        )}

        <Button
          onClick={handleInitialize}
          variant="primary"
          disabled={!config.backend || (config.backend === 'supabase' && (!projectId || !apiKey))}
          className="w-full"
        >
          Connect Backend
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Cloud Sync</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon type="close" className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Status */}
      <div className="bg-gray-700/50 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Status</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${
            config.enabled
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-600/20 text-gray-400'
          }`}>
            {config.enabled ? '✓ Connected' : '○ Disconnected'}
          </span>
        </div>
        {config.backend && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Backend</span>
            <span className="text-xs text-gray-400 capitalize">{config.backend}</span>
          </div>
        )}
        {status.lastSync && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Last Sync</span>
            <span className="text-xs text-gray-400">
              {new Date(status.lastSync).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Sync Status */}
      {status.isSyncing && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 text-sm text-blue-300">
          Syncing... ({status.syncedItems}/{status.totalItems} items)
        </div>
      )}

      {status.error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-300">
          {status.error}
        </div>
      )}

      {/* Auto-sync toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
        <span className="text-sm font-medium text-white">Auto-sync</span>
        <button
          onClick={() => handleToggleAutoSync(!config.autoSync)}
          className={`relative w-10 h-6 rounded-full transition-colors ${
            config.autoSync ? 'bg-primary-500' : 'bg-gray-600'
          }`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            config.autoSync ? 'translate-x-4' : ''
          }`} />
        </button>
      </div>

      {/* Sync interval */}
      {config.autoSync && (
        <div className="text-xs text-gray-400 text-center">
          Syncs every {Math.round(config.syncInterval / 60000)} minute{Math.round(config.syncInterval / 60000) !== 1 ? 's' : ''}
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-2">
        <Button
          onClick={handleSync}
          variant="primary"
          disabled={!config.enabled || status.isSyncing}
          className="w-full"
          icon={<Icon type="download" className="w-4 h-4" />}
        >
          Sync Now
        </Button>
        <Button
          onClick={handleDisable}
          variant="danger"
          className="w-full text-sm"
        >
          Disconnect Cloud Sync
        </Button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Your data is encrypted in transit and at rest on cloud servers.
      </p>
    </div>
  );
};

export default CloudSyncSettings;
