type Props = { title: string; description: string; stars?: number; owner?: string }

export default function ProjectCard({ title, description, stars = 0, owner }: Props) {
  return (
    <article className="p-4 bg-white rounded shadow flex justify-between items-start">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-500 mt-2">by {owner}</p>
      </div>
      <div className="text-sm text-gray-700">⭐ {stars}</div>
    </article>
  )
}
