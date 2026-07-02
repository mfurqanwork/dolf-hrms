import { Separator } from "@/components/ui/separator"

interface InfoItem {
  label: string
  value: string | null | undefined
}

export function InfoList({ items }: { items: InfoItem[] }) {
  return (
    <div className="rounded-lg border">
      {items.map((item, index) => (
        <div key={item.label}>
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="text-end font-medium">{item.value || "—"}</span>
          </div>
          {index < items.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}
