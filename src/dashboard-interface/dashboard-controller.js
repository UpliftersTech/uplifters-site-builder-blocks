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
import { Dashicon, SOFT_EASE, TAB_ORDER } from './dashboard-header';
import { createIcon as createDashboardBrandIcon } from '../assets-shared/brand-icon/dashboard-brand-icon';

const fallbackData = {
	version: '1.0.0',
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

			root.classList.toggle('is-overview-tab', activeTab === 'overview');
			root.classList.toggle('is-dashboard-scrolled', scrollY > 72);
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


function DashboardBrandIcon() {
	const shellRef = useRef(null);
	const iconRef = useRef(null);

	useEffect(() => {
		const shell = shellRef.current;
		const container = iconRef.current;
		if (!shell || !container) return undefined;

		shell.style.setProperty('background-color', '#B5E8F5', 'important');
		shell.style.setProperty('background-image', 'none', 'important');

		const icon = createDashboardBrandIcon();
		if (!icon) return undefined;

		container.replaceChildren(icon);

		return () => {
			container.replaceChildren();
		};
	}, []);

	return (
		<span
			ref={shellRef}
			className="uplifters-site-builder-blocks-brand-icon-shell"
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '3px',
				background: '#B5E8F5',
				borderRadius: '10px',
				boxSizing: 'border-box',
				lineHeight: 0,
				flexShrink: 0,
			}}
			aria-hidden="true"
		>
			<span
				ref={iconRef}
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					lineHeight: 0,
				}}
			/>
		</span>
	);
}

function Header({ activeTab, setActiveTab, blockCount, reduceMotion, productName }) {
	return (
		<header className="uplifters-site-builder-blocks-shellbar">
			<div className="uplifters-site-builder-blocks-shellbar-main">
				<button
					type="button"
					className="uplifters-site-builder-blocks-brand uplifters-site-builder-blocks-brand-button"
					onClick={() => setActiveTab('overview')}
				>
					<DashboardBrandIcon />
					<span className="uplifters-site-builder-blocks-brand-name">{productName}</span>
				</button>
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
