export default function FieldHelp({ text }) {
  return (
    <span
      className="ml-1 text-gray-400 cursor-help"
      title={text}
      aria-label={text}
    >
      ℹ️
    </span>
  )
}
