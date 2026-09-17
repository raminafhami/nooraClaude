/**
 * Single source of truth for customer branding assets.
 *
 * The supplied logo is square (1280x1280), so both placements below size it
 * 1:1 - do not give it a wide box or it will be letterboxed.
 *
 * The logo is referenced by public path (not a static import) so that swapping
 * a customer's logo is a matter of dropping a file into `public/images/` -
 * no code change and no build failure while the file is being replaced.
 */
const CUSTOMER_LOGO = {
	src: process.env.NEXT_PUBLIC_CUSTOMER_LOGO ?? "/images/customer-logo.png",
	alt: process.env.NEXT_PUBLIC_CUSTOMER_NAME ?? "",
} as const;

export { CUSTOMER_LOGO };
