import { useState, useRef, useEffect } from 'react';
import { sendCommand, fetchCollection } from './api.js';
import CommandBar from './components/CommandBar.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import DataPanel from './components/DataPanel.jsx';
import './App.css';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [collectionData, setCollectionData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const loadCollection = async (col) => {
    setDataLoading(true);
    try {
      const data = await fetchCollection(col);
      setCollectionData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadCollection(activeTab);
  }, [activeTab]);

  const handleCommand = async (command) => {
    const userMsg = { role: 'user', text: command, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const result = await sendCommand(command);
      const agentMsg = { role: 'agent', result, ts: Date.now() };
      setMessages((prev) => [...prev, agentMsg]);
      loadCollection(activeTab);
    } catch (err) {
      const errMsg = { role: 'error', text: err.message, ts: Date.now() };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">OpsAgent</span>
        </div>
        <p className="header-sub">AI-powered business operations</p>
      </header>

      <main className="app-main">
        <section className="chat-section">
          <ResultPanel messages={messages} loading={loading} />
          <CommandBar onSubmit={handleCommand} loading={loading} />
        </section>

        <section className="data-section">
          <div className="tab-bar">
            {['inventory', 'orders', 'appointments'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            <button className="refresh-btn" onClick={() => loadCollection(activeTab)} title="Refresh">
              ↻
            </button>
          </div>
          <DataPanel data={collectionData} loading={dataLoading} collection={activeTab} />
        </section>
      </main>
    </div>
  );
}
