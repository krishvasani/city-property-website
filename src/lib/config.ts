// Business + integration config, read from PUBLIC_* env vars with safe
// placeholder defaults so the site runs before real values are supplied.
// Set the real values in .env (local) and the Netlify/Vercel dashboard.

const env = import.meta.env;

export const site = {
  name: 'City Property Services',
  tagline: 'Property in Ahmedabad',
  rera: 'GJ/RERA/XXXXX',
  url: env.SITE_URL || 'https://cityproperty.example.com',
};

export const contact = {
  /** Digits-only international number for wa.me links. */
  whatsapp: env.PUBLIC_WHATSAPP || '919876543210',
  /** Human-readable number for tel: links. */
  phone: env.PUBLIC_PHONE || '+91 98765 43210',
  email: env.PUBLIC_LEAD_EMAIL || 'leads@cityproperty.example.com',
};

export const map = {
  token: env.PUBLIC_MAPBOX_TOKEN || '',
  style: env.PUBLIC_MAPBOX_STYLE || 'mapbox://styles/mapbox/light-v11',
  get enabled() {
    return Boolean(this.token);
  },
};

/** Build a wa.me click-to-chat URL with a prefilled message. */
export function whatsappUrl(message: string, number = contact.whatsapp): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Build a tel: URL (strips spaces/dashes). */
export function telUrl(number = contact.phone): string {
  return `tel:${number.replace(/[^\d+]/g, '')}`;
}
