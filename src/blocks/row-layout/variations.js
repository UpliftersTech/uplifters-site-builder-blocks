import { __ } from '@wordpress/i18n';

const variations = [
	{
		name: 'one-column',
		title: __( '1 Column Row', 'uplifters-site-builder-blocks' ),
		description: __( 'Row layout with one column.', 'uplifters-site-builder-blocks' ),
		icon: 'columns',
		attributes: {
			sections: 1,
		},
		scope: [ 'block', 'inserter', 'transform' ],
		isDefault: true,
	},
	{
		name: 'two-columns',
		title: __( '2 Columns Row', 'uplifters-site-builder-blocks' ),
		description: __( 'Row layout with two equal columns.', 'uplifters-site-builder-blocks' ),
		icon: 'columns',
		attributes: {
			sections: 2,
		},
		scope: [ 'block', 'inserter', 'transform' ],
	},
	{
		name: 'three-columns',
		title: __( '3 Columns Row', 'uplifters-site-builder-blocks' ),
		description: __( 'Row layout with three equal columns.', 'uplifters-site-builder-blocks' ),
		icon: 'columns',
		attributes: {
			sections: 3,
		},
		scope: [ 'block', 'inserter', 'transform' ],
	},
	{
		name: 'four-columns',
		title: __( '4 Columns Row', 'uplifters-site-builder-blocks' ),
		description: __( 'Row layout with four equal columns.', 'uplifters-site-builder-blocks' ),
		icon: 'columns',
		attributes: {
			sections: 4,
		},
		scope: [ 'block', 'inserter', 'transform' ],
	},
	{
		name: 'five-columns',
		title: __( '5 Columns Row', 'uplifters-site-builder-blocks' ),
		description: __( 'Row layout with five equal columns.', 'uplifters-site-builder-blocks' ),
		icon: 'columns',
		attributes: {
			sections: 5,
		},
		scope: [ 'block', 'inserter', 'transform' ],
	},
	{
		name: 'six-columns',
		title: __( '6 Columns Row', 'uplifters-site-builder-blocks' ),
		description: __( 'Row layout with six equal columns.', 'uplifters-site-builder-blocks' ),
		icon: 'columns',
		attributes: {
			sections: 6,
		},
		scope: [ 'block', 'inserter', 'transform' ],
	},
];

export default variations;