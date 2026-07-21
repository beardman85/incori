/**
 * Single source of truth for site-wide constants:
 * organization identity, contact details, navigation, and social links.
 * Recovered from the WordPress export + live incori.org.
 */

export const site = {
  name: 'Inclusion Oriented',
  legalName: 'Inclusion Oriented Inc.',
  tagline: 'Ground for Strength',
  shortDescription:
    'A certified developmental-disabilities service provider in Omaha, Nebraska — empowering individuals and strengthening community.',
  url: 'https://www.incori.org',
  foundedYear: 2019,
  credit: 'Beardman Design LLC',
  creditUrl: 'https://bdxomaha.com',
} as const;

export const legalLinks: { label: string; href: string }[] = [
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Terms of Service', href: '/terms-of-service/' },
];

export const contact = {
  phone: '531-225-5858',
  phoneHref: 'tel:+15312255858',
  email: 'hello@incori.org',
  emailHref: 'mailto:hello@incori.org',
  address: {
    street: '3925 S 147th Street, Suite #117',
    city: 'Omaha',
    state: 'NE',
    zip: '68144',
    country: 'US',
  },
  mapHref:
    'https://www.google.com/maps/search/?api=1&query=3925+S+147th+Street+Suite+117+Omaha+NE+68144',
} as const;

export type NavLink = { label: string; href: string };

export const primaryNav: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about/' },
  { label: 'Services', href: '/services/' },
  { label: 'Work With Us', href: '/work-with-us/' },
  { label: 'Resources', href: '/resources/' },
];

export const cta = {
  label: 'Request Services',
  href: '/request-services/',
} as const;

/** Footer "quick links" — a superset of the primary nav plus conversion pages. */
export const footerLinks: NavLink[] = [
  { label: 'Request Services', href: '/request-services/' },
  { label: 'Apply Today', href: '/apply/' },
  { label: 'Volunteer', href: '/volunteer/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'About Us', href: '/about/' },
];

export type SocialLink = { label: string; href: string; icon: 'facebook' | 'instagram' | 'twitter' | 'linkedin' };

export const social: SocialLink[] = [
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61573168157552', icon: 'facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/inclusion_oriented/', icon: 'instagram' },
];
