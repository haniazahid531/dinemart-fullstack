const statusClass = (status) => {
  const value = status?.toLowerCase().replaceAll(' ', '-');
  return `status ${value}`;
};

const StatusBadge = ({ status }) => {
  return <span className={statusClass(status)}>{status}</span>;
};

export default StatusBadge;
