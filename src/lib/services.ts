// The six service verticals City Property Services covers. Used by the nav
// dropdown, the /services overview page and the footer so they stay in sync.
export interface ServiceLink {
  key: string;
  label: string;
  href: string;
  icon: string;
  /** Short, friendly one liner for the overview cards. */
  blurb: string;
  /** Category in the property data to pull related listings from, if any. */
  category?: string | null;
}

export const serviceLinks: ServiceLink[] = [
  {
    key: 'corporate',
    label: 'Corporate',
    href: '/services/corporate',
    icon: 'commercial',
    blurb: 'Offices and corporate spaces to lease or buy, from compact startup floors to full buildings.',
    category: 'commercial',
  },
  {
    key: 'retail',
    label: 'Retail',
    href: '/services/retail',
    icon: 'retail',
    blurb: 'High visibility shops, showrooms and food and beverage spaces where customers can find you.',
    category: 'commercial',
  },
  {
    key: 'industrial-warehouse',
    label: 'Industrial & Warehouse',
    href: '/services/industrial-warehouse',
    icon: 'warehousing',
    blurb: 'Warehouses, sheds, cold storage and industrial land across Ahmedabad’s logistics belts.',
    category: 'industrial',
  },
  {
    key: 'investment',
    label: 'Investment',
    href: '/services/investment',
    icon: 'investment',
    blurb: 'Preleased assets and prelaunch opportunities chosen for steady income and long term growth.',
    category: 'investment',
  },
  {
    key: 'residential',
    label: 'Residential',
    href: '/services/residential',
    icon: 'residential',
    blurb: 'Homes to buy, sell, rent or lease, matched to your locality, budget and lifestyle.',
    category: 'residential',
  },
  {
    key: 'land',
    label: 'Land',
    href: '/services/land',
    icon: 'land',
    blurb: 'Plots and land parcels for homes, business, industry and investment, with the checks done right.',
    category: 'land',
  },
];
