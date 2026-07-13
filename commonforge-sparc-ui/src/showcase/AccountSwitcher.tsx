import type { ReactNode } from "react"
import { Avatar } from "@/components/avatar"
import { AccountSwitcher } from "@/components/account-switcher"

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-bold mb-2">
        {label}
      </div>
      {children}
    </div>
  )
}

export function AccountSwitcherShowcase() {
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold">account-switcher</h2>
      <p className="text-sm text-secondary mb-4">
        The profile trigger for the top of the rail: avatar + name + chevron. Built on the avatar
        atom. Initials fallback shown, pass a photo via <code>avatarSrc</code>.
      </p>

      <div className="grid grid-cols-2 gap-x-10 gap-y-6">
        <Group label="avatar atom">
          <div className="flex items-center gap-3">
            <Avatar fallback="JH" size={20} />
            <Avatar fallback="JH" size={24} />
            <Avatar fallback="AB" size={32} />
            <Avatar fallback="CE" size={40} />
          </div>
        </Group>

        <Group label="account-switcher">
          <div className="w-[256px] rounded-md bg-background p-2">
            <AccountSwitcher name="Jason Heim" initials="JH" role="Admin" />
          </div>
        </Group>
      </div>
    </section>
  )
}
