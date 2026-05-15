import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
          <div className="text-center max-w-xs">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Ops! Algo deu errado</h2>
            <p className="text-sm text-slate-500 mb-2">
              Ocorreu um erro inesperado nesta seção. Tente recarregar ou volte mais tarde.
            </p>
            {this.state.error && (
              <div className="bg-red-50 p-3 rounded-lg mb-6 text-left overflow-auto">
                <p className="text-xs font-mono text-red-800 break-words font-bold">
                  ERRO TÉCNICO:
                </p>
                <p className="text-xs font-mono text-red-600 break-words mt-1">
                  {this.state.error.toString()}
                </p>
                <p className="text-[10px] font-mono text-red-400 break-words mt-2 whitespace-pre-wrap">
                  {this.state.error.stack?.substring(0, 300)}...
                </p>
              </div>
            )}
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
