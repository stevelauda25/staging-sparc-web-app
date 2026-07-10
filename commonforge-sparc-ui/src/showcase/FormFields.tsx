import type { ReactNode } from "react"
import { Circle, ChevronDown } from "@untitledui/icons"
import { TextInput } from "@/components/text-input"
import { SearchField, type SearchResult } from "@/components/search-field"

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-5">
      <div className="w-20 shrink-0 pt-2.5 font-mono text-[9px] uppercase tracking-wider text-neutral-500">
        {label}
      </div>
      <div className="w-[420px]">{children}</div>
    </div>
  )
}

/** a sample "Label v" dropdown addon for the prefix/suffix slots */
function LabelAddon() {
  return (
    <>
      <span className="size-5 shrink-0 rounded-[2px] bg-[#F5F5F5]" />
      <span className="text-sm leading-5 text-black">Label</span>
      <ChevronDown size={14} className="text-[#525252]" />
    </>
  )
}

const RESULTS: SearchResult[] = [
  { id: "wiring", label: "Wiring & Conduit", leading: <Circle size={12} />, trailing: <Circle size={12} /> },
  { id: "pulling", label: "Wire Pulling", leading: <Circle size={12} />, trailing: <Circle size={12} /> },
  { id: "wireless", label: "Wireless Systems", leading: <Circle size={12} />, trailing: <Circle size={12} /> },
]

export function TextInputShowcase() {
  const lead = <Circle size={18} />
  const trail = <Circle size={18} />
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">text-input</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The raw input. Fill #F5F5F5, 1px black/10 border, black focus border with a 3px ring, red
        error border, gray-100 disabled. Sizes sm/md, leading/trailing icons, and prefix/suffix
        addons. Click into a field to see focus.
      </p>
      <div className="space-y-3">
        <Row label="default">
          <TextInput placeholder="Enter your full name" leading={lead} trailing={trail} />
        </Row>
        <Row label="filled">
          <TextInput defaultValue="Enter your full name" leading={lead} trailing={trail} />
        </Row>
        <Row label="error">
          <TextInput error defaultValue="Enter your full name" leading={lead} trailing={trail} />
        </Row>
        <Row label="disabled">
          <TextInput disabled placeholder="Enter your full name" leading={lead} trailing={trail} />
        </Row>
        <Row label="small">
          <TextInput size="sm" placeholder="Enter your full name" />
        </Row>
        <Row label="prefix">
          <TextInput prefix={<LabelAddon />} placeholder="Enter your full name" />
        </Row>
        <Row label="suffix">
          <TextInput suffix={<LabelAddon />} placeholder="Enter your full name" />
        </Row>
      </div>
    </section>
  )
}

export function SearchFieldShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">search-field</h2>
      <p className="text-sm text-muted-foreground mb-4">
        A text-input with a search icon and a results dropdown (list-base rows on a white panel with
        a layered shadow). States come from text-input.
      </p>
      <div className="space-y-3">
        <Row label="default">
          <SearchField />
        </Row>
        <Row label="filled">
          <SearchField defaultValue="Wiring & Conduct" />
        </Row>
        <Row label="error">
          <SearchField error defaultValue="Wiring & Conduct" />
        </Row>
        <Row label="disabled">
          <SearchField disabled />
        </Row>
        <Row label="compact ⌘K">
          {/* the sidebar variant: smaller icon/padding, 0.6px border, shadow, kbd hint */}
          <div className="w-56 rounded-md bg-background p-1.5">
            <SearchField
              size="sm"
              iconSize={14}
              shortcut="⌘K"
              fieldClassName="py-1 pl-2 pr-1"
              containerClassName="border-[0.6px] shadow-[0_0.5px_2px_rgba(0,0,0,0.05)]"
            />
          </div>
        </Row>

        <Row label="with results">
          {/* extra space below so the absolute dropdown does not overlap */}
          <div className="pb-[180px]">
            <SearchField open defaultValue="Wir" results={RESULTS} />
          </div>
        </Row>
      </div>
    </section>
  )
}
