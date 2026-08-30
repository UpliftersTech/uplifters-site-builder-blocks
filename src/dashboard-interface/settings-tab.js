import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { motion } from 'motion/react';

import {
	cn,
	Dashicon,
	EASE,
	panelEnterProps,
	SectionHeading,
} from './dashboard-header';

export function SettingsPanel({ settings, formAction, reduceMotion }) {
	const [loginEnabled, setLoginEnabled] = useState(Boolean(settings.loginEnabled));
	const [bgId, setBgId] = useState(settings.bgId || 0);
	const [logoId, setLogoId] = useState(settings.logoId || 0);
	const [bgUrl, setBgUrl] = useState(settings.bgUrl || '');
	const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');

	function openMedia({ isLogo }) {
		if (!loginEnabled || typeof window.wp === 'undefined' || !window.wp.media) return;

		const frame = window.wp.media({
			title: isLogo ? __('Select Logo Image', 'uplifters-site-builder-blocks') : __('Select Background Image', 'uplifters-site-builder-blocks'),
			button: { text: __('Use this image', 'uplifters-site-builder-blocks') },
			multiple: false,
			library: { type: 'image' },
		});

		frame.on('select', () => {
			const attachment = frame.state().get('selection').first().toJSON();
			const nextId = Number(attachment.id) || 0;
			const nextUrl = attachment.url || '';

			if (isLogo) {
				setLogoId(nextId);
				setLogoUrl(nextUrl);
				return;
			}

			setBgId(nextId);
			setBgUrl(nextUrl);
		});

		frame.open();
	}

	return (
		<section id="uplifters-site-builder-blocks-settings" className="uplifters-site-builder-blocks-panel" role="tabpanel" aria-labelledby="uplifters-site-builder-blocks-tab-settings">
			<motion.div {...panelEnterProps(reduceMotion)}>
				<SectionHeading eyebrow={__('Customization', 'uplifters-site-builder-blocks')} title={__('Login Page Settings', 'uplifters-site-builder-blocks')}>
					{__('Replace the default WordPress login screen with your own background image and logo.', 'uplifters-site-builder-blocks')}
				</SectionHeading>

				<form method="post" action={formAction} id="uplifters-site-builder-blocks-login-form">
					<input type="hidden" name={settings.nonceName || 'uplifters_site_builder_blocks_settings_nonce'} value={settings.nonce || ''} />
					<motion.div className="uplifters-site-builder-blocks-settings-card" whileHover={reduceMotion ? undefined : { y: -2 }}>
						<div className="uplifters-site-builder-blocks-toggle-container">
							<div><h3 className="uplifters-site-builder-blocks-toggle-label">{__('Enable Custom Login Page', 'uplifters-site-builder-blocks')}</h3><p className="uplifters-site-builder-blocks-toggle-desc">{__('Turn on to customize the default WordPress login screens background and logo.', 'uplifters-site-builder-blocks')}</p></div>
							<label className="uplifters-site-builder-blocks-switch" htmlFor="uplifters-site-builder-blocks-toggle-login">
								<input type="checkbox" name="uplifters_site_builder_blocks_login_custom_enable" id="uplifters-site-builder-blocks-toggle-login" value="1" checked={loginEnabled} onChange={(event) => setLoginEnabled(event.target.checked)} />
								<span className="uplifters-site-builder-blocks-slider" />
							</label>
						</div>
					</motion.div>

					<div id="uplifters-site-builder-blocks-uploaders-section" className={cn('uplifters-site-builder-blocks-settings-grid', !loginEnabled && 'is-disabled')}>
						<MediaSettingCard
							title={__('Background Image', 'uplifters-site-builder-blocks')}
							description={__('Choose a full-screen image for the login page background.', 'uplifters-site-builder-blocks')}
							previewId="uplifters-site-builder-blocks-bg-preview"
							inputName="uplifters_site_builder_blocks_login_bg_id"
							inputId="uplifters-site-builder-blocks-login-bg-id"
							imageId={bgId}
							imageUrl={bgUrl}
							onChoose={() => openMedia({ isLogo: false })}
							onRemove={() => { setBgId(0); setBgUrl(''); }}
							reduceMotion={reduceMotion}
						/>
						<MediaSettingCard
							title={__('Logo Image', 'uplifters-site-builder-blocks')}
							description={__('Choose the logo that appears above the login form.', 'uplifters-site-builder-blocks')}
							previewId="uplifters-site-builder-blocks-logo-preview"
							inputName="uplifters_site_builder_blocks_login_logo_id"
							inputId="uplifters-site-builder-blocks-login-logo-id"
							imageId={logoId}
							imageUrl={logoUrl}
							isLogo
							onChoose={() => openMedia({ isLogo: true })}
							onRemove={() => { setLogoId(0); setLogoUrl(''); }}
							reduceMotion={reduceMotion}
						/>
					</div>

					<div className="uplifters-site-builder-blocks-settings-submit">
						<motion.button type="submit" className="uplifters-site-builder-blocks-btn uplifters-site-builder-blocks-btn-save" whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.965 }}>
							{__('Save Changes', 'uplifters-site-builder-blocks')}
						</motion.button>
					</div>
				</form>
			</motion.div>
		</section>
	);
}

function MediaSettingCard({ title, description, previewId, inputName, inputId, imageId, imageUrl, isLogo = false, onChoose, onRemove, reduceMotion }) {
	return (
		<motion.div className="uplifters-site-builder-blocks-settings-card" whileHover={reduceMotion ? undefined : { y: -2 }}>
			<h3 className="uplifters-site-builder-blocks-card-title">{title}</h3>
			<p className="uplifters-site-builder-blocks-card-desc">{description}</p>
			<motion.div
				className={cn('uplifters-site-builder-blocks-preview-box', isLogo && 'uplifters-site-builder-blocks-preview-logo')}
				id={previewId}
				style={!isLogo && imageUrl ? { backgroundImage: `url('${imageUrl}')` } : undefined}
				key={`${inputId}-${imageUrl || 'empty'}`}
				initial={reduceMotion ? false : { scale: 0.96, opacity: 0.7 }}
				animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
				transition={{ duration: 0.42, ease: EASE }}
			>
				{isLogo && imageUrl ? <img src={imageUrl} alt={__('Logo Preview', 'uplifters-site-builder-blocks')} /> : null}
				{!imageUrl ? <Dashicon icon={isLogo ? 'wordpress' : 'format-image'} /> : null}
			</motion.div>
			<input type="hidden" name={inputName} id={inputId} value={imageId || ''} readOnly />
			<div className="uplifters-site-builder-blocks-card-actions">
				<motion.button type="button" className="uplifters-site-builder-blocks-btn uplifters-site-builder-blocks-btn-secondary uplifters-site-builder-blocks-upload-btn" onClick={onChoose} whileTap={reduceMotion ? undefined : { scale: 0.965 }}>
					{isLogo ? __('Choose Logo', 'uplifters-site-builder-blocks') : __('Choose Image', 'uplifters-site-builder-blocks')}
				</motion.button>
				{imageUrl ? (
					<motion.button type="button" className="uplifters-site-builder-blocks-btn uplifters-site-builder-blocks-btn-remove" onClick={onRemove} whileTap={reduceMotion ? undefined : { scale: 0.965 }}>
						{__('Remove', 'uplifters-site-builder-blocks')}
					</motion.button>
				) : null}
			</div>
		</motion.div>
	);
}
