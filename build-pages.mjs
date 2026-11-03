import {mkdir,readdir,copyFile,rm,writeFile} from 'node:fs/promises';
const root=new URL('./',import.meta.url),output=new URL('_site/',root);
await rm(output,{recursive:true,force:true});
await mkdir(new URL('assets/',output),{recursive:true});
for(const file of await readdir(new URL('dist/',root),{withFileTypes:true})){
 if(file.isFile()&&/\.(html|css|mjs)$/.test(file.name))await copyFile(new URL('dist/'+file.name,root),new URL(file.name,output));
}
for(const file of ['swamp-watercolor.png','storybook-sprites.png','pond-fish.png','moon-river.png','storybook-cast.png','heart-watercolor.png','charm-icons.png'])await copyFile(new URL('dist/assets/'+file,root),new URL('assets/'+file,output));
await writeFile(new URL('.nojekyll',output),'');
console.log('GitHub Pages: _site/ готова, все пути относительные.');
