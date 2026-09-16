export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;

  const styles = {
    error: 'bg-red-500/10 text-red-300 border-red-500/30',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    info: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  };

  return (
    <div className={`mb-4 p-3 rounded-lg border text-sm flex justify-between ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold">&times;</button>
      )}
    </div>
  );
}
