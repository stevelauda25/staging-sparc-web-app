import { TokensShowcase } from "./Tokens"
import { ListBaseShowcase } from "./ListBase"
import { NavItemShowcase } from "./NavItem"
import { NavSectionShowcase } from "./NavSection"
import { SeparatorShowcase } from "./Separator"
import { BadgeShowcase } from "./Badge"
import { TextInputShowcase, SearchFieldShowcase } from "./FormFields"
import { AccountSwitcherShowcase } from "./AccountSwitcher"
import { SidebarShowcase } from "./Sidebar"

/** The component library reference page. Reachable at #showcase. */
export function Showcase() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="border-b border-border px-8 py-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-crimson-600">
          Common Forge design system
        </div>
        <h1 className="text-xl font-extrabold mt-0.5">Component Library</h1>
        <p className="text-sm text-muted-foreground">Showcase of tokens and components, built bottom-up.</p>
      </header>
      <main className="px-8 py-7 max-w-5xl mx-auto">
        <TokensShowcase />
        <ListBaseShowcase />
        <NavItemShowcase />
        <NavSectionShowcase />
        <SeparatorShowcase />
        <BadgeShowcase />
        <TextInputShowcase />
        <SearchFieldShowcase />
        <AccountSwitcherShowcase />
        <SidebarShowcase />
      </main>
    </div>
  )
}
