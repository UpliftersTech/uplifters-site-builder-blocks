import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import './editor.scss';
import './style.scss';
import Edit from './edit';
import Save from './save';
import { TfiLayoutAccordionSeparated } from 'react-icons/tfi';

registerBlockType(metadata.name, {
	...metadata,
	edit: Edit,
	save: Save,
	icon: <TfiLayoutAccordionSeparated size={20} color="#5BC3F5" />,
});
