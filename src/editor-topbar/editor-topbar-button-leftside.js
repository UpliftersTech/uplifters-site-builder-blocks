(function (wp) {
	'use strict';

	if (!wp || !wp.domReady) {
		return;
	}

	const __ = wp.i18n && wp.i18n.__ ? wp.i18n.__ : function (text) {
		return text;
	};

	const TOPBAR_LOGO_ID = 'uplifters-site-builder-blocks-editor-topbar-logo';

	function getBrandData() {
		return window.UpliftersSiteBuilderBlocksEditorBrand || {};
	}

	function findDocumentOverviewButton() {
		const buttons = document.querySelectorAll(
			'.interface-interface-skeleton__header button, ' +
				'.edit-post-header button, ' +
				'.edit-site-header button'
		);

		for (let index = 0; index < buttons.length; index++) {
			const button = buttons[index];
			const label = [
				button.getAttribute('aria-label'),
				button.getAttribute('title'),
				button.textContent,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			if (
				label.indexOf('document overview') !== -1 ||
				label.indexOf('list view') !== -1
			) {
				return button;
			}
		}

		return null;
	}

	function getTopbarChild(element) {
		const topbar = element.closest(
			'.edit-site-header-edit-mode__toolbar, ' +
				'.edit-site-header__toolbar, ' +
				'.edit-post-header-toolbar, ' +
				'.interface-interface-skeleton__header'
		);

		if (!topbar) {
			return null;
		}

		let child = element;

		while (child.parentElement && child.parentElement !== topbar) {
			child = child.parentElement;
		}

		return child.parentElement === topbar
			? {
					topbar: topbar,
					child: child,
			  }
			: null;
	}

	function createFallbackIcon() {
		const icon = document.createElement('span');

		icon.className = 'uplifters-site-builder-blocks-editor-topbar-logo__icon';
		icon.setAttribute('aria-hidden', 'true');
		icon.textContent = 'U';

		return icon;
	}

	function createTopbarIcon() {
		const iconSource = window.UpliftersSiteBuilderBlocksEditorTopbarIcon;
		let icon = null;

		if (typeof iconSource === 'function') {
			icon = iconSource();
		} else if (iconSource && typeof iconSource.createIcon === 'function') {
			icon = iconSource.createIcon();
		} else if (iconSource instanceof window.Element) {
			icon = iconSource.cloneNode(true);
		} else if (typeof iconSource === 'string') {
			const template = document.createElement('template');
			template.innerHTML = iconSource.trim();
			icon = template.content.firstElementChild;
		} else if (iconSource && typeof iconSource.svg === 'string') {
			const template = document.createElement('template');
			template.innerHTML = iconSource.svg.trim();
			icon = template.content.firstElementChild;
		}

		if (!(icon instanceof window.Element)) {
			return createFallbackIcon();
		}

		icon.classList.add('uplifters-site-builder-blocks-editor-topbar-logo__icon');
		icon.setAttribute('aria-hidden', 'true');

		return icon;
	}

	function createLogo() {
		const brand = getBrandData();
		const dashboardUrl = brand.dashboardUrl || 'admin.php?page=uplifters-site-builder-blocks';
		const brandName = brand.name || __('Uplifters Builder', 'uplifters-site-builder-blocks');
		const link = document.createElement('a');
		const icon = createTopbarIcon();
		const text = document.createElement('span');

		link.id = TOPBAR_LOGO_ID;
		link.className = 'uplifters-site-builder-blocks-editor-topbar-logo';
		link.href = dashboardUrl;
		link.title = brandName;
		link.setAttribute('aria-label', brandName);

		text.className = 'uplifters-site-builder-blocks-editor-topbar-logo__text';
		text.textContent = brandName;

		link.appendChild(icon);
		link.appendChild(text);

		return link;
	}

	function mountEditorTopbarLogo() {
		const overviewButton = findDocumentOverviewButton();

		if (!overviewButton) {
			return;
		}

		const location = getTopbarChild(overviewButton);

		if (!location) {
			return;
		}

		let logo = document.getElementById(TOPBAR_LOGO_ID);

		if (!logo) {
			logo = createLogo();
		}

		if (
			logo.parentElement === location.topbar &&
			logo.previousElementSibling === location.child
		) {
			return;
		}

		location.child.insertAdjacentElement('afterend', logo);
	}

	wp.domReady(function () {
		mountEditorTopbarLogo();

		window.setTimeout(mountEditorTopbarLogo, 500);
		window.setTimeout(mountEditorTopbarLogo, 1500);

		const observer = new MutationObserver(function () {
			mountEditorTopbarLogo();
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
})(window.wp);
