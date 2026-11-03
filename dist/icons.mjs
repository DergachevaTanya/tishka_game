import {asset} from './assets.mjs';
const PATHS={
 leaf:'M19 4C9 3 3 8 5 15c2 6 12 6 14-11ZM5 20 16 8M9 14l-1-4m5 0 4 1',
 book:'M3 5c4-1 7 0 9 2 2-2 5-3 9-2v14c-4-1-7 0-9 2-2-2-5-3-9-2ZM12 7v14',
 voice:'M5 9H2v6h3l5 4V5ZM14 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14',
 sound:'M9 18V5l10-2v13M9 8l10-2M9 18c0 4-6 4-6 1s6-4 6-1Zm10-2c0 4-6 4-6 1s6-4 6-1Z',
 up:'M12 20V4M5 11l7-7 7 7',down:'M12 4v16m-7-7 7 7 7-7',left:'M20 12H4m7-7-7 7 7 7',right:'M4 12h16m-7-7 7 7-7 7',
 jump:'M5 19C4 7 13 1 19 7m-6 0 6 0 0 6M3 21h6m7 0h5',
 wait:'M12 3v18M4 7l16 10M4 17 20 7M9 5l3 3 3-3M9 19l3-3 3 3',
 restart:'M4 9a8 8 0 1 1 0 7M4 3v6h6',
 settings:'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-6 0v6',
 check:'m4 12 5 5L20 5',close:'m6 6 12 12M6 18 18 6',
 fish:'M4 12c4-8 12-8 16 0-4 8-12 8-16 0ZM4 12l-3-5v10ZM16 10h.01',
 firefly:'M12 10c-7-8-12 0-3 2-9 2-4 10 3 2 7 8 12 0 3-2 9-2 4-10-3-2ZM12 8v9m-2-14 2 4 2-4',
 star:'m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z',
 help:'M9 8c0-5 8-5 8 0 0 3-5 3-5 6m0 4v1',
 chapters:'M4 3h7v18H4ZM13 6h7v15h-7ZM7 7h1m8 3h1'
};
export function inkIcon(name){const path=PATHS[name]||PATHS.leaf;return `<svg class="ink-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`}
export function charm(index,extra=''){return `<span class="charm charm-${index} ${extra}" aria-hidden="true"></span>`}
export function portrait(kind='rabbit'){return `<span class="portrait portrait-${kind}" aria-hidden="true"></span>`}
export function installArt(){
 const root=document.documentElement;for(const [name,file] of [['charm-atlas','charm-icons.png'],['character-atlas','storybook-cast.png'],['heart-art','heart-watercolor.png']])root.style.setProperty('--'+name,`url("${asset(file)}")`);
}
