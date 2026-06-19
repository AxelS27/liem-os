import Image from 'next/image';

import logo from '@/app/icon.png';
import { FooterScrollHandler } from '@/components/shared/footer-scroll-handler';
import { defaultLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

/**
 * Public footer endcap: a surface band with a top border, a brand block, structured link
 * columns, and a bottom bar with copyright and legal links. It reads as a deliberate page
 * ending, not stray muted text, and stays consistent across every public route. As a server
 * component it loads its own strings from the dictionary (ADR-010).
 */
export async function SiteFooter() {
  const t = await getDictionary(defaultLocale);
  const s = t.footer.sections;

  const footerSections = [
    {
      title: s.product.title,
      links: [
        { label: s.product.features, href: '/features' },
        { label: s.product.pricing, href: '/pricing' },
        { label: s.product.changelog, href: '/changelog' },
      ],
    },
    {
      title: s.resources.title,
      links: [
        { label: s.resources.documentation, href: '/docs' },
        { label: s.resources.guides, href: '/guides' },
        { label: s.resources.blog, href: '/blog' },
      ],
    },
    {
      title: s.company.title,
      links: [
        { label: s.company.about, href: '/about' },
        { label: s.company.careers, href: '/careers' },
        { label: s.company.contact, href: '/contact' },
      ],
    },
  ];

  return (
    <footer className="border-border bg-secondary/30 border-t">
      <FooterScrollHandler>
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div className="max-w-sm">
              <a href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
                <Image src={logo} alt="" width={28} height={28} className="h-7 w-7 rounded-md" />
                <span>{t.app.name}</span>
              </a>
              <p className="text-muted-foreground mt-4 text-sm">{t.footer.description}</p>
            </div>
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-foreground text-sm font-semibold">{section.title}</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-border text-muted-foreground mt-12 flex flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} {t.app.name}. {t.footer.rights}
            </span>
            <nav aria-label="Legal" className="flex gap-6">
              <a href="/privacy" className="hover:text-foreground transition-colors">
                {t.footer.privacy}
              </a>
              <a href="/terms" className="hover:text-foreground transition-colors">
                {t.footer.terms}
              </a>
            </nav>
          </div>
        </div>
      </FooterScrollHandler>
    </footer>
  );
}
