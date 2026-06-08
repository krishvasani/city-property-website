# City Property Services — Admin (Decap CMS) Setup

This site has a free, Git based content editor (Decap CMS, formerly Netlify CMS).
Employees can add and edit **properties** and **blog posts**, and upload images,
without touching code. Every save becomes a commit in the GitHub repository and
Netlify rebuilds the public site automatically.

- **Admin URL:** `https://city-property-ahmedabad.netlify.app/cps-admin/`
- There is also a discreet **Employee login** link in the website footer.
- **Cost:** free. Decap CMS, GitHub storage and Netlify hosting are all on free
  tiers. No paid CMS, database, image host or auth service is used.

---

## 1. One time authentication setup (do this once)

The editor uses the **GitHub backend**: editors sign in with a GitHub account
that has write access to the repo. You set up a GitHub OAuth app once and tell
Netlify about it, then anyone you invite to the repo can log in.

### Step A — Create a GitHub OAuth app
1. Go to GitHub → your profile → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name:** `City Property Services Admin`
   - **Homepage URL:** `https://city-property-ahmedabad.netlify.app`
   - **Authorization callback URL:** `https://api.netlify.com/auth/done`
3. Create it, then **copy the Client ID** and **generate a Client Secret**.

### Step B — Register the provider in Netlify
1. In Netlify, open the site → **Site configuration → Access & security → OAuth**
   (older UI: *Access control → OAuth*).
2. **Install provider → GitHub**, paste the **Client ID** and **Client Secret**
   from Step A, and save.

That is the whole setup. Decap's GitHub backend now uses Netlify to handle the
login, so no secrets live in the website code.

### Step C — Give an employee access
The person must be a **collaborator on the GitHub repo** with write access:
1. GitHub → repo **`krishvasani/city-property-website`** → **Settings → Collaborators → Add people**.
2. They accept the email invite, then open `/cps-admin/` and click **Login with GitHub**.

> Note on free tiers: GitHub OAuth and Netlify hosting are free. Private repos
> allow a limited number of free collaborators; if you add many editors you may
> need them on a GitHub team. Nothing here charges automatically.

### Alternative (no GitHub accounts for staff)
If you would rather invite staff by email without GitHub accounts, you can switch
to **Netlify Identity + Git Gateway** instead:
1. In `public/cps-admin/config.yml`, change the `backend` block to:
   ```yaml
   backend:
     name: git-gateway
     branch: main
   ```
2. In `public/cps-admin/index.html`, add before `</body>`:
   `<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>`
3. In Netlify enable **Identity**, then **Identity → Services → Git Gateway**,
   and invite users by email under **Identity → Invite users**.

> Caveat: Netlify Identity is a legacy feature. It still works on existing sites
> but Netlify no longer recommends it for new ones, so the GitHub backend above
> is the safer long term choice.

---

## 2. How to log in

1. Open `https://city-property-ahmedabad.netlify.app/cps-admin/`
   (or click **Employee login** in the footer).
2. Click **Login with GitHub** and authorise.
3. You will see two collections: **Properties** and **Blog Posts**.

---

## 3. Adding or editing a blog post

1. Open **Blog Posts → New Blog Post** (or click an existing post).
2. Fill in the title, date, category, excerpt and body. Use `##` for section
   headings in the body.
3. **Cover image:** click the image field and **Upload** a photo. Add **alt text**.
4. Set **Featured** if you want it highlighted; leave **Draft** off to publish.
5. Click **Publish → Publish now**.

Newest posts appear first automatically. **Draft** posts never show on the site.

## 4. Adding or editing a property

1. Open **Properties → New Property** (or click an existing one).
2. Required: **Title**, **Slug**, **Listing type** (sale / rent / lease),
   **Property type**, **Price (display)** and **Locality**.
   - Keep the **Slug** lowercase with dashes, and **do not change it after
     publishing** or the link will break.
3. Fill in any details that apply (beds, area, amenities, description, and the
   commercial or industrial fields like ceiling height or road width). Empty
   fields simply do not show on the page.
4. **Images:** use **Main image** for the headline photo and **Image gallery**
   for more. Each image has an **alt text** field.
5. **Featured on homepage** controls the homepage highlight. **Draft** hides the
   listing entirely.
6. To mark a listing **Sold / Rented / Leased**, set the **Status label** field
   (e.g. `Sold`). To remove it from the site, turn on **Draft**.
7. Click **Publish → Publish now**.

### Where listings show up
- **Buy page:** sale listings only.
- **Rent page:** rent and lease listings.
- **Map page:** all published listings.
- **Homepage featured:** published listings with **Featured** on.
- Draft listings never appear anywhere.

## 5. How images work

- Uploads are stored in the repository under `public/uploads/blog` and
  `public/uploads/properties` and served from `/uploads/...` after deploy.
- Images are committed to Git like any other content. No external image host.
- Add alt text on every image for accessibility and SEO.

## 6. Drafts and published status

- **Draft = on** hides a post or property from the public site.
- **Draft = off** publishes it on the next build.
- For properties, **Featured** controls the homepage section.

## 7. What happens after you click Publish

1. Decap commits your change to the GitHub repo (`main` branch).
2. Netlify detects the commit and **rebuilds the site automatically**.
3. The change is live usually within **1 to 3 minutes**.

## 8. If a change does not appear immediately

- Wait 1 to 3 minutes for the rebuild, then hard refresh (Cmd/Ctrl + Shift + R).
- Check Netlify → **Deploys** to see if the build is running, queued or failed.
- Make sure **Draft** is off and, for properties, that the **Listing type**
  matches the page you are checking (sale for Buy, rent/lease for Rent).

## 9. Testing the editor locally (optional, for developers)

```bash
npx decap-server          # in one terminal
npm run dev               # in another
# open http://localhost:4321/cps-admin/  (uses the local Git backend)
```
`local_backend: true` in the config enables this and does not affect production.

---

## Technical notes (for developers)

- Content lives in **Astro Content Collections**:
  - Blog: `src/content/blog/*.md` (Markdown + frontmatter)
  - Properties: `src/content/properties/*.json`
- The site reads them via `src/lib/data.ts` (properties) and the blog pages.
  Sanity is no longer used as the content source.
- Schemas: `src/content/config.ts`. CMS fields: `public/cps-admin/config.yml`.
- Localities remain in `src/data/localities.ts`; the property **Locality** field
  is free text plus a slug, so keep names consistent with that dataset.
