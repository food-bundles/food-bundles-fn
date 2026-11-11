import Link from "next/link";

const COLUMNS = [
  {
    title: "Market",
    links: [
      { label: "Shop", href: "/shop" },
      { label: "Price comparison", href: "/price-comparison" },
      { label: "Food Bundles Card", href: "/apply-voucher" },
      { label: "Stories", href: "/stories" },
    ],
  },
  {
    title: "Join",
    links: [
      { label: "Restaurants, hotels & schools", href: "/signup?role=restaurant" },
      { label: "Farmers & cooperatives", href: "/signup?role=farmer" },
      { label: "Log in", href: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Refund policy", href: "/refund-policy" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "/support" },
      { label: "WhatsApp 0796 897 823", href: "https://wa.me/250796897823" },
      { label: "sales@food.rw", href: "mailto:sales@food.rw" },
      { label: "Instagram", href: "https://www.instagram.com/foodbundlesrw/" },
    ],
  },
];

export function HomeFooter() {
  return (
    <footer className="border-t border-[#DCE6DF] print:hidden">
      <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-8 px-4 pb-10 pt-12 sm:px-8 md:grid-cols-4">
        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h2 className="fb-display m-0 text-[15px] font-bold">{col.title}</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {col.links.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith("/") ? (
                    <Link href={l.href} className="text-[15px] text-[#4A6358] hover:text-[#007A35]">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-[15px] text-[#4A6358] hover:text-[#007A35]">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-3 border-t border-[#DCE6DF] px-4 pb-24 pt-6 text-sm text-[#4A6358] sm:px-8">
        <span>Food Bundles Ltd · KG 5 Ave, Kigali</span>
        <span>© {new Date().getFullYear()} Food Bundles</span>
      </div>
    </footer>
  );
}
