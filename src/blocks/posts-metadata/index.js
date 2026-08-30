import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import './editor.scss';
import './style.scss';
import Edit from './edit';
import Save from './save';
import { MdOutlineArticle } from 'react-icons/md';

registerBlockType(metadata.name, {
	...metadata,
	edit: Edit,
	save: Save,
	icon: <MdOutlineArticle size={20} color="#5BC3F5" />,
});
