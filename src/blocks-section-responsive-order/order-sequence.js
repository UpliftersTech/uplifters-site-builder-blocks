/**
 * Per-device child order: the pure sequence maths.
 *
 * Kept free of React and of any @wordpress import so it can be reasoned about
 * — and tested — on its own. The editor wiring lives in responsive-order.js
 * and the frontend counterpart in
 * includes/responsive-global/responsive-order-css.php.
 *
 * A sequence is a permutation of the 1-based slot numbers, read left to right
 * as the display order: [ 2, 1, 3 ] shows slot 2 first, then slot 1, then 3.
 * A slot number is a position in the block's document order.
 */

export const RESPONSIVE_ORDER_DEVICES = [ 'desktop', 'tablet', 'mobile' ];

/**
 * Order for the editor-only children that belong after every slot — the "add"
 * buttons. Reordering gives the slots an `order` of 1 and up, and an element
 * left at the initial 0 would sort ahead of all of them.
 */
export const EDITOR_CHROME_ORDER = 9999;

/**
 * The order a layout has before anyone reorders it.
 *
 * @param {number} count Number of slots.
 * @return {number[]} Slot numbers 1..count.
 */
export function getNaturalOrder( count ) {
	return Array.from(
		{ length: Math.max( 0, count ) },
		( ignored, index ) => index + 1
	);
}

/**
 * Normalise one device's saved value into a permutation of 1..count.
 *
 * Anything unusable is dropped, and slots the saved value never mentioned keep
 * their natural order at the end — so a layout that just gained a column shows
 * the new column last instead of jumping it to the front.
 *
 * @param {*}      raw   One device's saved sequence.
 * @param {number} count Number of slots.
 * @return {number[]} Normalised sequence.
 */
export function normalizeOrderSequence( raw, count ) {
	const slotCount = Math.max( 0, Number( count ) || 0 );
	const sequence = [];
	const seen = new Set();

	if ( Array.isArray( raw ) ) {
		raw.forEach( ( value ) => {
			const slot = Number( value );

			if (
				! Number.isInteger( slot ) ||
				slot < 1 ||
				slot > slotCount ||
				seen.has( slot )
			) {
				return;
			}

			seen.add( slot );
			sequence.push( slot );
		} );
	}

	for ( let slot = 1; slot <= slotCount; slot++ ) {
		if ( ! seen.has( slot ) ) {
			sequence.push( slot );
		}
	}

	return sequence;
}

/**
 * Normalise every device's sequence at once.
 *
 * @param {*}      raw   Raw childOrder attribute.
 * @param {number} count Number of slots.
 * @return {Object} Per-device normalised sequences.
 */
export function resolveOrder( raw, count ) {
	const source =
		raw && typeof raw === 'object' && ! Array.isArray( raw ) ? raw : {};

	return RESPONSIVE_ORDER_DEVICES.reduce( ( result, device ) => {
		result[ device ] = normalizeOrderSequence( source[ device ], count );

		return result;
	}, {} );
}

/**
 * Whether a sequence leaves every slot where it already was.
 *
 * @param {number[]} sequence Normalised sequence.
 */
export function isNaturalOrder( sequence ) {
	return sequence.every( ( slot, position ) => slot === position + 1 );
}

/**
 * Move whatever sits at one display position to another, closing the gap.
 *
 * @param {number[]} sequence     Normalised sequence.
 * @param {number}   fromPosition 0-based display position to move.
 * @param {number}   toPosition   0-based display position to move it to.
 * @return {number[]} Reordered sequence.
 */
export function withSlotMoved( sequence, fromPosition, toPosition ) {
	if (
		fromPosition === toPosition ||
		fromPosition < 0 ||
		toPosition < 0 ||
		fromPosition >= sequence.length ||
		toPosition >= sequence.length
	) {
		return sequence;
	}

	const next = [ ...sequence ];
	const [ moved ] = next.splice( fromPosition, 1 );

	next.splice( toPosition, 0, moved );

	return next;
}

/**
 * Drop one slot from every device's sequence.
 *
 * Slots are identified by position, so removing one renumbers the slots after
 * it. Without that shift the saved sequences would keep pointing at whatever
 * moved into the vacated number.
 *
 * @param {Object} orderObject Per-device normalised sequences.
 * @param {number} slot        1-based slot number being removed.
 * @return {Object} Per-device sequences for the shorter layout.
 */
export function withSlotRemoved( orderObject, slot ) {
	return RESPONSIVE_ORDER_DEVICES.reduce( ( result, device ) => {
		result[ device ] = ( orderObject[ device ] || [] )
			.filter( ( candidate ) => candidate !== slot )
			.map( ( candidate ) =>
				candidate > slot ? candidate - 1 : candidate
			);

		return result;
	}, {} );
}

/**
 * Work out which single block moved between two document orders.
 *
 * Gutenberg's move arrows and drag-and-drop both land as "the block list is
 * now in this order", with no record of what the editor did. Replaying every
 * possible single move is exact, and a layout has at most a handful of
 * children, so the cost does not matter.
 *
 * @param {string[]} previousIds Client ids before the change.
 * @param {string[]} currentIds  Client ids after it.
 * @return {?Object} { clientId, from, to }, or null when it was not one move.
 */
export function getDocumentMove( previousIds, currentIds ) {
	if ( previousIds.length !== currentIds.length ) {
		return null;
	}

	for ( let from = 0; from < previousIds.length; from++ ) {
		const rest = previousIds.filter(
			( ignored, index ) => index !== from
		);

		for ( let to = 0; to < currentIds.length; to++ ) {
			if ( to === from ) {
				continue;
			}

			const candidate = [ ...rest ];

			candidate.splice( to, 0, previousIds[ from ] );

			if (
				candidate.every( ( id, index ) => id === currentIds[ index ] )
			) {
				return { clientId: previousIds[ from ], from, to };
			}
		}
	}

	return null;
}

/**
 * Renumber a sequence after the document order changed underneath it.
 *
 * Slots are positions in the document order, so moving a block in the document
 * renumbers them all. Rewriting each slot through the block that used to hold
 * it leaves the device showing exactly what it showed before.
 *
 * @param {number[]} sequence    Normalised sequence, in old slot numbers.
 * @param {string[]} previousIds Client ids before the change.
 * @param {string[]} currentIds  Client ids after it.
 * @return {number[]} The same visual order, in new slot numbers.
 */
export function remapSequence( sequence, previousIds, currentIds ) {
	return sequence
		.map( ( slot ) => currentIds.indexOf( previousIds[ slot - 1 ] ) + 1 )
		.filter( ( slot ) => slot > 0 );
}

/**
 * The CSS `order` a slot has under a sequence.
 *
 * `order` starts at 1 so that anything the editor adds alongside the slots —
 * which keeps the initial value of 0 — cannot sort ahead of them by accident.
 *
 * @param {number[]} sequence Normalised sequence.
 * @param {number}   slot     1-based slot number.
 * @return {number} CSS order value.
 */
export function getSlotOrder( sequence, slot ) {
	const position = sequence.indexOf( slot );

	return position === -1 ? slot : position + 1;
}
