import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearStorageAndReset = () => {
    try {
      localStorage.removeItem('vrishketu_local_profile');
      localStorage.removeItem('vrishketu_local_posts');
      sessionStorage.clear();
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-white font-heading">
                एप्लिकेशन लोड करने में समस्या (Application Recovery)
              </h1>
              <p className="text-xs text-gray-400">
                एक अप्रत्याशित त्रुटि आई। घबराएं नहीं, नीचे दिए गए बटन से ऐप को आसानी से पुनः लोड या रीसेट किया जा सकता है।
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-left overflow-hidden">
                <p className="text-[11px] text-rose-400 font-mono break-all line-clamp-3">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-blue-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>पुनः लोड करें (Reload)</span>
              </button>

              <button
                onClick={this.handleClearStorageAndReset}
                className="py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-750 text-gray-300 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 border border-gray-700"
                title="Clear local cached data"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>रीसेट कैश (Reset Cache)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
