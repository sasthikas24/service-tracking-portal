const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Open':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default:
        return 'bg-surface-100 text-surface-400 border-surface-200';
    }
  };

  return (
    <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${getStatusStyles()}`}>
      {status}
    </span>
  );
}

export { StatusBadge };
export default StatusBadge;
