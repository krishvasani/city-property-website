// Sample blog posts. In production these could move to Sanity (a `post` schema)
// — the listing + detail pages already read from this single source.
export interface BlogPost {
  slug: string;
  title: string;
  date: string; // ISO
  category: string;
  excerpt: string;
  body: string[]; // paragraphs
}

export const posts: BlogPost[] = [
  {
    slug: 'ahmedabad-market-update-this-month',
    title: 'Ahmedabad Market Update: What Buyers Should Watch This Month',
    date: '2026-06-01',
    category: 'Market update',
    excerpt:
      'Demand on the west side stays firm while new supply picks up along the Ring Road. Here’s what it means if you’re buying right now.',
    body: [
      'Ahmedabad’s western corridor, taking in SG Highway, Prahlad Nagar, Satellite and Bopal, continues to see steady end-user demand, especially for ready-to-move 3 BHK homes. Prices here have held firm rather than spiked, which is good news if you’re a genuine buyer rather than a speculator.',
      'The more interesting movement is along the Ring Road and the emerging Shela to Shantipura belt, where new project supply is coming online. More choice usually means more room to negotiate, particularly on payment schedules and what the developer throws in.',
      'Our advice this month: if you find the right home in an established locality, don’t over-wait for a correction that may not come. In newer areas, take your time, compare at least three options, and check RERA status before paying any token.',
    ],
  },
  {
    slug: 'best-localities-first-time-buyers-ahmedabad',
    title: 'Best Localities for First-Time Home Buyers in Ahmedabad',
    date: '2026-05-24',
    category: 'Buying tips',
    excerpt:
      'Where should you buy your first home in Ahmedabad? We compare value, commute and lifestyle across five popular pockets.',
    body: [
      'For first-time buyers, the right locality is the one that balances budget, commute and day-to-day convenience. In Ahmedabad, a few areas consistently work well.',
      'Bopal and South Bopal offer space and family-friendly living at gentler prices, with good schools nearby, ideal if you don’t need to be in the centre every day. Gota and Chandkheda are strong value plays on the north side, popular with younger buyers.',
      'If proximity to the business corridor matters, Satellite and Prahlad Nagar are more established (and pricier), while Shela gives you newer towers and villas for the money. Whatever you choose, visit at peak hour to feel the real commute before you commit.',
    ],
  },
  {
    slug: 'what-sellers-should-know-before-listing',
    title: 'What Sellers Should Know Before Listing Their Property',
    date: '2026-05-16',
    category: 'Selling tips',
    excerpt:
      'A little preparation makes a big difference to your final price. Five things to sort out before your property goes live.',
    body: [
      'The sellers who do best are the ones who prepare before listing, not after enquiries start coming in. First, get a realistic valuation based on recent deals in your exact locality, not the highest number a broker quotes to win your listing.',
      'Second, get your documents in order: title deed, approved plans, tax receipts and society NOC. Buyers (and their lawyers) move faster when nothing is missing. Third, fix the small stuff and clean thoroughly, because presentation genuinely moves price.',
      'Finally, invest in good photos and an honest, detailed listing. It brings more, and more serious, enquiries, which means a better price and a quicker, smoother sale.',
    ],
  },
  {
    slug: 'sg-highway-bopal-shela-gota-comparison',
    title: 'SG Highway, Bopal, Shela and Gota: A Quick Market Comparison',
    date: '2026-05-08',
    category: 'Locality report',
    excerpt:
      'Four of Ahmedabad’s most-searched areas, side by side, showing who each one suits and roughly what you’ll pay.',
    body: [
      'SG Highway is the commercial spine of west Ahmedabad, great for offices, retail and premium apartments, with everything on your doorstep but a higher price tag and busier roads.',
      'Bopal is the family favourite: more space per rupee, good schools, and a calmer pace, in exchange for a longer commute to the centre. Shela, right next door, is where much of the new villa and tower supply is, with modern stock at sensible prices.',
      'Gota, on the north-west, remains one of the better value entry points, popular with first-time buyers and investors betting on continued infrastructure growth. If you tell us your budget and priorities, we’ll point you to the right one.',
    ],
  },
  {
    slug: 'is-it-better-to-buy-or-rent-in-ahmedabad',
    title: 'Is It Better to Buy or Rent in Ahmedabad Right Now?',
    date: '2026-04-30',
    category: 'Investment insight',
    excerpt:
      'Rent or buy? It depends on how long you’ll stay and what you’d do with the difference. A simple way to think it through.',
    body: [
      'There’s no single right answer, it depends on your time horizon. If you’ll be in the city and the home for five years or more, buying usually makes sense in Ahmedabad, where rental yields are modest and ownership builds equity.',
      'If your plans are uncertain, or you’re still figuring out which locality fits, renting for a year is a smart, low-risk way to “try before you buy”. You’ll learn far more living somewhere than visiting it twice.',
      'Run the numbers honestly: total monthly cost of owning (EMI, maintenance, taxes) versus rent, and what you’d earn investing the down payment elsewhere. If you’d like, we’ll walk through it with you, no pressure.',
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
