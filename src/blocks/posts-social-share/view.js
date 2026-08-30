( function () {
	if ( window.__upliftersSiteBuilderBlocksCopyLinkInit ) return;
	window.__upliftersSiteBuilderBlocksCopyLinkInit = true;

	document.addEventListener( 'click', function ( e ) {
		var link = e.target.closest( '[data-uplifters-site-builder-blocks-posts-social-share-copy-link]' );
		if ( ! link ) return;

		e.preventDefault();

		var url = link.dataset.upliftersSiteBuilderBlocksCopyLink;

		if ( navigator.clipboard && window.isSecureContext ) {
			navigator.clipboard.writeText( url ).then( function () { showFeedback( link ); } );
		} else {
			var ta       = document.createElement( 'textarea' );
			ta.value     = url;
			ta.style.cssText = 'position:fixed;opacity:0';
			document.body.appendChild( ta );
			ta.focus();
			ta.select();
			try { document.execCommand( 'copy' ); } catch (e) {}
			document.body.removeChild( ta );
			showFeedback( link );
		}
	} );

	function showFeedback( link ) {
		var original = link.getAttribute( 'aria-label' );
		link.setAttribute( 'aria-label', 'Copied!' );
		setTimeout( function () { link.setAttribute( 'aria-label', original ); }, 1500 );
	}
} )();
