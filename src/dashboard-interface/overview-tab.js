import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { motion } from 'motion/react';

import {
	cn,
	Dashicon,
	DEVICE_ORDER,
	EASE,
	THEME_ORDER,
} from './dashboard-header';

function SparkField({ reduceMotion }) {
	if (reduceMotion) return null;

	return (
		<div className="uplifters-site-builder-blocks-spark-field" aria-hidden="true">
			{Array.from({ length: 16 }).map((_, index) => (
				<motion.span
					key={index}
					className="uplifters-site-builder-blocks-spark"
					style={{
						'--spark-x': `${7 + ((index * 23) % 86)}%`,
						'--spark-y': `${9 + ((index * 37) % 78)}%`,
					}}
					animate={{ opacity: [0, 0.82, 0], scale: [0.4, 1, 0.4], y: [8, -8, 8] }}
					transition={{ duration: 3.2 + (index % 4) * 0.28, repeat: Infinity, delay: index * 0.16, ease: 'easeInOut' }}
				/>
			))}
		</div>
	);
}

function Hero({ siteEditorUrl = '#', setActiveTab = () => {}, reduceMotion = false, productName = 'Uplifters Website Builder' }) {
	const [spot, setSpot] = useState({ x: '70%', y: '22%' });
	const [device, setDevice] = useState('desktop');
	const [theme, setTheme] = useState('violet');
	const [isHeroPaused, setIsHeroPaused] = useState(false);
	const [deviceSwitchKey, setDeviceSwitchKey] = useState(0);
	const [themePulseKey, setThemePulseKey] = useState(0);

	useEffect(() => {
		if (reduceMotion || isHeroPaused) return undefined;

		if (!Array.isArray(DEVICE_ORDER) || DEVICE_ORDER.length === 0 || !Array.isArray(THEME_ORDER) || THEME_ORDER.length === 0) {
			return undefined;
		}

		const timer = window.setInterval(() => {
			setDevice((current) => {
				const currentIndex = DEVICE_ORDER.indexOf(current);
				const safeIndex = currentIndex >= 0 ? currentIndex : 0;
				return DEVICE_ORDER[(safeIndex + 1) % DEVICE_ORDER.length];
			});
			setDeviceSwitchKey((key) => key + 1);

			setTheme((current) => {
				const currentIndex = THEME_ORDER.indexOf(current);
				const safeIndex = currentIndex >= 0 ? currentIndex : 0;
				return THEME_ORDER[(safeIndex + 1) % THEME_ORDER.length];
			});
			setThemePulseKey((key) => key + 1);
		}, 2600);

		return () => window.clearInterval(timer);
	}, [isHeroPaused, reduceMotion]);

	function updateSpot(event) {
		if (reduceMotion) return;
		const rect = event.currentTarget.getBoundingClientRect();
		setSpot({
			x: `${((event.clientX - rect.left) / rect.width) * 100}%`,
			y: `${((event.clientY - rect.top) / rect.height) * 100}%`,
		});
	}

	function chooseDevice(nextDevice) {
		if (!DEVICE_ORDER.includes(nextDevice)) return;
		setDevice(nextDevice);
		setDeviceSwitchKey((key) => key + 1);
	}

	function chooseTheme(nextTheme) {
		if (!THEME_ORDER.includes(nextTheme)) return;
		setTheme(nextTheme);
		setThemePulseKey((key) => key + 1);
	}

	function pauseViewportMotion() {
		setIsHeroPaused(true);
	}

	function resumeViewportMotion() {
		setIsHeroPaused(false);
	}

	function resumeIfViewportFocusLeaves(event) {
		const nextTarget = event.relatedTarget;
		if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
		resumeViewportMotion();
	}

	return (
		<section
			className="uplifters-site-builder-blocks-hero uplifters-site-builder-blocks-hero-dynamic"
			aria-labelledby="uplifters-site-builder-blocks-title"
			style={{ '--uplifters-site-builder-blocks-spot-x': spot.x, '--uplifters-site-builder-blocks-spot-y': spot.y }}
			onPointerMove={updateSpot}
		>
			<div className="uplifters-site-builder-blocks-hero-glow uplifters-site-builder-blocks-glow-one" />
			<div className="uplifters-site-builder-blocks-hero-glow uplifters-site-builder-blocks-glow-two" />
			<SparkField reduceMotion={reduceMotion} />

			<motion.div
				className="uplifters-site-builder-blocks-hero-copy"
				initial={reduceMotion ? false : 'hidden'}
				animate="visible"
				variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } } }}
			>
				<motion.h1 id="uplifters-site-builder-blocks-title" className="uplifters-site-builder-blocks-hero-feature-title" variants={heroTextVariant(reduceMotion)}>{__('See every breakpoint before you publish.', 'uplifters-site-builder-blocks')}</motion.h1>
				<motion.p className="uplifters-site-builder-blocks-hero-feature-copy" variants={heroTextVariant(reduceMotion)}>{sprintf(__('%s helps you design with confidence by making desktop, tablet, and mobile behavior visual, immediate, and intuitive.', 'uplifters-site-builder-blocks'), productName)}</motion.p>
				<motion.div role="heading" aria-level="2" className="uplifters-site-builder-blocks-hero-feature-title" variants={heroTextVariant(reduceMotion)}>{__('Custom site-wide headers & footers — with sticky headers.', 'uplifters-site-builder-blocks')}</motion.div>
				<motion.p className="uplifters-site-builder-blocks-hero-feature-copy" variants={heroTextVariant(reduceMotion)}>{__('Open the WordPress Header or Footer template part, then replace its default blocks with the corresponding Uplifters Website Builder layout.', 'uplifters-site-builder-blocks')}</motion.p>
				<motion.div className="uplifters-site-builder-blocks-hero-actions" variants={heroTextVariant(reduceMotion)}>
					<motion.a className="uplifters-site-builder-blocks-button uplifters-site-builder-blocks-button-primary" href={siteEditorUrl} whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.965 }}>
						<Dashicon icon="edit-page" />{__('Open Site Editor', 'uplifters-site-builder-blocks')}
					</motion.a>
					<motion.button className="uplifters-site-builder-blocks-button uplifters-site-builder-blocks-button-secondary" type="button" onClick={() => setActiveTab('blocks')} whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.965 }}>
						{__('Explore 41 Blocks', 'uplifters-site-builder-blocks')}<Dashicon icon="arrow-right-alt2" />
					</motion.button>
				</motion.div>
			</motion.div>

			<motion.div
				className="uplifters-site-builder-blocks-hero-stage uplifters-site-builder-blocks-hero-viewport-stage"
				initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 24 }}
				animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.74, delay: 0.24, ease: EASE }}
			>
				<div className="uplifters-site-builder-blocks-orbit uplifters-site-builder-blocks-orbit-one" />
				<div className="uplifters-site-builder-blocks-orbit uplifters-site-builder-blocks-orbit-two" />
				<HeroViewport
					device={device}
					theme={theme}
					onDeviceChange={chooseDevice}
					onThemeChange={chooseTheme}
					onPointerEnter={pauseViewportMotion}
					onPointerLeave={resumeViewportMotion}
					onFocusCapture={pauseViewportMotion}
					onBlurCapture={resumeIfViewportFocusLeaves}
					reduceMotion={reduceMotion}
					deviceSwitchKey={deviceSwitchKey}
					themePulseKey={themePulseKey}
				/>
			</motion.div>
		</section>
	);
}

function heroTextVariant(reduceMotion) {
	if (reduceMotion) return {};
	return {
		hidden: { opacity: 0, y: 22 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE } },
	};
}

function HeroViewport({
	device,
	theme,
	onDeviceChange,
	onThemeChange,
	onPointerEnter,
	onPointerLeave,
	onFocusCapture,
	onBlurCapture,
	reduceMotion,
	deviceSwitchKey,
	themePulseKey,
}) {
	return (
		<div
			className="uplifters-site-builder-blocks-hero-viewport"
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			onFocusCapture={onFocusCapture}
			onBlurCapture={onBlurCapture}
		>
			<div className="uplifters-site-builder-blocks-hero-viewport-toolbar">
				<div className="uplifters-site-builder-blocks-hero-viewport-title">
					<span className="uplifters-site-builder-blocks-live-dot" aria-hidden="true" />
					<strong>{__('Live responsive canvas', 'uplifters-site-builder-blocks')}</strong>
				</div>

				<div className="uplifters-site-builder-blocks-hero-device-controls" aria-label={__('Hero viewport device controls', 'uplifters-site-builder-blocks')}>
					{[
						['desktop', 'desktop'],
						['tablet', 'tablet'],
						['mobile', 'smartphone'],
					].map(([id, icon]) => (
						<motion.button
							key={id}
							type="button"
							className={device === id ? 'is-active' : undefined}
							aria-pressed={device === id}
							aria-label={sprintf(__('Switch hero preview to %s viewport', 'uplifters-site-builder-blocks'), id)}
							onClick={() => onDeviceChange(id)}
							whileHover={reduceMotion ? undefined : { y: -2 }}
							whileTap={reduceMotion ? undefined : { scale: 0.94 }}
						>
							<Dashicon icon={icon} />
						</motion.button>
					))}
				</div>

				<div className="uplifters-site-builder-blocks-hero-theme-row" aria-label={__('Hero viewport style controls', 'uplifters-site-builder-blocks')}>
					{THEME_ORDER.map((id) => {
						const isActive = theme === id;

						return (
							<motion.button
								key={`${id}-${isActive ? themePulseKey : 0}`}
								className={isActive ? 'is-active' : undefined}
								type="button"
								data-theme={id}
								aria-label={sprintf(__('Switch hero preview to %s style', 'uplifters-site-builder-blocks'), id)}
								onClick={() => onThemeChange(id)}
								animate={isActive && themePulseKey > 0 && !reduceMotion ? { scale: [1, 1.16, 0.98, 1] } : undefined}
								transition={{ duration: 0.46, ease: EASE }}
								whileHover={reduceMotion ? undefined : { y: -2 }}
								whileTap={reduceMotion ? undefined : { scale: 0.94 }}
							/>
						);
					})}
				</div>
			</div>

			<motion.div
				className="uplifters-site-builder-blocks-hero-device-wrap"
				animate={reduceMotion || themePulseKey === 0 ? undefined : { scale: [1, 1.006, 1] }}
				transition={{ duration: 0.46, ease: EASE }}
			>
				<ViewportFrame
					device={device}
					theme={theme}
					reduceMotion={reduceMotion}
					hero
					switchKey={deviceSwitchKey}
				/>
			</motion.div>

			<p className="uplifters-site-builder-blocks-hero-viewport-tagline">
				{__('Preview and customize settings for every screen size.', 'uplifters-site-builder-blocks')}
			</p>

			<div className="uplifters-site-builder-blocks-hero-viewport-chips" aria-hidden="true">
				<motion.span className="uplifters-site-builder-blocks-float-chip uplifters-site-builder-blocks-hero-device-chip uplifters-site-builder-blocks-hero-chip-desktop" animate={reduceMotion ? undefined : { opacity: device === 'desktop' ? 1 : 0.52 }}><Dashicon icon="desktop" />Desktop</motion.span>
				<motion.span className="uplifters-site-builder-blocks-float-chip uplifters-site-builder-blocks-hero-device-chip uplifters-site-builder-blocks-hero-chip-tablet" animate={reduceMotion ? undefined : { opacity: device === 'tablet' ? 1 : 0.52 }}><Dashicon icon="tablet" />Tablet</motion.span>
				<motion.span className="uplifters-site-builder-blocks-float-chip uplifters-site-builder-blocks-hero-device-chip uplifters-site-builder-blocks-hero-chip-mobile" animate={reduceMotion ? undefined : { opacity: device === 'mobile' ? 1 : 0.52 }}><Dashicon icon="smartphone" />Mobile</motion.span>
			</div>
		</div>
	);
}

function ViewportFrame({ device, theme, reduceMotion, hero = false, switchKey = 0 }) {
	const frameAnimation = hero
		? { scale: [1, 0.965, 1], rotateX: [0, 2.5, 0], opacity: [1, 0.86, 1] }
		: { scale: [1, 0.965, 1], rotateX: [0, 3, 0], opacity: [1, 0.82, 1] };

	return (
		<motion.div
			key={hero ? `hero-${device}-${switchKey}` : undefined}
			layout={!hero}
			className={cn('uplifters-site-builder-blocks-device-frame', `is-${device}`, `theme-${theme}`, hero && 'is-hero-viewport')}
			id={hero ? undefined : 'uplifters-site-builder-blocks-device-frame'}
			initial={false}
			animate={reduceMotion ? undefined : frameAnimation}
			transition={{ duration: 0.58, ease: EASE }}
		>
			<div className="uplifters-site-builder-blocks-device-top"><i /><i /><i /><span>uplifters.tech</span></div>
			<div className="uplifters-site-builder-blocks-demo-site">
				<header>
					<nav><span>Home</span><span>Work</span><span>About</span></nav>
					<button type="button">Contact</button>
					<i className="dashicons dashicons-menu-alt3" />
				</header>
				<main>
					<span>CREATIVE SYSTEM</span>
					<h3>Ideas become<br /><em>experiences.</em></h3>
					<p>Build responsive websites with a unified collection of native blocks.</p>
					<button type="button">Discover more</button>
				</main>
				<footer><div><span /><span /><span /></div></footer>
			</div>
		</motion.div>
	);
}


export function OverviewPanel({ siteEditorUrl = '#', setActiveTab = () => {}, reduceMotion = false, productName = 'Uplifters Website Builder' } = {}) {
	return (
		<section id="uplifters-site-builder-blocks-overview" className="uplifters-site-builder-blocks-panel" role="tabpanel" aria-labelledby="uplifters-site-builder-blocks-tab-overview">
			<Hero siteEditorUrl={siteEditorUrl} setActiveTab={setActiveTab} reduceMotion={reduceMotion} productName={productName} />
		</section>
	);
}
