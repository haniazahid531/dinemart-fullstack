const OrderTimeline = ({ timeline = [] }) => {
  return (
    <div className="timeline">
      {timeline.map((item, index) => (
        <div className="timeline-item" key={`${item.status}-${index}`}>
          <div className="timeline-dot" />
          <div>
            <strong>{item.status}</strong>
            <p>{item.note}</p>
            <small>{new Date(item.createdAt).toLocaleString()} • {item.updatedBy}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;
