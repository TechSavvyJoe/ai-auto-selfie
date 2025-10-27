import React, { useState } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';

interface SharePanelProps {
  itemId: string;
  itemType: 'image' | 'preset';
  itemName?: string;
  dataUrl?: string;
  onClose?: () => void;
}

interface ShareLink {
  id: string;
  url: string;
  expiresAt: number;
  accessCount: number;
  maxAccess?: number;
}

const SharePanel: React.FC<SharePanelProps> = ({
  itemId,
  itemType,
  itemName,
  dataUrl,
  onClose,
}) => {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [shareMode, setShareMode] = useState<'link' | 'direct' | 'qr'>('link');

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      // Generate a unique share ID
      const shareId = `${itemType}-${itemId}-${Date.now().toString(36)}`;
      const shareUrl = `${window.location.origin}?share=${shareId}`;

      const newLink: ShareLink = {
        id: shareId,
        url: shareUrl,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        accessCount: 0,
        maxAccess: undefined,
      };

      setShareLinks(prev => [newLink, ...prev]);

      // Save share metadata to localStorage
      const shares = JSON.parse(localStorage.getItem('sharedItems') || '{}');
      shares[shareId] = {
        itemId,
        itemType,
        itemName,
        createdAt: Date.now(),
        expiresAt: newLink.expiresAt,
      };
      localStorage.setItem('sharedItems', JSON.stringify(shares));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLink(text);
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  const revokeLink = (linkId: string) => {
    setShareLinks(prev => prev.filter(l => l.id !== linkId));
    const shares = JSON.parse(localStorage.getItem('sharedItems') || '{}');
    delete shares[linkId];
    localStorage.setItem('sharedItems', JSON.stringify(shares));
  };

  const downloadAsJSON = () => {
    const data = {
      itemType,
      itemId,
      itemName,
      timestamp: Date.now(),
      ...(itemType === 'image' && dataUrl && { dataUrl }),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${itemName || itemType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getShareStats = () => {
    const totalAccess = shareLinks.reduce((sum, l) => sum + l.accessCount, 0);
    const activeLinks = shareLinks.filter(l => l.expiresAt > Date.now()).length;
    return { totalAccess, activeLinks };
  };

  const stats = getShareStats();

  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Share {itemType === 'image' ? 'Photo' : 'Preset'}</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon type="close" className="w-5 h-5" />
          </button>
        )}
      </div>

      {itemName && (
        <div className="bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-400">Item</p>
          <p className="text-sm text-white font-medium truncate">{itemName}</p>
        </div>
      )}

      {/* Share mode selector */}
      <div className="flex gap-2 bg-gray-700/50 rounded-lg p-1">
        {(['link', 'direct', 'qr'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setShareMode(mode)}
            className={`flex-1 px-2 py-2 text-xs font-semibold rounded transition-all ${
              shareMode === mode
                ? 'bg-primary-500 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            {mode === 'link' && '🔗 Link'}
            {mode === 'direct' && '📤 Direct'}
            {mode === 'qr' && '📱 QR'}
          </button>
        ))}
      </div>

      {/* Share stats */}
      {stats.activeLinks > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 text-sm text-blue-300">
          <div className="flex justify-between">
            <span>Active Links</span>
            <span className="font-semibold">{stats.activeLinks}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Total Access</span>
            <span>{stats.totalAccess}</span>
          </div>
        </div>
      )}

      {/* Share link mode */}
      {shareMode === 'link' && (
        <div className="space-y-2">
          {shareLinks.length === 0 ? (
            <p className="text-sm text-gray-400">No active share links. Create one below.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {shareLinks.map(link => (
                <div key={link.id} className="bg-gray-700 rounded-lg p-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 truncate">{link.url}</p>
                    <p className="text-[10px] text-gray-500">
                      Accessed {link.accessCount}x · Expires {new Date(link.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyToClipboard(link.url)}
                      className="p-1.5 bg-gray-600 hover:bg-gray-500 rounded text-xs"
                      title="Copy link"
                    >
                      {copiedLink === link.url ? '✓' : '📋'}
                    </button>
                    <button
                      onClick={() => revokeLink(link.id)}
                      className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs"
                      title="Revoke link"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={generateShareLink}
            disabled={isGenerating}
            variant="primary"
            className="w-full"
            icon={<Icon type="share" className="w-4 h-4" />}
          >
            {isGenerating ? 'Generating...' : 'Create Share Link'}
          </Button>
        </div>
      )}

      {/* Direct download mode */}
      {shareMode === 'direct' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">
            Download as a file to share directly or import later.
          </p>
          <Button
            onClick={downloadAsJSON}
            variant="primary"
            className="w-full"
            icon={<Icon type="download" className="w-4 h-4" />}
          >
            Download as JSON
          </Button>
          {dataUrl && (
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `${itemName || 'photo'}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              variant="secondary"
              className="w-full text-sm"
              icon={<Icon type="download" className="w-4 h-4" />}
            >
              Download Image
            </Button>
          )}
        </div>
      )}

      {/* QR code mode */}
      {shareMode === 'qr' && (
        <div className="space-y-3">
          {shareLinks.length === 0 ? (
            <>
              <p className="text-sm text-gray-400">
                Create a share link first to generate a QR code.
              </p>
              <Button
                onClick={generateShareLink}
                disabled={isGenerating}
                variant="primary"
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Create Share Link'}
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-400">
                Scan to share or view on mobile devices.
              </p>
              <div className="bg-white p-4 rounded-lg flex items-center justify-center h-40">
                <div className="text-center">
                  <p className="text-sm text-gray-600">QR Code</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Generation via external service
                  </p>
                </div>
              </div>
              <Button
                onClick={() => copyToClipboard(shareLinks[0].url)}
                variant="secondary"
                className="w-full text-sm"
              >
                Copy Link Instead
              </Button>
            </>
          )}
        </div>
      )}

      {/* Info */}
      <div className="bg-gray-700/30 rounded-lg p-3 text-xs text-gray-400 space-y-1">
        <p>• Share links expire after 7 days</p>
        <p>• Access can be revoked anytime</p>
        <p>• Direct downloads include all metadata</p>
      </div>
    </div>
  );
};

export default SharePanel;
