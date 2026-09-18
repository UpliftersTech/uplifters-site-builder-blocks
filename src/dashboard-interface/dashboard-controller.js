import domReady from '@wordpress/dom-ready';
import {
	Component,
	createRoot,
	render,
	useEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { defaultBlocks, defaultCategories, BlocksPanel } from './blocks-tab';
import { OverviewPanel } from './overview-tab';
import { SettingsPanel } from './settings-tab';
import { Dashicon, EASE, SOFT_EASE, TAB_ORDER } from './dashboard-header';
import { createIcon as createDashboardBrandIcon } from '../assets-shared/icon-brand/dashboard-brand-icon';

const fallbackData = {
	version: '1.0.3',
	productName: 'Uplifters Website Builder',
	siteEditorUrl: '#',
	formAction: '',
	settingsUpdated: false,
	blocks: defaultBlocks,
	categories: defaultCategories,
	settings: {
		loginEnabled: false,
		bgId: 0,
		logoId: 0,
		bgUrl: '',
		logoUrl: '',
		nonceName: 'uplifters_site_builder_blocks_settings_nonce',
		nonce: '',
	},
};

const VALID_TABS = new Set(TAB_ORDER);

function getInitialTab(dashboardData) {
	const hashTab = window.location.hash.replace('#', '');

	if (VALID_TABS.has(hashTab)) {
		return hashTab;
	}

	if (dashboardData.settingsUpdated) {
		return 'settings';
	}

	return TAB_ORDER[0];
}

function removeSettingsUpdatedParam() {
	if (!window.history || typeof window.history.replaceState !== 'function') {
		return;
	}

	const url = new URL(window.location.href);
	url.searchParams.delete('settings-updated');

	window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}


function normalizeData(rawData) {
	const data = rawData && typeof rawData === 'object' ? rawData : {};
	return {
		...fallbackData,
		...data,
		blocks: Array.isArray(data.blocks) && data.blocks.length ? data.blocks : fallbackData.blocks,
		categories: Array.isArray(data.categories) && data.categories.length ? data.categories : fallbackData.categories,
		settings: {
			...fallbackData.settings,
			...(data.settings || {}),
		},
	};
}

function useRootClass(root, reduceMotion, activeTab) {
	useEffect(() => {
		if (!root) return undefined;

		root.classList.add('is-react-ready', 'is-motion-powered');
		root.classList.toggle('is-reduced-motion', Boolean(reduceMotion));

		return () => {
			root.classList.remove('is-react-ready', 'is-motion-powered', 'is-reduced-motion');
		};
	}, [root, reduceMotion]);

	useEffect(() => {
		if (!root) return undefined;

		const updateDashboardChrome = () => {
			const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
			// Overview's header sits over the hero until it is well past it. On the
			// other tabs the header is stuck from the first pixel, so content is
			// under it (and it needs its scrolled shadow) as soon as the page moves.
			const scrolledAfter = activeTab === 'overview' ? 72 : 0;

			root.classList.toggle('is-overview-tab', activeTab === 'overview');
			root.classList.toggle('is-dashboard-scrolled', scrollY > scrolledAfter);
			root.dataset.upliftersSiteBuilderBlocksActiveTab = activeTab;
		};

		updateDashboardChrome();
		window.addEventListener('scroll', updateDashboardChrome, { passive: true });
		window.addEventListener('resize', updateDashboardChrome);

		return () => {
			window.removeEventListener('scroll', updateDashboardChrome);
			window.removeEventListener('resize', updateDashboardChrome);
		};
	}, [root, activeTab]);
}

function useTabIndicator(activeTab) {
	const tabRefs = useRef({});
	const [indicator, setIndicator] = useState({ width: 0, x: 0 });

	useEffect(() => {
		const update = () => {
			const activeButton = tabRefs.current[activeTab];
			if (!activeButton) return;

			setIndicator({
				width: activeButton.offsetWidth,
				x: activeButton.offsetLeft,
			});
		};

		update();
		window.addEventListener('resize', update);

		let observer = null;
		if ('ResizeObserver' in window) {
			observer = new ResizeObserver(update);
			Object.values(tabRefs.current).forEach((button) => {
				if (button) observer.observe(button);
			});
		}

		return () => {
			window.removeEventListener('resize', update);
			if (observer) observer.disconnect();
		};
	}, [activeTab]);

	return [tabRefs, indicator];
}


/*
 * Brand hover, driven by Motion like the block cards' whileHover. The button
 * owns the "rest" / "hover" / "tap" state and the icon shell, its glow and the
 * product name inherit it as variants, so all three move on one clock.
 */
const BRAND_HOVER_TRANSITION = { duration: 0.55, ease: EASE };
const BRAND_TAP_TRANSITION = { duration: 0.18, ease: EASE };

const brandLiftVariants = {
	rest: { y: 0, scale: 1, transition: BRAND_HOVER_TRANSITION },
	hover: { y: -2, scale: 1.06, transition: BRAND_HOVER_TRANSITION },
	tap: { y: 0, scale: 0.97, transition: BRAND_TAP_TRANSITION },
};

const brandGlowVariants = {
	rest: { opacity: 0, transition: BRAND_HOVER_TRANSITION },
	hover: { opacity: 1, transition: BRAND_HOVER_TRANSITION },
	tap: { opacity: 1, transition: BRAND_TAP_TRANSITION },
};

/*
 * Icon shell background. It runs light at the top-left to a deeper sky blue at
 * the bottom-right, the same direction as the mark's own cyan-to-blue
 * gradient, so each part of the mark sits on a tone it contrasts with.
 */
const BRAND_ICON_SHELL_COLOR = '#A9E3F4';
const BRAND_ICON_SHELL_GRADIENT = 'linear-gradient(135deg, #FFFFFF 0%, #D9F5FC 32%, #A9E3F4 66%, #5EC4E6 100%)';

function DashboardBrandIcon() {
	const shellRef = useRef(null);
	const iconRef = useRef(null);

	useEffect(() => {
		const shell = shellRef.current;
		const container = iconRef.current;
		if (!shell || !container) return undefined;

		shell.style.setProperty('background-color', BRAND_ICON_SHELL_COLOR, 'important');
		shell.style.setProperty('background-image', BRAND_ICON_SHELL_GRADIENT, 'important');
		shell.style.setProperty('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.16), 0 1px 3px rgba(0, 0, 0, 0.1)', 'important');

		const icon = createDashboardBrandIcon({ size: 36 });
		if (!icon) return undefined;

		container.replaceChildren(icon);

		return () => {
			container.replaceChildren();
		};
	}, []);

	return (
		<motion.span
			ref={shellRef}
			className="uplifters-site-builder-blocks-brand-icon-shell"
			variants={brandLiftVariants}
			style={{
				position: 'relative',
				isolation: 'isolate',
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '3px',
				background: BRAND_ICON_SHELL_GRADIENT,
				borderRadius: '10px',
				boxShadow: '0 4px 12px rgba(0, 0, 0, 0.16), 0 1px 3px rgba(0, 0, 0, 0.1)',
				boxSizing: 'border-box',
				lineHeight: 0,
				flexShrink: 0,
			}}
			aria-hidden="true"
		>
			{/* The resting shadow above is set !important in the effect, so the
			    hover shadow is this separate layer, faded in underneath. */}
			<motion.span className="uplifters-site-builder-blocks-brand-icon-glow" variants={brandGlowVariants} />
			<span
				ref={iconRef}
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					lineHeight: 0,
				}}
			/>
		</motion.span>
	);
}

function Header({ activeTab, setActiveTab, blockCount, reduceMotion, productName }) {
	// Keyboard focus shows the hover state. :focus-visible keeps a mouse click,
	// which also focuses the button, from leaving the brand lifted.
	const [brandFocusVisible, setBrandFocusVisible] = useState(false);

	return (
		<header className="uplifters-site-builder-blocks-shellbar">
			<div className="uplifters-site-builder-blocks-shellbar-main">
				<motion.button
					type="button"
					className="uplifters-site-builder-blocks-brand uplifters-site-builder-blocks-brand-button"
					onClick={() => setActiveTab('overview')}
					onFocus={(event) => setBrandFocusVisible(event.currentTarget.matches(':focus-visible'))}
					onBlur={() => setBrandFocusVisible(false)}
					initial={false}
					animate={!reduceMotion && brandFocusVisible ? 'hover' : 'rest'}
					whileHover={reduceMotion ? undefined : 'hover'}
					whileTap={reduceMotion ? undefined : 'tap'}
				>
					<DashboardBrandIcon />
					<motion.span className="uplifters-site-builder-blocks-brand-name" variants={brandLiftVariants}>{productName}</motion.span>
				</motion.button>
			</div>
			<Tabs activeTab={activeTab} setActiveTab={setActiveTab} blockCount={blockCount} reduceMotion={reduceMotion} productName={productName} />
		</header>
	);
}

function Tabs({ activeTab, setActiveTab, blockCount, reduceMotion, productName }) {
	const [tabRefs, indicator] = useTabIndicator(activeTab);
	const tabs = [
		{ id: 'overview', label: __('Overview', 'uplifters-site-builder-blocks'), icon: 'admin-home' },
		{ id: 'blocks', label: __('All Blocks', 'uplifters-site-builder-blocks'), icon: 'screenoptions', badge: blockCount },
		{ id: 'settings', label: __('Settings', 'uplifters-site-builder-blocks'), icon: 'admin-generic' },
	];

	function onKeyDown(event, index) {
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

		event.preventDefault();
		let next = index;
		if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
		if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
		if (event.key === 'Home') next = 0;
		if (event.key === 'End') next = tabs.length - 1;

		setActiveTab(tabs[next].id);
		window.requestAnimationFrame(() => tabRefs.current[tabs[next].id]?.focus());
	}

	return (
		<nav className="uplifters-site-builder-blocks-tabs" aria-label={sprintf(__('%s sections', 'uplifters-site-builder-blocks'), productName)} role="tablist">
			{tabs.map((tab, index) => {
				const active = activeTab === tab.id;

				return (
					<button
						key={tab.id}
						id={`uplifters-site-builder-blocks-tab-${tab.id}`}
						ref={(node) => { tabRefs.current[tab.id] = node; }}
						className={active ? 'is-active' : undefined}
						type="button"
						role="tab"
						aria-selected={active}
						aria-controls={`uplifters-site-builder-blocks-${tab.id}`}
						tabIndex={active ? 0 : -1}
						onClick={() => setActiveTab(tab.id)}
						onKeyDown={(event) => onKeyDown(event, index)}
					>
						<Dashicon icon={tab.icon} />
						{tab.label}
						{tab.badge ? <b className="uplifters-site-builder-blocks-tab-badge">{tab.badge}</b> : null}
					</button>
				);
			})}
			<motion.span
				className="uplifters-site-builder-blocks-tab-indicator"
				aria-hidden="true"
				animate={{ width: indicator.width, x: indicator.x }}
				transition={reduceMotion ? { duration: 0 } : { duration: 0.34, ease: SOFT_EASE }}
			/>
		</nav>
	);
}


function SettingsSavedModal({ reduceMotion, productName, onClose }) {
	const closeRef = useRef(null);

	useEffect(() => {
		closeRef.current?.focus();

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [onClose]);

	return (
		<motion.div
			className="uplifters-site-builder-blocks-save-modal-overlay"
			role="presentation"
			initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
			transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: SOFT_EASE }}
		>
			<motion.section
				className="uplifters-site-builder-blocks-save-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="uplifters-site-builder-blocks-save-modal-title"
				aria-describedby="uplifters-site-builder-blocks-save-modal-description"
				initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.985 }}
				transition={reduceMotion ? { duration: 0 } : { duration: 0.34, ease: SOFT_EASE }}
			>
				<button
					type="button"
					className="uplifters-site-builder-blocks-save-modal-close"
					onClick={onClose}
					ref={closeRef}
					aria-label={__('Close settings saved message', 'uplifters-site-builder-blocks')}
				>
					<Dashicon icon="no-alt" />
				</button>

				<div className="uplifters-site-builder-blocks-save-modal-icon" aria-hidden="true">
					<Dashicon icon="saved" />
				</div>

				<p className="uplifters-site-builder-blocks-save-modal-kicker">{productName}</p>
				<h2 id="uplifters-site-builder-blocks-save-modal-title">{__('Settings saved successfully.', 'uplifters-site-builder-blocks')}</h2>
				<p id="uplifters-site-builder-blocks-save-modal-description">
					{__('Your dashboard settings are saved and ready. You can continue editing from the Settings tab.', 'uplifters-site-builder-blocks')}
				</p>

				<div className="uplifters-site-builder-blocks-save-modal-actions">
					<button type="button" className="uplifters-site-builder-blocks-button uplifters-site-builder-blocks-button-primary" onClick={onClose}>
						{__('Back to Settings', 'uplifters-site-builder-blocks')}
					</button>
				</div>
			</motion.section>
		</motion.div>
	);
}



class DashboardErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error) {
		return { error };
	}

	componentDidCatch(error, info) {
		if (window.console && typeof window.console.error === 'function') {
			window.console.error('Uplifters Website Builder dashboard render error:', error, info);
		}
	}

	render() {
		if (!this.state.error) {
			return this.props.children;
		}

		return (
			<div className="notice notice-error" style={{ maxWidth: '920px', margin: '32px auto', borderRadius: '10px' }}>
				<p><strong>{__('Uplifters Website Builder dashboard could not render.', 'uplifters-site-builder-blocks')}</strong></p>
				<p>{this.state.error?.message || __('An unexpected JavaScript error occurred.', 'uplifters-site-builder-blocks')}</p>
			</div>
		);
	}
}

function App({ root, data }) {
	const dashboardData = useMemo(() => normalizeData(data), [data]);
	const reduceMotion = useReducedMotion();
	const [activeTab, setActiveTab] = useState(() => getInitialTab(dashboardData));
	const [settingsSavedOpen, setSettingsSavedOpen] = useState(Boolean(dashboardData.settingsUpdated));

	const closeSettingsSavedModal = () => {
		setSettingsSavedOpen(false);
		removeSettingsUpdatedParam();
	};

	useRootClass(root, reduceMotion, activeTab);

	return (
		<>
			<Header
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				blockCount={dashboardData.blocks.length}
				reduceMotion={reduceMotion}
				productName={dashboardData.productName}
			/>

			<AnimatePresence>
				{settingsSavedOpen ? (
					<SettingsSavedModal
						reduceMotion={reduceMotion}
						productName={dashboardData.productName}
						onClose={closeSettingsSavedModal}
					/>
				) : null}
			</AnimatePresence>

			<main className="uplifters-site-builder-blocks-app">
				<div className="uplifters-site-builder-blocks-panels">
					<AnimatePresence mode="wait" initial={false}>
						{activeTab === 'overview' ? <OverviewPanel key="overview" siteEditorUrl={dashboardData.siteEditorUrl} setActiveTab={setActiveTab} reduceMotion={reduceMotion} productName={dashboardData.productName} /> : null}
						{activeTab === 'blocks' ? <BlocksPanel key="blocks" blocks={dashboardData.blocks} categories={dashboardData.categories} reduceMotion={reduceMotion} /> : null}
						{activeTab === 'settings' ? <SettingsPanel key="settings" settings={dashboardData.settings} formAction={dashboardData.formAction} reduceMotion={reduceMotion} /> : null}
					</AnimatePresence>
				</div>
			</main>

			<footer className="uplifters-site-builder-blocks-footer"><span>{dashboardData.productName} · {__('Built for modern WordPress', 'uplifters-site-builder-blocks')}</span><span>{__('Lightweight · Responsive · Native', 'uplifters-site-builder-blocks')}</span></footer>
		</>
	);
}

domReady(() => {
	const root = document.getElementById('uplifters-site-builder-blocks-dashboard');
	if (!root) return;

	const data = window.upliftersSiteBuilderBlocksDashboardControllerData || window.upliftersSiteBuilderBlocksDashboardData || window.upliftersSiteBuilderBlocksPageData || {};
	const dashboard = (
		<DashboardErrorBoundary>
			<App root={root} data={data} />
		</DashboardErrorBoundary>
	);

	try {
		if (typeof createRoot === 'function') {
			createRoot(root).render(dashboard);
			return;
		}

		if (typeof render === 'function') {
			render(dashboard, root);
			return;
		}

		throw new Error('WordPress React renderer is unavailable.');
	} catch (error) {
		if (window.console && typeof window.console.error === 'function') {
			window.console.error('Uplifters Website Builder dashboard mount error:', error);
		}

		root.innerHTML = '';
		const notice = document.createElement('div');
		notice.className = 'notice notice-error';
		notice.style.cssText = 'max-width:920px;margin:32px auto;border-radius:10px;';
		const message = error && error.message ? error.message : 'An unexpected JavaScript error occurred.';
		notice.textContent = `Uplifters Website Builder dashboard could not start: ${message}`;
		root.appendChild(notice);
	}
});
