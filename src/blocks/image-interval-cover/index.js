import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import './editor.scss';
import './style.scss';
import Edit from './edit';
import Save from './save';
import { FaPanorama } from 'react-icons/fa6';

registerBlockType(metadata.name, {
	...metadata,
	edit: Edit,
	save: Save,
	icon: <FaPanorama size={20} color="#5BC3F5" />,
});
