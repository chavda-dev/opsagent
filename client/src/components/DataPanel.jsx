import './DataPanel.css';

export default function DataPanel({ data, loading, collection }) {
  if (loading) {
    return <div className="data-panel loading-state">Loading {collection}...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="data-panel empty-state">
        <p>No {collection} records found.</p>
        <p className="hint">Use the command bar to add data.</p>
      </div>
    );
  }

  const keys = Object.keys(data[0]).filter((k) => k !== '__v');

  return (
    <div className="data-panel">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row._id || i}>
                {keys.map((k) => (
                  <td key={k}>{formatCell(row[k])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="record-count">{data.length} record{data.length !== 1 ? 's' : ''}</p>
    </div>
  );
}

function formatCell(val) {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') {
    if (val instanceof Date || (typeof val === 'string' && !isNaN(Date.parse(val)))) {
      return new Date(val).toLocaleString();
    }
    return JSON.stringify(val);
  }
  return String(val);
}
