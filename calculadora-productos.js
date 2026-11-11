'use strict';
/* Pulpería Las 3D: calculadora universal, aditiva y sin cambios en almacenamiento. */
(function(){
 const el=id=>document.getElementById(id);
 const pres=el('ppres'), qty=el('pqty'), cost=el('pcost'), unit=el('punit'), price=el('pprice'), stock=el('pstock');
 if(!pres||!qty||!cost||!unit||!price)return;
 const choices=['Bidón','Galón','Litro','Botella','Quintal','Libra','Fardo','Bolsa','Docena'];
 choices.forEach(s=>{if(!Array.from(pres.options).some(o=>o.value===s))pres.add(new Option(s,s),pres.options[pres.options.length-1]);});
 const label=qty.previousElementSibling;
 if(label&&label.tagName==='LABEL')label.textContent='Cantidad que contiene la presentación (en unidades de venta)';
 const box=document.createElement('div');box.className='card';box.style.cssText='background:#eaf8ff;border:1px solid #b6e1f5;padding:14px;margin:12px 0';
 box.innerHTML='<h3>🧮 Calculadora de precio para cualquier producto</h3><p class="muted">Ejemplo: un bidón de 20 litros, un quintal de 100 libras o una caja de 24 unidades.</p><label for="universalGain">Ganancia deseada sobre el costo (%)</label><input id="universalGain" type="number" min="0" step="any" value="25"><div id="universalResults" aria-live="polite" style="line-height:1.7;margin:10px 0"></div><button type="button" class="btn alt" id="universalApply">Aplicar precio sugerido</button><p class="muted">Podés cambiar el precio manualmente después. Para vender 1/2 o 1/4, registrá como unidad base litro o libra y usá cantidades 0.5 o 0.25 al vender.</p>';
 price.parentNode.insertBefore(box,price.previousElementSibling||price);
 const gain=el('universalGain'), out=el('universalResults');
 const fmt=x=>'C$'+x.toLocaleString('es-NI',{minimumFractionDigits:2,maximumFractionDigits:2});
 function calc(){
  const q=Number(qty.value), c=Number(cost.value), g=Number(gain.value);
  if(!qty.value||!cost.value||!gain.value||!(q>0)||!(c>=0)||!(g>=0)||![q,c,g].every(Number.isFinite)){
   out.textContent='Ingresá cantidad, costo y porcentaje de ganancia para ver el cálculo.';return null;
  }
  const base=c/q, suggested=base*(1+g/100), u=unit.value;
  out.innerHTML='<div>Costo por '+u+': <strong>'+fmt(base)+'</strong></div><div>Precio sugerido por '+u+': <strong>'+fmt(suggested)+'</strong></div><div>Ganancia por '+u+': <strong>'+fmt(suggested-base)+'</strong></div><div>Ganancia al vender toda la presentación: <strong>'+fmt(c*g/100)+'</strong></div>';
  return suggested;
 }
 [qty,cost,gain,unit].forEach(x=>{x.addEventListener('input',calc);x.addEventListener('change',calc)});
 pres.addEventListener('change',()=>{const p=pres.value;
  if(p==='Bidón'){qty.value='20';unit.value='litro'}
  else if(p==='Quintal'){qty.value='100';unit.value='lb'}
  else if(p==='Docena'){qty.value='12';unit.value='unidad'}
  calc();
 });
 el('universalApply').addEventListener('click',()=>{const v=calc();if(v!==null)price.value=v.toFixed(2)});
 calc();
})();
