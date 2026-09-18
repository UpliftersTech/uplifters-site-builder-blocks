/**
 * Per-device child order: the editor half.
 *
 * Desktop is the document order itself, so reordering on desktop moves the
 * real blocks. Tablet and mobile keep the document order untouched and store a
 * sequence of their own — a permutation of the 1-based slot numbers, read left
 * to right as the display order. [ 2, 1, 3 ] shows slot 2 first, so the column
 * that is first on desktop can be second on tablet.
 *
 * The saved attribute shape matches the other responsive attributes:
 * { desktop: [], tablet: [], mobile: [] }. An empty array means natural order,
 * which is what every block starts with.
 *
 * The sequence maths lives in order-sequence.js, and the frontend counterpart
 * — the same sequences as nth-child rules inside each breakpoint — in
 * includes/responsive-global/responsive-order-css.php.
 */

import { __, sprintf } from '@wordpress/i18n';
import { Button, Tooltip } from '@wordpress/components';
import { chevronUp, chevronDown, undo } from '@wordpress/icons';

// eslint-disable-next-line import/no-extraneous-dependencies -- provided by WordPress core at runtime, not an npm dependency
import { useRefEffect } from '@wordpress/compose';

import {
	getNaturalOrder,
	getSlotOrder,
	isNaturalOrder,
	withSlotMoved,
} from './order-sequence';

import './responsive-order.scss';

export {
	RESPONSIVE_ORDER_DEVICES,
	EDITOR_CHROME_ORDER,
	getNaturalOrder,
	normalizeOrderSequence,
	resolveOrder,
	isNaturalOrder,
	withSlotMoved,
	withSlotRemoved,
	getDocumentMove,
	remapSequence,
	getSlotOrder,
} from './order-sequence';

/**
 * Applies the active device's order to the inner blocks in the editor canvas.
 *
 * Returns a ref for the block's wrapper — the element whose children are the
 * slots. The order goes straight onto each child as an inline style rather
 * than through a stylesheet: the canvas wrapper also holds editor-only
 * children, and an inline style needs no selector to match, no scoping class
 * and no assumption about where those extras sit.
 *
 * @param {number[]} sequence Normalised sequence for the active device.
 * @return {Function} Ref callback for the wrapper element.
 */
export function useChildOrder( sequence ) {
	// A primitive key, so the effect re-runs on a real change rather than on
	// every render that rebuilds the array.
	const sequenceKey = sequence.join( ',' );

	return useRefEffect(
		( container ) => {
			const view = container.ownerDocument.defaultView;

			// Rebuilt from the key so the effect never closes over a stale
			// sequence from an earlier render.
			const order =
				sequenceKey === '' ? [] : sequenceKey.split( ',' ).map( Number );

			// Only the inner blocks. The empty-slot placeholders alongside them
			// are React's, and their order is set from the render instead.
			const getSlotElements = () =>
				Array.from( container.children ).filter( ( element ) =>
					element.hasAttribute( 'data-block' )
				);

			const apply = () => {
				getSlotElements().forEach( ( element, index ) => {
					element.style.order = String(
						getSlotOrder( order, index + 1 )
					);
				} );
			};

			apply();

			if ( ! view || ! view.MutationObserver ) {
				return undefined;
			}

			// Blocks are added, removed and re-mounted as the layout is edited,
			// and a re-mounted element comes back without the order we set.
			const observer = new view.MutationObserver( apply );

			observer.observe( container, { childList: true } );

			return () => {
				observer.disconnect();

				getSlotElements().forEach( ( element ) => {
					element.style.removeProperty( 'order' );
				} );
			};
		},
		[ sequenceKey ]
	);
}

/**
 * Reorder control for the active device.
 *
 * Renders the slots in their current display order, so the number beside each
 * row is the serial the visitor will see on that device.
 *
 * @param {Object}   props
 * @param {number[]} props.sequence    Normalised sequence for the active device.
 * @param {string[]} props.labels      Slot labels, indexed by slot number - 1.
 * @param {string}   props.deviceLabel Active device name, for the heading.
 * @param {Function} props.onChange    Called with the next sequence.
 * @param {string}   [props.help]      Help text below the list.
 */
export default function ResponsiveOrderControl( {
	sequence,
	labels = [],
	deviceLabel,
	onChange,
	help,
} ) {
	// One slot has only one possible order.
	if ( sequence.length < 2 ) {
		return null;
	}

	const move = ( fromPosition, toPosition ) => {
		if ( toPosition < 0 || toPosition >= sequence.length ) {
			return;
		}

		onChange( withSlotMoved( sequence, fromPosition, toPosition ) );
	};

	return (
		<div className="uplifters-site-builder-blocks-responsive-order">
			<p className="uplifters-site-builder-blocks-responsive-order__label">
				{ sprintf(
					/* translators: %s: the active responsive device — Desktop, Tablet or Mobile. */
					__( '%s Order', 'uplifters-site-builder-blocks' ),
					deviceLabel
				) }
			</p>

			<ul className="uplifters-site-builder-blocks-responsive-order__list">
				{ sequence.map( ( slot, position ) => (
					<li
						key={ slot }
						className="uplifters-site-builder-blocks-responsive-order__item"
					>
						<span className="uplifters-site-builder-blocks-responsive-order__position">
							{ position + 1 }
						</span>

						<span className="uplifters-site-builder-blocks-responsive-order__name">
							{ labels[ slot - 1 ] ||
								sprintf(
									/* translators: %d: the slot's original position in the layout. */
									__( 'Item %d', 'uplifters-site-builder-blocks' ),
									slot
								) }
						</span>

						<Tooltip
							text={ __( 'Move up', 'uplifters-site-builder-blocks' ) }
						>
							<Button
								className="uplifters-site-builder-blocks-responsive-order__move"
								icon={ chevronUp }
								label={ __( 'Move up', 'uplifters-site-builder-blocks' ) }
								disabled={ position === 0 }
								onClick={ () => move( position, position - 1 ) }
							/>
						</Tooltip>

						<Tooltip
							text={ __( 'Move down', 'uplifters-site-builder-blocks' ) }
						>
							<Button
								className="uplifters-site-builder-blocks-responsive-order__move"
								icon={ chevronDown }
								label={ __(
									'Move down',
									'uplifters-site-builder-blocks'
								) }
								disabled={ position === sequence.length - 1 }
								onClick={ () => move( position, position + 1 ) }
							/>
						</Tooltip>
					</li>
				) ) }
			</ul>

			<Button
				className="uplifters-site-builder-blocks-responsive-order__reset"
				variant="tertiary"
				icon={ undo }
				disabled={ isNaturalOrder( sequence ) }
				onClick={ () => onChange( getNaturalOrder( sequence.length ) ) }
			>
				{ __( 'Reset order', 'uplifters-site-builder-blocks' ) }
			</Button>

			{ help && (
				<p className="uplifters-site-builder-blocks-responsive-order__help">
					{ help }
				</p>
			) }
		</div>
	);
}
