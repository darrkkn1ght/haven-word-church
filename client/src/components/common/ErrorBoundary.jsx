import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // You can log error to an error reporting service here
    // console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800 p-8">
          <h1 className="text-3xl font-bold mb-4">Something went wrong.</h1>
          <p className="mb-2">An unexpected error occurred in the application.</p>
          {this.state.error && <pre className="bg-red-100 p-4 rounded text-xs overflow-x-auto mb-2">{this.state.error.toString()}</pre>}
          {this.state.errorInfo && <details className="whitespace-pre-wrap text-xs"><summary>Stack Trace</summary>{this.state.errorInfo.componentStack}</details>}
          <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded" onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
