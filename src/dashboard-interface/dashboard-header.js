export const EASE = [0.22, 1, 0.36, 1];
export const SOFT_EASE = [0.16, 1, 0.3, 1];
export const TAB_ORDER = ['overview', 'blocks', 'settings'];
export const DEVICE_ORDER = ['desktop', 'tablet', 'mobile'];
export const THEME_ORDER = ['violet', 'sunset', 'forest'];


export function cn(...parts) {
	return parts.filter(Boolean).join(' ');
}

export function Dashicon({ icon }) {
	return <span className={`dashicons dashicons-${icon}`} aria-hidden="true" />;
}


export function revealProps(reduceMotion, delay = 0) {
	if (reduceMotion) return {};

	return {
		initial: { opacity: 0, y: 22, filter: 'blur(8px)' },
		whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
		viewport: { once: true, amount: 0.18 },
		transition: { duration: 0.55, delay, ease: EASE },
	};
}

export function panelEnterProps(reduceMotion) {
	if (reduceMotion) return {};

	return {
		initial: { opacity: 0, y: 16 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -8 },
		transition: { duration: 0.38, ease: EASE },
	};
}


export function SectionHeading({ eyebrow, title, children }) {
	return (
		<div className="uplifters-site-builder-blocks-section-heading">
			<div><span>{eyebrow}</span><h2>{title}</h2></div>
			{children ? <p>{children}</p> : null}
		</div>
	);
}
