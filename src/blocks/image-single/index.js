import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import './editor.scss';
import './style.scss';
import Edit from './edit';
import Save from './save';
import { ImageSingle } from '../../assets-shared/icon-blocks';

registerBlockType(metadata.name, {
	...metadata,
	edit: Edit,
	save: Save,
	icon: <ImageSingle />,
});
