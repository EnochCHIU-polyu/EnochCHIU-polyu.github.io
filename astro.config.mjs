// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid'; // 1. Import astro-mermaid
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
    integrations: [
        mermaid(), // 2. Add the mermaid integration here
        starlight({
            title: 'NoteStudy',
            social: [{ icon: 'github', label: 'GitHub', href: '/social/' }],
            customCss: ['./src/styles/custom.css'],
            // Keep the theme locked to light mode and add a desktop sidebar toggle in the header.
            head: [
                // NOTE: The manual Mermaid CDN script has been removed.
                {
                    tag: 'script',
                    attrs: { 'is:inline': true },
                    content: `document.documentElement.dataset.theme='light';try{localStorage.setItem('starlight-theme','light')}catch{};(()=>{const storageKey='starlight-sidebar-collapsed';const root=document.documentElement;const applyState=()=>{let collapsed=false;try{collapsed=localStorage.getItem(storageKey)==='true'}catch{}root.toggleAttribute('data-desktop-sidebar-collapsed',collapsed)};const syncButton=(button)=>{const collapsed=root.hasAttribute('data-desktop-sidebar-collapsed');button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',collapsed?'Open sidebar':'Close sidebar');button.title=collapsed?'Open sidebar':'Close sidebar'};const ensureButton=()=>{const desktop=window.matchMedia('(min-width: 50rem)').matches;const titleWrapper=document.querySelector('header .title-wrapper')||document.querySelector('.title-wrapper');if(!titleWrapper)return;let button=titleWrapper.querySelector('[data-desktop-sidebar-toggle]');if(!desktop){button?.remove();return}if(!button){button=document.createElement('button');button.type='button';button.dataset.desktopSidebarToggle='true';button.className='desktop-sidebar-toggle';button.innerHTML='<span class="desktop-sidebar-toggle__icon" aria-hidden="true"></span><span class="sr-only">Toggle sidebar</span>';button.addEventListener('click',()=>{const collapsed=!root.hasAttribute('data-desktop-sidebar-collapsed');root.toggleAttribute('data-desktop-sidebar-collapsed',collapsed);try{localStorage.setItem(storageKey,String(collapsed))}catch{}syncButton(button)});titleWrapper.prepend(button)}syncButton(button)};applyState();const init=()=>{applyState();ensureButton()};document.addEventListener('DOMContentLoaded',init,{once:true});document.addEventListener('astro:page-load',init);window.addEventListener('resize',ensureButton)})();`,
                },
            ],
            sidebar: [
                {
                    label: 'Blockchain',
                    items: [{ autogenerate: { directory: 'blockchain' } }],
                },
                {
                    label: 'Ethereum',
                    items: [
                        { label: 'Overview', link: '/ethereum/eth/' },
                        { label: 'Nodes', link: '/ethereum/eth-node/' },
                        { label: 'P2P Network', link: '/ethereum/eth-p2p/' },
                        { label: 'Hash', link: '/ethereum/eth-hash/' },
                        { label: 'Elliptic Curve', link: '/ethereum/eth-elliptic-curve/' },
                        { label: 'Accounts (20 Bytes)', link: '/ethereum/eth-account/' },
                        { label: 'Merkle and Trie Concepts', link: '/ethereum/eth-merkle-trie/' },
                        { label: 'Wallet', link: '/ethereum/eth-wallet/' },
                        { label: 'DIY Wallet (Python)', link: '/ethereum/eth-wallet-diy/' },
                        { label: 'Transaction Processing', link: '/ethereum/eth-transaction/' },
                        { label: 'Transaction with Go code', link: '/ethereum/eth-transaction-code/' },
                        { label: 'Gas', link: '/ethereum/eth-gas/' },
                        { label: 'Proof of Stake', link: '/ethereum/eth-pos/' },
                        { label: 'Stake pooling', link: '/ethereum/eth-stakepooling/' },
                        { label: 'Solidity', link: '/ethereum/solidity/' },
                    ],
                },
            ],
        }),
    ],
    markdown: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
    },
});