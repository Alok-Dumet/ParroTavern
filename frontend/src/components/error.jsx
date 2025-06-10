export default function Error({ state, setState }) {
  if (!state) return null;
  return (
    <div className="errorScreen">
      <div className="errorContainer">
        <h1>A dragon is messing with out spires! Please come back later</h1>
      </div>
    </div>
  );
}
