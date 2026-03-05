import StatusBadge from './StatusBadge.jsx';

export default function TicketTable({ tickets, onTicketClick }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-16 text-surface-400">
        <p className="text-xl font-medium">No tickets found</p>
        <p className="text-sm">Your service requests will appear here once raised.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-surface-400 text-xs font-bold uppercase tracking-widest">
            <th className="px-6 py-4 text-left">ID</th>
            <th className="px-6 py-4 text-left">Details</th>
            <th className="px-6 py-4 text-left">Status</th>
            <th className="px-6 py-4 text-left">Timeline</th>
          </tr>
        </thead>
        <tbody className="">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => onTicketClick(ticket.id)}
              className="bg-white/50 hover:bg-white hover:shadow-premium transition-all cursor-pointer group rounded-2xl overflow-hidden"
            >
              <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-brand-600 rounded-l-2xl border-y border-l border-surface-100">
                #{ticket.id}
              </td>
              <td className="px-6 py-5 border-y border-surface-100">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-surface-900 group-hover:text-brand-600 transition-colors">
                    {ticket.title}
                  </span>
                  <span className="text-xs font-medium text-surface-400">
                    {ticket.category}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5 border-y border-surface-100">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-xs font-semibold text-surface-400 rounded-r-2xl border-y border-r border-surface-100">
                <div className="flex flex-col">
                  <span>Created: {formatDate(ticket.createdAt)}</span>
                  <span>Updated: {formatDate(ticket.updatedAt)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
