import { useEffect, useRef } from 'react';
import './ResultPanel.css';

export default function ResultPanel({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="result-panel empty">
        <div className="empty-state">
          <span className="empty-icon">⚡</span>
          <p>Send a command to get started.</p>
          <p className="empty-hint">Try "Show all inventory items" or "Give me a summary of orders"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result-panel">
      {messages.map((msg, i) => {
        if (msg.role === 'user') {
          return (
            <div key={i} className="message user-msg">
              <span className="msg-label">You</span>
              <p>{msg.text}</p>
            </div>
          );
        }
        if (msg.role === 'error') {
          return (
            <div key={i} className="message error-msg">
              <span className="msg-label">Error</span>
              <p>{msg.text}</p>
            </div>
          );
        }
        const { plan, results, summary } = msg.result;
        return (
          <div key={i} className="message agent-msg">
            <span className="msg-label">OpsAgent</span>
            <p className="summary-text">{summary}</p>
            <details className="plan-details">
              <summary>Plan & Results</summary>
              <div className="plan-body">
                <div className="plan-row">
                  <span className="badge intent">{plan.intent}</span>
                  <span className="badge collection">{plan.collection}</span>
                </div>
                <pre className="json-pre">{JSON.stringify(results, null, 2)}</pre>
              </div>
            </details>
          </div>
        );
      })}
      {loading && (
        <div className="message agent-msg loading-msg">
          <span className="msg-label">OpsAgent</span>
          <span className="dots"><span>.</span><span>.</span><span>.</span></span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
