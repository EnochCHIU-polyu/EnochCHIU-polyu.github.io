// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'NoteStudy',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			customCss: ['./src/styles/custom.css'],
			head: [
				{
					tag: 'script',
					attrs: { 'is:inline': true },
					content:
						"document.documentElement.dataset.theme='light';try{localStorage.setItem('starlight-theme','light')}catch{}",
				},
			],
			sidebar: [
				{
					label: 'Blockchain',
					items: [{ autogenerate: { directory: 'blockchain' } }],
				},
				{
					label: 'Ethereum',
					items: [{ autogenerate: { directory: 'ethereum' } }],
				},
			],
		}),
	],
	markdown: {
		processor: unified({
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeKatex],
		}),
	},
});