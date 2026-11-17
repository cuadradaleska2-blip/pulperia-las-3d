/* Nova3D — interfaz renovada. Conserva los datos y la lógica existentes. */
(function(){
'use strict';
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
  const assistant=document.createElement('section');assistant.id='novaAssistant';assistant.innerHTML=`<h2>✨ Nova IA</h2><div class="nova-assistant-panel"><h3>Tu asistente de negocios 💙</h3><div class="nova-chat" id="novaChat"><div class="nova-bubble">¡Hola! Puedo consultar las ventas, deudas, existencias y ayudarte a calcular precios con los datos guardados en este dispositivo. La IA con búsquedas en internet se conectará en una próxima etapa.</div></div><div class="nova-chat-controls"><input id="novaQuestion" placeholder="Ej. ¿Cuánto vendí hoy?" aria-label="Pregunta para Nova IA"><button id="novaSend">Enviar</button></div><p class="nova-notice">Esta primera versión responde consultas locales. No envía información privada a internet ni modifica registros automáticamente.</p></div>`;
  main.appendChild(assistant);
  nav.innerHTML=`<button data-page="inicio"><span>⌂</span>Inicio</button><button data-page="novaBalance"><span>📊</span>Balance</button><button class="nova-assistant" data-page="novaAssistant"><span>✦</span>Nova IA</button><button data-page="fiados"><span>📒</span>Deudas</button><button data-page="inventario"><span>📦</span>Inventario</button>`;
  nav.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)go(b.dataset.page)});
  const originalGo=go;
  window.go=function(id){originalGo(id);nav.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('nova-active',b.dataset.page===id));if(id==='novaBalance')renderNovaBalance()};
  function activeSales(){return (db.sales||[]).filter(s=>!s.voided)}
  function debtTotal(){const credit=activeSales().filter(s=>s.type==='fiado').reduce((a,s)=>a+Number(s.total||0),0);const paid=(db.payments||[]).filter(p=>!p.voided).reduce((a,p)=>a+Number(p.amount||0),0);return Math.max(0,credit-paid)}
  function renderNovaBalance(){const s=activeSales(),total=s.reduce((a,x)=>a+Number(x.total||0),0),expense=(db.expenses||[]).reduce((a,x)=>a+Number(x.amount||0),0),cash=s.filter(x=>x.type==='contado').reduce((a,x)=>a+Number(x.total||0),0);document.getElementById('novaBalanceData').innerHTML=`<h3>Resumen general</h3><p>Ventas registradas: <b>${money(total)}</b></p><p>Ventas al contado: <b>${money(cash)}</b></p><p>Gastos: <b>${money(expense)}</b></p><p>Por cobrar: <b>${money(debtTotal())}</b></p><p class="nova-mini">Las ventas fiadas aún no cobradas están incluidas en las ventas, pero no en el efectivo recibido. Este resumen no equivale a utilidad neta.</p>`}
  function respond(question){const q=question.toLowerCase(),sales=activeSales(),products=db.products||[];let answer='Puedo ayudarte con: ventas de hoy, total de ventas, deudas, existencias, productos con poco inventario y gastos. Escribe una de esas consultas.';
    if(/hoy|vend[ií] hoy/.test(q)){const t=typeof today==='function'?today():new Date().toISOString().slice(0,10);answer='Ventas registradas hoy: '+money(sales.filter(s=>localDay(s.date)===t).reduce((a,s)=>a+Number(s.total||0),0))}
    else if(/deuda|fiad|cobrar/.test(q))answer='Total pendiente por cobrar: '+money(debtTotal());
    else if(/poco|baj|agot|alerta/.test(q)){const low=products.filter(p=>Number(p.stock)<=Number(p.min||0));answer=low.length?'Productos con existencias bajas:\n'+low.map(p=>`${p.name}: ${p.stock} ${p.unit||'unidades'}`).join('\n'):'No hay productos marcados con existencias bajas.'}
    else if(/inventario|existencia|producto/.test(q))answer='Productos registrados: '+products.length+'.\n'+products.slice(0,12).map(p=>`${p.name}: ${p.stock} ${p.unit||'unidades'}`).join('\n');
    else if(/gasto/.test(q))answer='Gastos registrados: '+money((db.expenses||[]).reduce((a,x)=>a+Number(x.amount||0),0));
    else if(/venta|vend[ií]|ingreso/.test(q))answer='Ventas registradas: '+money(sales.reduce((a,s)=>a+Number(s.total||0),0));
    return answer;
  }
  const send=()=>{const input=document.getElementById('novaQuestion'),chat=document.getElementById('novaChat'),q=input.value.trim();if(!q)return;for(const [msg,cls] of [[q,'user'],[respond(q),'']]){const d=document.createElement('div');d.className='nova-bubble '+cls;d.textContent=msg;chat.appendChild(d)}input.value='';chat.scrollTop=chat.scrollHeight};
  document.getElementById('novaSend').addEventListener('click',send);
  document.getElementById('novaQuestion').addEventListener('keydown',e=>{if(e.key==='Enter')send()});
  window.go('inicio');
  if(typeof render==='function')render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
