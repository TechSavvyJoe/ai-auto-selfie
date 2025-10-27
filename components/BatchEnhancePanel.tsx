import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';
import { getBatchEnhanceService } from '../services/batchEnhanceService';
import { enhanceStrategies } from '../services/autoEnhanceService';
import { BatchJob } from '../types';

interface BatchEnhancePanelProps {
  imageIds: string[];
  onClose: () => void;
}

const BatchEnhancePanel: React.FC<BatchEnhancePanelProps> = ({ imageIds, onClose }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('balanced');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const batchService = getBatchEnhanceService();

  useEffect(() => {
    const unsubscribe = batchService.subscribe((job) => {
      setJobs(prev => {
        const index = prev.findIndex(j => j.id === job.id);
        if (index >= 0) {
          const newJobs = [...prev];
          newJobs[index] = job;
          return newJobs;
        }
        return [...prev, job];
      });
    });
    return unsubscribe;
  }, [batchService]);

  const handleStartBatch = () => {
    if (imageIds.length === 0) return;
    setIsProcessing(true);
    const jobId = batchService.createJob(imageIds, selectedStrategy);
    setSelectedStrategy('balanced');
  };

  const activeJobs = jobs.filter(j => j.status === 'processing' || j.status === 'pending');
  const completedJobs = jobs.filter(j => j.status === 'completed');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900">
          <div className="flex items-center gap-3">
            <Icon type="sparkles" className="w-6 h-6 text-yellow-300" />
            <h2 className="text-2xl font-bold text-white">Batch Enhance</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Icon type="close" className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!isProcessing && activeJobs.length === 0 && (
            <>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  Enhance {imageIds.length} image{imageIds.length !== 1 ? 's' : ''} with a single strategy
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Select Enhancement Strategy</h3>
                <div className="grid grid-cols-2 gap-2">
                  {enhanceStrategies.map(strategy => (
                    <button
                      key={strategy.id}
                      onClick={() => setSelectedStrategy(strategy.id)}
                      className={selectedStrategy === strategy.id ? 'p-3 rounded-lg text-left transition-all border bg-primary-500/20 border-primary-500' : 'p-3 rounded-lg text-left transition-all border bg-gray-800 border-gray-700 hover:border-gray-600'}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-white capitalize">{strategy.label}</p>
                        <span className="text-sm">{strategy.icon}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-1">{strategy.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleStartBatch}
                variant="primary"
                className="w-full"
                icon={<Icon type="play" className="w-4 h-4" />}
              >
                Start Batch Enhancement
              </Button>
            </>
          )}

          {(isProcessing || activeJobs.length > 0) && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Processing Jobs</h3>
              {activeJobs.map(job => (
                <div key={job.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white capitalize">{job.strategy} • {job.imageIds.length} images</span>
                    <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded">{job.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: job.progress + '%' }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {job.results.length} of {job.imageIds.length} complete
                  </p>
                </div>
              ))}
            </div>
          )}

          {completedJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Completed Jobs</h3>
              {completedJobs.slice(-3).map(job => (
                <div key={job.id} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-200 capitalize">{job.strategy}</span>
                    <span className="text-xs bg-green-500/30 text-green-200 px-2 py-1 rounded">
                      {job.results.length} enhanced
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <Button onClick={onClose} variant="secondary" className="w-full text-sm">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BatchEnhancePanel;