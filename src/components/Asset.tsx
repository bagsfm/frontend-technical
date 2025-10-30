interface AssetProps {
  label: string;
  value: number | null | undefined;
}

function Asset({ label, value }: AssetProps) {
  return (
    <div className="card">
      <strong>{label}:</strong>{' '}
      {value === null || value === undefined
        ? 'Loading…'
        : value.toFixed(label === 'SOL' ? 4 : 6)}
    </div>
  );
}

export default Asset;
