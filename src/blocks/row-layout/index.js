import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import './editor.scss';
import './style.scss';
import Edit from './edit';
import Save from './save';
import { rowSectionMetadata, RowSectionEdit, RowSectionSave } from './row-section';
import { RowLayout, RowSection } from '../../assets-shared/icon-blocks';

registerBlockType(metadata.name, {
	...metadata,
	edit: Edit,
	save: Save,
	icon: <RowLayout />,
});

registerBlockType(rowSectionMetadata.name, {
	...rowSectionMetadata,
	edit: RowSectionEdit,
	save: RowSectionSave,
	icon: <RowSection />,
});
