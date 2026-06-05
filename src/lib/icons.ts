// Centralized inline-SVG icon set, lifted verbatim from the design bundle.
// Each entry is the *inner* markup of a 24x24, currentColor, no-fill stroke icon.
// Rendered by src/components/Icon.astro. Stroke-width defaults to 1.7 (override
// per-icon via the `sw` prop) to match the original thin-line set.

export const ICONS: Record<string, string> = {
  // search
  search:
    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  // save / favorite (outline). Filled variant handled inline on cards.
  heart:
    '<path d="M12 21s-7.5-4.6-10-9.2C.4 8.6 2 5 5.5 5 7.7 5 9 6.2 12 9c3-2.8 4.3-4 6.5-4C22 5 23.6 8.6 22 11.8 19.5 16.4 12 21 12 21z"/>',
  // location pin (sky-colored on cards)
  pin:
    '<path d="M12 21c4-4.5 7-7.6 7-11a7 7 0 1 0-14 0c0 3.4 3 6.5 7 11z"/><circle cx="12" cy="10" r="2.4"/>',
  bed:
    '<path d="M3 12V7a2 2 0 0 1 2-2h4v4M3 12h18v5M3 17v2m18-2v2"/>',
  bath:
    '<path d="M6 12V6a2 2 0 0 1 2-2h2M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/>',
  ruler:
    '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  furnished:
    '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 10v10"/>',
  plot:
    '<path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5"/>',
  // property-type tiles
  residential:
    '<path d="M4 21V9l8-5 8 5v12M9 21v-6h6v6"/>',
  commercial:
    '<path d="M3 21V7l7-3v17M14 21V11l7-3v13M3 21h18M7 9v0M7 13v0M7 17v0"/>',
  land:
    '<path d="M3 20h18M5 20l3-9 4 3 3-7 4 13"/>',
  industrial:
    '<path d="M3 21V11l6-3v3l6-3v3l6-3v13M7 21v-4M13 21v-4M19 21v-4"/>',
  warehousing:
    '<path d="M3 21V9l9-5 9 5v12M3 21h18M8 21v-7h8v7"/>',
  // investments — upward trend / growth
  investment:
    '<path d="M4 19h16M4 19V5M8 15l3-3 3 2 5-6M16 7h4v4"/>',
  // detail facts
  floor:
    '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M8 7h0M12 7h0M8 11h0M12 11h0M8 15h0M12 15h0"/>',
  clock:
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  compass:
    '<path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="9"/>',
  parking:
    '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 6V4m8 2V4"/>',
  furnishing:
    '<path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6"/>',
  // actions
  filters:
    '<path d="M4 6h16M7 12h10M10 18h4"/>',
  share:
    '<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/>',
  phone:
    '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  whatsapp:
    '<path d="M4 20l1.4-4A8 8 0 1 1 9 19.2L4 20z"/><path d="M9 9c0 4 2 6 6 6"/>',
  check:
    '<path d="m5 12 4 4 10-10"/>',
  // nav
  menu:
    '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close:
    '<path d="M6 6l12 12M18 6 6 18"/>',
  arrowRight:
    '<path d="M5 12h14M13 6l6 6-6 6"/>',
};

export type IconName = keyof typeof ICONS;
