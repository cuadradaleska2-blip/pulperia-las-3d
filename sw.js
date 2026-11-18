/* Nova3D — actualizacion de cache para activar la pantalla nueva de Nova IA.
   Conserva el almacenamiento de ventas e inventario del dispositivo. */
const CACHE='nova3d-v3-ia';
const REV='nova3d-ia-20261117';
const FILES=[
  './','./index.html','./app.js','./mejoras.js',
  './nova3d-theme.css','./nova3d-theme.js?v='+REV,
  './manifest.webmanifest','./icon-192.png','./icon-512.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('nova3d-')&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.endsWith('/catalogo.json')||url.pathname.endsWith('/catalogo.html'))return;
  if(url.pathname.endsWith('/nova3d-theme.js')){
    url.searchParams.set('v',REV);
    event.respondWith(fetch(url.toString(),{cache:'no-store',credentials:'same-origin'})
      .catch(()=>caches.match('./nova3d-theme.js?v='+REV)));
    return;
  }
  if(request.mode==='navigate'){
    event.respondWith(fetch(request,{cache:'no-store'})
      .catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(fetch(request).catch(()=>caches.match(request)));
});
