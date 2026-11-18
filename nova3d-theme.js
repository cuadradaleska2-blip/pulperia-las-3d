/* Nova3D — interfaz de negocio + chat seguro con Gemini. No incluye secretos. */
(function(){
'use strict';
const AI_ENDPOINT='https://nova3d-ia.cuadradaleska2.workers.dev/chat';
let accessToken=''; // Solo memoria: nunca se guarda en GitHub ni localStorage.
function init(){
  const main=document.querySelector('main.wrap'),home=document.getElementById('inicio'),header=document.querySelector('header'),nav=document.querySelector('nav');
  if(!main||!home||!header||!nav||typeof go!=='function')return;
  document.title='Nova3D | Gestión de negocios';
  const title=header.querySelector('h1'),sub=header.querySelector('p');
  if(title)title.textContent='✦ Nova3D';
  if(sub)sub.textContent='Pulpería Las 3D · Tu negocio bajo control';
  home.innerHTML=`<div class="hero"><h2>Tu negocio hoy 💙</h2><div class="nova-summary"><div><small>Ventas de hoy</small><div class="big" id="hoy">C$0.00</div></div><div><small>Por cobrar</small><div class="big" id="deuda">C$0.00</div></div></div><button class="nova-action" onclick="go('ventas')">＋ Registrar venta</button></div><h3 class="nova-heading">Administrar mi negocio</h3><div class="nova-tools" id="novaTools"></div>`;
  const tools=[['inventario','📦','Inventario'],['fiados','👥','Clientes y fiados'],['reportes','📊','Estadísticas'],['precios','🧮','Calculadora'],['gastos','🧾','Gastos'],['proveedores','🚚','Proveedores'],['caja','💵','Cierre de caja'],['catalogo','🛒','Catálogo'],['ahorros','🐷','Ahorros'],['respaldo','⚙️','Configuración']];
  document.getElementById('novaTools').innerHTML=tools.map(([id,ico,name])=>`<button class="nova-tool" data-nova-go="${id}"><span>${ico}</span>${name}</button>`).join('');
  document.getElementById('novaTools').addEventListener('click',e=>{const b=e.target.closest('[data-nova-go]');if(b)go(b.dataset.novaGo)});
  const balance=document.createElement('section');balance.id='novaBalance';balance.innerHTML='<h2>📊 Balance del negocio</h2><div class="card" id="novaBalanceData"></div><button class="btn" onclick="go(\'ventas\')">Nueva venta</button><button class="btn alt" onclick="go(\'gastos\')">Nuevo gasto</button>';
  main.appendChild(balance);
  const assistant=document.createElement('section');assistant.id='novaAssistant';assistant.innerHTML=`<h2>✨ Nova IA</h2><div class="nova-assistant-panel"><h3>Tu asistente de negocios 💙</h3><div id="novaConnection" style="padding:12px;border-radius:14px;background:#e9f7ff;margin:12px 0"><label for="novaAccessToken">Contraseña privada de Nova IA</label><input id="novaAccessToken" type="password" autocomplete="off" spellcheck="false" placeholder="NOVA_ACCESS_TOKEN (no tu clave de Gemini)"><button class="btn" type="button" id="novaConnect">Conectar chat</button><button class="btn alt" type="button" id="novaDisconnect" style="display:none">Desconectar</button><p id="novaConnectionStatus" class="muted">Sin conectar. Las consultas de tu negocio funcionan sin internet.</p></div><div class="nova-chat" id="novaChat" role="log" aria-live="polite"><div class="nova-bubble">¡Hola! Puedo consultar tus ventas, deudas y existencias sin internet. Si conectas Nova IA, también responderé preguntas generales con Gemini. No comparto los registros de clientes con Gemini.</div></div><div class="nova-chat-controls"><input id="novaQuestion" placeholder="Escribe una pregunta..." aria-label="Pregunta para Nova IA"><button type="button" id="novaSend">Enviar</button></div><p class="nova-notice">El chat con Gemini requiere internet y usa la cuota gratuita disponible de tu proyecto. Las respuestas pueden contener errores. No registra ni modifica ventas o productos automáticamente.</p></div>`;
  main.appendChild(assistant);
  nav.innerHTML=`<button data-page="inicio"><span>⌂</span>Inicio</button><button data-page="novaBalance"><span>📊</span>Balance</button><button class="nova-assistant" data-page="novaAssistant"><span>✦</span>Nova IA</button><button data-page="fiados"><span>📒</span>Deudas</button><button data-page="inventario"><span>📦</span>Inventario</button>`;
  nav.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)go(b.dataset.page)});
  const originalGo=go;
  window.go=function(id){originalGo(id);nav.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('nova-active',b.dataset.page===id));if(id==='novaBalance')renderNovaBalance()};
  function activeSales(){return (db.sales||[]).filter(s=>!s.voided)}
  function debtTotal(){const credit=activeSales().filter(s=>s.type==='fiado').reduce((a,s)=>a+Number(s.total||0),0);const paid=(db.payments||[]).filter(p=>!p.voided).reduce((a,p)=>a+Number(p.amount||0),0);return Math.max(0,credit-paid)}
  function renderNovaBalance(){const s=activeSales(),total=s.reduce((a,x)=>a+Number(x.total||0),0),expense=(db.expenses||[]).reduce((a,x)=>a+Number(x.amount||0),0),cash=s.filter(x=>x.type==='contado').reduce((a,x)=>a+Number(x.total||0),0);document.getElementById('novaBalanceData').innerHTML=`<h3>Resumen general</h3><p>Ventas registradas: <b>${money(total)}</b></p><p>Ventas al contado: <b>${money(cash)}</b></p><p>Gastos: <b>${money(expense)}</b></p><p>Por cobrar: <b>${money(debtTotal())}</b></p><p class="nova-mini">Las ventas fiadas aún no cobradas están incluidas en las ventas, pero no en el efectivo recibido. Este resumen no equivale a utilidad neta.</p>`}
  function localAnswer(question){const q=question.toLowerCase(),sales=activeSales(),products=db.products||[];let answer=null;
    if(/(venta|vend[ií]|ingreso)/.test(q)&&/hoy/.test(q)){const t=typeof today==='function'?today():new Date().toISOString().slice(0,10);answer='Ventas registradas hoy: '+money(sales.filter(s=>localDay(s.date)===t).reduce((a,s)=>a+Number(s.total||0),0))}
    else if(/deuda|fiad|por cobrar/.test(q))answer='Total pendiente por cobrar: '+money(debtTotal());
    else if(/poco|baj|agot|alerta/.test(q)&&/stock|producto|inventario|existencia/.test(q)){const low=products.filter(p=>Number(p.stock)<=Number(p.min||0));answer=low.length?'Productos con existencias bajas:\n'+low.map(p=>`${p.name}: ${p.stock} ${p.unit||'unidades'}`).join('\n'):'No hay productos marcados con existencias bajas.'}
    else if(/(cu[aá]ntos|lista|mostrar|ver|revisar)/.test(q)&&/inventario|existencia|productos/.test(q))answer='Productos registrados: '+products.length+'.\n'+products.slice(0,12).map(p=>`${p.name}: ${p.stock} ${p.unit||'unidades'}`).join('\n');
    else if(/(total|cu[aá]nto|cu[aá]ntos)/.test(q)&&/gasto/.test(q))answer='Gastos registrados: '+money((db.expenses||[]).reduce((a,x)=>a+Number(x.amount||0),0));
    else if(/(total|cu[aá]nto)/.test(q)&&/venta|vend[ií]|ingreso/.test(q))answer='Ventas registradas: '+money(sales.reduce((a,s)=>a+Number(s.total||0),0));
    return answer;
  }
  const input=document.getElementById('novaQuestion'),chat=document.getElementById('novaChat'),sendButton=document.getElementById('novaSend');
  const tokenInput=document.getElementById('novaAccessToken'),status=document.getElementById('novaConnectionStatus'),connectButton=document.getElementById('novaConnect'),disconnectButton=document.getElementById('novaDisconnect');
  function bubble(msg,kind=''){const d=document.createElement('div');d.className='nova-bubble '+kind;d.textContent=msg;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;return d;}
  connectButton.addEventListener('click',()=>{const t=tokenInput.value.trim();if(t.length<32){status.textContent='Escribe la contraseña privada que guardaste como NOVA_ACCESS_TOKEN (mínimo 32 caracteres).';return;}accessToken=t;tokenInput.value='';tokenInput.style.display='none';connectButton.style.display='none';disconnectButton.style.display='inline-block';status.textContent='Conexión preparada. Envía una pregunta para probar Gemini.';});
  disconnectButton.addEventListener('click',()=>{accessToken='';tokenInput.style.display='block';disconnectButton.style.display='none';connectButton.style.display='inline-block';status.textContent='Desconectado. Solo funcionan las consultas locales.';});
  async function send(){const q=input.value.trim();if(!q)return;if(q.length>1500){bubble('La pregunta es demasiado larga (máximo 1500 caracteres).');return;}bubble(q,'user');input.value='';const local=localAnswer(q);if(local!==null){bubble(local);return;}
    if(!accessToken){bubble('Para responder preguntas generales con Gemini, introduce tu contraseña NOVA_ACCESS_TOKEN en el cuadro de arriba y toca Conectar chat. También puedo consultar ventas, deudas e inventario sin internet.');return;}
    const waiting=bubble('Consultando con Gemini...');sendButton.disabled=true;
    try {const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),24000);let response;try{response=await fetch(AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+accessToken},body:JSON.stringify({mensaje:q}),signal:controller.signal});}finally{clearTimeout(timeout)}const data=await response.json();if(!response.ok)throw new Error(response.status===401?'Contraseña incorrecta. Comprueba NOVA_ACCESS_TOKEN.':(data?.error||'Error de conexión')+(data?.detalle?' — '+data.detalle:''));waiting.textContent=data.respuesta||'Gemini no devolvió una respuesta.';status.textContent='Nova IA conectada con Gemini.';}
    catch(e){waiting.textContent=e.name==='AbortError'?'La conexión tardó demasiado. Inténtalo nuevamente.':('No pude consultar Gemini: '+(e.message||'Error de red')+'. Puedes seguir usando las funciones de tu negocio.');}
    finally{sendButton.disabled=false;chat.scrollTop=chat.scrollHeight;}
  }
  sendButton.addEventListener('click',send);
  input.addEventListener('keydown',e=>{if(e.key==='Enter')send()});
  window.go('inicio');
  if(typeof render==='function')render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
