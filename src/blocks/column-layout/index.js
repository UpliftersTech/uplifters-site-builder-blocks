import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import './editor.scss';
import './style.scss';
import Edit from './edit';
import Save from './save';
import { columnSectionMetadata, ColumnSectionEdit, ColumnSectionSave } from './column-section';
import { ColumnLayout, ColumnSection } from '../../assets-shared/icon-blocks';

registerBlockType(metadata.name, {
	...metadata,
	edit: Edit,
	save: Save,
	icon: <ColumnLayout />,
});

registerBlockType(columnSectionMetadata.name, {
	...columnSectionMetadata,
	edit: ColumnSectionEdit,
	save: ColumnSectionSave,
	icon: <ColumnSection />,
});
