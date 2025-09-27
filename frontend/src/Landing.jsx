export default function Landing({ onEnter }) {
  return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <h1>Private Voting. Public Trust.</h1>
      <p>Upload tracks, vote anonymously with FHEVM, and see transparent results.</p>
      <button onClick={onEnter} style={{ padding: "10px 20px", fontSize: 16 }}>
        Enter App
      </button>
    </div>
  );
}