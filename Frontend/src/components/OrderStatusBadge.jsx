export default function OrderStatusBadge({ status }) {
    const statusConfig = {
        pending: {
            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            label: 'Pending',
        },
        paid: {
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            label: 'Paid',
        },
        shipped: {
            color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            label: 'Shipped',
        },
        completed: {
            color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            label: 'Completed',
        },
        cancelled: {
            color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            label: 'Cancelled',
        },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
        </span>
    );
}
