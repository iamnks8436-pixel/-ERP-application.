import EmptyState from './EmptyState';
import Loading from './Loading';

export default function DataTable({ columns, rows, loading, emptyTitle = 'No records found', renderRow }) {
  if (loading) return <div className="table-shell p-5"><Loading /></div>;
  return <div className="table-shell overflow-x-auto">{rows.length ? <table className="w-full"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map(renderRow)}</tbody></table> : <EmptyState title={emptyTitle} />}</div>;
}
