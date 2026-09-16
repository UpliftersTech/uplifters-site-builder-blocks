import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import './editor.scss';
import './style.scss';
import Edit from './edit';
import Save from './save';
import { postsSectionMetadata, PostsSectionEdit, PostsSectionSave } from './posts-section';
import { PostsLayout, PostsSection } from '../../assets-shared/icon-blocks';

registerBlockType(metadata.name, {
	...metadata,
	edit: Edit,
	save: Save,
	icon: <PostsLayout />,
});

registerBlockType(postsSectionMetadata.name, {
	...postsSectionMetadata,
	edit: PostsSectionEdit,
	save: PostsSectionSave,
	icon: <PostsSection />,
});
