/**
 * The "row section" used inside the Row Layout block.
 *
 * Registered from this same folder (not its own block folder) so the whole
 * Row Layout feature ships as a single build/blocks/row-layout output.
 * It has no server-side render: it's a fully static block whose saved markup
 * is echoed as-is by WordPress, so it needs no PHP registration.
 */

import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { Button, Tooltip } from '@wordpress/components';
import { trash } from '@wordpress/icons';

export const ROW_SECTION_NAME = 'uplifters-site-builder-blocks/row-layout-section';

export const rowSectionMetadata = {
	apiVersion: 3,
	name: ROW_SECTION_NAME,
	title: 'Row Section',
	category: 'uplifters-site-builder-blocks-wrapper',
	parent: [ 'uplifters-site-builder-blocks/row-layout' ],
	description: 'A single section inside the Row Layout block, with its own block appender and delete control.',
	textdomain: 'uplifters-site-builder-blocks',
	supports: {
		html: false,
		inserter: false,
		reusable: false,
	},
};

export function RowSectionEdit({ clientId }) {
	const { removeBlock } = useDispatch('core/block-editor');

	const hasInnerBlocks = useSelect(
		(select) =>
			(select('core/block-editor').getBlock(clientId)?.innerBlocks || [])
				.length > 0,
		[clientId]
	);

	const blockProps = useBlockProps({
		className: `uplifters-site-builder-blocks-row-layout-section ${
			hasInnerBlocks ? 'has-content' : 'is-empty'
		}`,
	});

	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		renderAppender: hasInnerBlocks
			? undefined
			: InnerBlocks.ButtonBlockAppender,
	});

	return (
		<div className="uplifters-site-builder-blocks-row-layout-section-outer">
			<div {...innerBlocksProps} />

			<Tooltip text={__('Delete row', 'uplifters-site-builder-blocks')}>
				<Button
					className="uplifters-site-builder-blocks-row-layout-section-delete"
					icon={trash}
					label={__('Delete row', 'uplifters-site-builder-blocks')}
					onClick={() => removeBlock(clientId)}
				/>
			</Tooltip>
		</div>
	);
}

export function RowSectionSave() {
	const blockProps = useBlockProps.save({
		className: 'uplifters-site-builder-blocks-row-layout-section',
	});

	const innerBlocksProps = useInnerBlocksProps.save(blockProps);

	return <div {...innerBlocksProps} />;
}
