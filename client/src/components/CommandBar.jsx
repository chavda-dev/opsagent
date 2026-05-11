import { useState } from 'react';
import './CommandBar.css';

const EXAMPLES = [
  'Show all inventory items',
  'Add 50 units of coffee beans to inventory',
  'Show pending orders',
  'Schedule appointment for John tomorrow at 3pm',
  'Give me a summary of appointments',
];

export default function CommandBar({ onSubmit, loading }) {
  const [value, setValue] = useState('');

  const submit = () => {
    const cmd = value.trim();
    if (!cmd || loading) return;
    onSubmit(cmd);
    setValue('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="command-bar">
      <div className="examples">
        {EXAMPLES.map((ex) => (
          <button key={ex} className="example-chip" onClick={() => setValue(ex)}>
            {ex}
          </button>
        ))}
      </div>
      <div className="input-row">
        <textarea
          className="command-input"
          rows={2}
          placeholder="Tell OpsAgent what to do... (Enter to send)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <button className="send-btn" onClick={submit} disabled={loading || !value.trim()}>
          {loading ? '...' : '→'}
        </button>
      </div>
    </div>
  );
}
