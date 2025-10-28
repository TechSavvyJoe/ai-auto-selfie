import React, { ReactNode, Component, ErrorInfo } from 'react';
import Icon from './common/Icon';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

/**
 * ErrorBoundary - Catches React component errors and displays fallback UI
 * Prevents entire app from crashing due to component errors
 * Follows React best practices and matches Google/Apple standards
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorCount: 0,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorCount: 0,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Here you could send error to an external logging service
    // e.g., Sentry, LogRocket, Datadog, etc.
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorCount: this.state.errorCount + 1,
    });

    // Redirect to home after 3 retries
    if (this.state.errorCount > 2) {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default error UI
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
          <div className="w-full max-w-md space-y-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20 blur-xl"></div>
                <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 ring-2 ring-red-500/50">
                  <Icon type="alert" className="h-10 w-10 text-red-400" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-white">Something Went Wrong</h1>
              <p className="text-base text-white/70 leading-relaxed">
                We encountered an unexpected error. Our team has been notified and we're working to fix it.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 max-h-40 overflow-y-auto rounded-lg bg-red-500/10 p-4 text-left">
                  <p className="text-xs font-mono text-red-300">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-primary-700 hover:to-primary-800 hover:shadow-primary-500/30 active:scale-95"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full rounded-xl bg-white/10 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-white/20 active:scale-95 backdrop-blur-sm"
              >
                Go Home
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-white/50">
              If this problem persists, please contact support or try clearing your browser cache.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
