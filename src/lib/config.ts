// Business + integration config, read from PUBLIC_* env vars with safe
// placeholder defaults so the site runs before real values are supplied.
// Set the real values in .env (local) and the Netlify/Vercel dashboard.

const env = import.meta.env;

export const site = {
  name: 'City Property Services',
  tagline: 'Property in Ahmedabad',
  rera: 'AG/GJ/AHMEDABAD/AHMADABADCITY/AUDA/AA00003/220329R2',
  url: env.SITE_URL || 'https://cityprop.co.in',
  /** Year the firm was founded (owner-confirmed). Single source of truth for
   *  every "N years" claim — use `yearsInBusiness`, never a literal. */
  foundedYear: 1998,
  /** Completed years since founding, at build time (2026 → 28). */
  get yearsInBusiness() {
    return new Date().getFullYear() - this.foundedYear;
  },
  /** "28+" — the display form used in stats and copy. */
  get yearsLabel() {
    return `${this.yearsInBusiness}+`;
  },
};

export const contact = {
  /** Digits-only international number for wa.me links. */
  whatsapp: env.PUBLIC_WHATSAPP || '919824900778',
  /** Human-readable number for tel: links. */
  phone: env.PUBLIC_PHONE || '+91 98249 00778',
  /** Same number in E.164 (structured data). */
  get phoneE164() {
    return '+' + this.phone.replace(/[^\d]/g, '');
  },
  email: env.PUBLIC_LEAD_EMAIL || 'coordinator@cityprop.co.in',
  /** Office address. */
  address: '703 & 704 Zion Prime, Near Copper Stone, Thaltej Shilaj Road, Ahmedabad, Gujarat 380059',
  postalCode: '380059',
  /** Office location details for LocalBusiness structured data. */
  office: {
    // Zion Prime, Thaltej-Shilaj Road (Mappls listing for the building).
    lat: 23.051225,
    lng: 72.492735,
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Zion+Prime%2C+Thaltej+Shilaj+Road%2C+Ahmedabad+380059',
    /** Owner-confirmed. Monday–Saturday 09:30–19:00, Sunday closed. */
    hours: [
      { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:30', closes: '19:00' },
      { days: ['Sunday'], opens: '00:00', closes: '00:00' }, // closed
    ],
    hoursText: 'Monday to Saturday, 9:30 am to 7 pm. Closed on Sunday.',
  },
};

/** Social profiles. */
export const social = {
  instagram: 'https://www.instagram.com/citypropertyservices.in/',
  linkedin: 'https://in.linkedin.com/company/city-propertyservices',
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

/**
 * Base64 payload for a WhatsApp link, so the raw number never appears in the
 * static HTML (anti-scrape). Rendered as `data-wa` on an anchor; the shared
 * script (src/scripts/site.js) decodes it and opens WhatsApp on real clicks.
 * Spam bots that harvest `wa.me/<number>` from page source get nothing.
 */
export function waPayload(message: string, number = contact.whatsapp): string {
  const raw = `${number}?text=${encodeURIComponent(message)}`;
  return Buffer.from(raw, 'utf8').toString('base64');
}

/** Build a tel: URL (strips spaces/dashes). */
export function telUrl(number = contact.phone): string {
  return `tel:${number.replace(/[^\d+]/g, '')}`;
}
