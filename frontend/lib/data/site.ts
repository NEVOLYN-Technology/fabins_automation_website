/**
 * NAVIGATION — the one list of page sections, shared by the navbar and the footer.
 *
 * WHY THIS FILE EXISTS
 * The navbar and the footer previously each declared their own copy of the nav
 * list. Adding a section meant editing both, and forgetting one left the footer
 * silently out of date. Both now read from here.
 *
 * ─── TO ADD A SECTION TO THE SITE ───────────────────────────────────────────
 *   1. Create the component in `components/sections/`.
 *   2. Give its root `<section>` an `id`.
 *   3. Render it in `app/page.tsx` in the right position.
 *   4. Add one entry to `NAV_LINKS` below, in the same order as the page.
 * The navbar link, the footer link, and the scroll-spy highlight all follow
 * automatically — there is nothing else to wire up.
 */

export interface NavLink {
  /** Visible link text. */
  name: string
  /** Must exactly match the `id` attribute of the target `<section>`. */
  id: string
}

/** Primary navigation, in the same top-to-bottom order as the page. */
export const NAV_LINKS: readonly NavLink[] = [
  { name: 'Home', id: 'home' },
  { name: 'About', id: 'about' },
  { name: 'System', id: 'system' },
  { name: 'Standards', id: 'standards' },
  { name: 'Innovators', id: 'innovators' },
  { name: 'News', id: 'news' },
]

/**
 * The contact call-to-action. Kept out of `NAV_LINKS` because it is rendered as
 * a button rather than a plain link, and carries a different label in the footer.
 */
export const PRIMARY_CTA = { name: "Let's Connect", id: 'contact' } as const

/**
 * Every section the scroll-spy tracks: the nav links plus the contact section.
 * Without the trailing contact id the navbar would keep "Innovators" highlighted
 * all the way to the bottom of the page.
 */
export const SECTION_IDS: readonly string[] = [
  ...NAV_LINKS.map((link) => link.id),
  PRIMARY_CTA.id,
]

/**
 * Footer link list: same destinations as the navbar, minus "Home" (the footer
 * wordmark already scrolls to the top) and with a more explicit CTA label.
 */
export const FOOTER_LINKS: readonly NavLink[] = [
  ...NAV_LINKS.filter((link) => link.id !== 'home'),
]