import * as React from "react"
import { DoodleCrewFooter } from "@/components/ui/doodle-crew-footer-sunny"

export function DoodleCrewFooterDemo() {
  const [preset, setPreset] = React.useState<"reloop" | "sunny" | "paper" | "night">("reloop");

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3 p-4 bg-cream-100 border-b border-cream-200 text-xs font-medium text-charcoal-700">
        <span>Footer Preset:</span>
        {(["reloop", "sunny", "paper", "night"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={`px-3 py-1 rounded-full border transition-all ${
              preset === p
                ? "bg-sage-600 text-white border-sage-600"
                : "bg-white text-charcoal-700 border-cream-300 hover:bg-cream-50"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      <DoodleCrewFooter
        preset={preset}
        wordmark={preset === "reloop" ? "RELOOP" : "PICNIC"}
        brand={preset === "reloop" ? "ReLoop" : "picnic club"}
        blurb={
          preset === "reloop"
            ? "Give Things a Second Life. Pre-owned circular marketplace for Davanagere."
            : "Small-batch snacks, packed by hand and delivered by bike every Saturday morning."
        }
        tagline={preset === "reloop" ? "Reuse · Rent · Exchange · Local Impact" : "Lunch, but make it an adventure."}
        actions={[
          { label: preset === "reloop" ? "Explore Listings" : "Build a basket", href: "/marketplace", icon: "sparkle", variant: "outline" },
          { label: preset === "reloop" ? "Give An Item" : "Order now", href: "/create-listing", icon: "heart", variant: "solid" },
        ]}
        crew={[
          { kind: "cat", letter: 0, seat: "front", offset: -0.36, name: "Patch", says: "I inspect every pre-loved item!" },
          { kind: "bird", letter: 1, seat: "top", name: "Pip", says: "Save trees, reuse books!" },
          { kind: "ghost", letter: 3, seat: "behind", name: "Boo", says: "Second hand, first rate." },
          { kind: "kid", letter: 4, seat: "top", offset: 0.05, name: "Juno", says: "Davanagere Campus hero!" },
          { kind: "yeti", letter: 5, seat: "front", offset: 0.4, scale: 0.92, flip: true, name: "Bruno", says: "Zero waste rocks!" },
        ]}
        doodles={["heart", "star", "sparkle", "sandwich", "heart"]}
        doodleCount={10}
        columns={[
          {
            title: "Marketplace",
            links: [
              { label: "Browse Items", href: "/marketplace" },
              { label: "Rent Gear", href: "/marketplace?type=rent" },
              { label: "Exchange", href: "/marketplace?type=exchange" },
            ],
          },
          {
            title: "Community",
            links: [
              { label: "Campus Hubs", href: "/map" },
              { label: "Impact Tracker", href: "/sustainability" },
              { label: "Safety & Trust", href: "/about" },
            ],
          },
          {
            title: "Davanagere",
            links: [
              { label: "BIET Campus", href: "/map" },
              { label: "MCC B Block", href: "/map" },
              { label: "support@reloop.in", href: "mailto:support@reloop.in" },
            ],
          },
        ]}
        copyright="© 2026 ReLoop · Circular Economy for Davanagere"
      />
    </div>
  );
}

export const DemoSunny = DoodleCrewFooterDemo;
export default DoodleCrewFooterDemo;
