interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TitleInput({ value, onChange }: TitleInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="输入标题..."
      style={{
        width: '100%',
        padding: '12px 16px',
        fontSize: 20,
        fontWeight: 600,
        border: 'none',
        borderBottom: '1px solid #e5e7eb',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
}
