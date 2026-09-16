import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import './editor.scss';
import './style.scss';
import Edit from './edit';
import Save from './save';
import { footerSectionMetadata, FooterSectionEdit, FooterSectionSave } from './footer-section';
import { FooterLayout, FooterSection } from '../../assets-shared/icon-blocks';

registerBlockType(metadata.name, {
	...metadata,
	edit: Edit,
	save: Save,
	icon: <FooterLayout />,
});

registerBlockType(footerSectionMetadata.name, {
	...footerSectionMetadata,
	edit: FooterSectionEdit,
	save: FooterSectionSave,
	icon: <FooterSection />,
});
