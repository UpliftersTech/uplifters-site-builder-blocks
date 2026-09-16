import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import './editor.scss';
import './style.scss';
import Edit from './edit';
import Save from './save';
import { headerSectionMetadata, HeaderSectionEdit, HeaderSectionSave } from './header-section';
import { HeaderLayout, HeaderSection } from '../../assets-shared/icon-blocks';

registerBlockType(metadata.name, {
	...metadata,
	edit: Edit,
	save: Save,
	icon: <HeaderLayout />,
});

registerBlockType(headerSectionMetadata.name, {
	...headerSectionMetadata,
	edit: HeaderSectionEdit,
	save: HeaderSectionSave,
	icon: <HeaderSection />,
});
