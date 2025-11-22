import "./Divider.css";

const Divider = ({ color = "rgba(0, 0, 0, 0.3)" }) => {
  return (
    <div className="divider-container">
      <div
        className="divider-line"
        style={{
          background: `linear-gradient(to right, rgba(0, 0, 0, 0), ${color}, rgba(0, 0, 0, 0))`,
        }}
      ></div>
    </div>
  );
};

export default Divider;
