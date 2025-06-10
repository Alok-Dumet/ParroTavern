import './css/switch.css';

export default function Switch({ isPrivate, setPrivacy }) {
  return (
    <>
      <label className="switch">
        <input type="checkbox" checked={!isPrivate} onChange={() => setPrivacy((prev) => !prev)} />
        <span className="slider" />
      </label>
    </>
  );
}
