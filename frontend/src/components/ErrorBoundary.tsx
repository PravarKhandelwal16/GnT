import React from 'react';

const RELOAD_FLAG = 'gnt_chunk_reload';

/** A page chunk that fails to download (stale dev server or a new deploy) is fixed by one reload. */
function isChunkLoadError(error: Error): boolean {
  return /dynamically imported module|Importing a module script failed|Failed to fetch|Loading chunk/i.test(error.message);
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    let alreadyReloaded = false;
    try {
      alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === '1';
      if (isChunkLoadError(error) && !alreadyReloaded) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
        return;
      }
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
      // Storage unavailable: fall through to the message below.
    }
    console.error(error);
  }

  componentDidMount() {
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
      // ignore
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="panel max-w-md p-8 text-center">
          <h1 className="display text-3xl">Something went wrong</h1>
          <p className="mt-2 text-sm text-textMain-secondary">Reloading the page usually fixes this.</p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-textMain/5 p-3 text-left text-xs text-danger">
              {this.state.error.message}
              {'\n'}
              {this.state.error.stack?.split('\n').slice(1, 4).join('\n')}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-onPrimary hover:bg-primary-hover"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
