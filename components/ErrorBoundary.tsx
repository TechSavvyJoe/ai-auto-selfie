/**
 * Error Boundary Component
 * Catches React errors and displays a graceful fallback UI
 * Provides recovery options and error reporting
 */

import React, { ReactNode } from 'react';
import Button from './common/Button';
import Icon from './common/Icon';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-error-500/10 rounded-full flex items-center justify-center">
                <Icon type="alert" className="w-8 h-8 text-error-500" />
              </div>
            </div>

            {/* Error Content */}
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
              <p className="text-neutral-400">
                We encountered an unexpected error. Our team has been notified.
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 p-4 bg-neutral-800 rounded-lg text-left">
                  <p className="text-xs font-mono text-error-300 break-words">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-3 text-xs text-neutral-400">
                      <summary className="cursor-pointer hover:text-neutral-300 mb-2">
                        Stack trace
                      </summary>
                      <pre className="font-mono text-xs overflow-auto max-h-48 whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Recovery Actions */}
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  size="large"
                  className="w-full"
                  icon={<Icon type="redo" />}
                >
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="secondary"
                  size="large"
                  className="w-full"
                  icon={<Icon type="refresh" />}
                >
                  Reload Page
                </Button>
              </div>

              {/* Error Status */}
              {this.state.errorCount > 2 && (
                <p className="text-sm text-warning-500 mt-4">
                  Multiple errors detected. Please refresh the page or clear your cache.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
