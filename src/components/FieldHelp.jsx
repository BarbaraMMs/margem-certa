import { Info } from 'lucide-react'

export default function FieldHelp({ text }) {
  return (
    <span
      className="ml-1 text-gray-400 hover:text-brass-600 cursor-help inline-flex"
      title={text}
      aria-label={text}
    >
      <Info className="w-3.5 h-3.5" strokeWidth={2} />
    </span>
  )
}
