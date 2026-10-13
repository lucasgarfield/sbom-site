'use strict';
const S=window.SBOMS,SC=window.SCORECARD,$=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PR={osbuild:'https://github.com/lucasgarfield/osbuild/pull/1'};
const PAIRS=[
 {a:'unpatched',b:'patched',t:'osbuild main vs osbuild + patches',d:'Same CentOS 9 qcow2 depsolve, image-os SBOM written at manifest time (so neither has a disk checksum).'},
];
let A,B;
const fv=v=>v!=null&&v!==''&&v!=='NOASSERTION'&&v!=='NONE';
// scorecard
(function(){let h='<table><tr><th>Check</th>'+SC.cols.map(c=>`<th>${esc(c)}</th>`).join('')+'</tr>';
 for(const r of SC.rows){h+=`<tr><td title="source: ${esc(r.src)}"><b>${esc(r.name)}</b><br><span class="muted" style="font-size:12px">${esc(r.src)}</span></td>`+r.cells.map(([s,t])=>`<td><span class="b ${s}">${s==='nr'?'not run':s}</span>${esc(t)}</td>`).join('')+'</tr>'}
 $('scorecard').innerHTML=h+'</table>'})();
// pairs
$('pairs').innerHTML=PAIRS.map((p,i)=>`<button data-i="${i}">${esc(p.t)}</button>`).join('');
$('pairs').onclick=e=>{const i=e.target.dataset.i;if(i!=null)pick(+i)};
function index(doc){if(doc._ix)return doc._ix;const out={},inn={},desc=[];
 doc.rels.forEach(([a,t,b])=>{if(a==='SPDXRef-DOCUMENT'&&t==='DESCRIBES'){desc.push(b);return}(out[a]=out[a]||[]).push([t,b]);(inn[b]=inn[b]||[]).push([t,a])});
 const byKey={};doc.pkgs.forEach((p,i)=>byKey[p.k]=i);return doc._ix={out,inn,desc,byKey}}
function pname(doc,i){if(typeof i!=='number')return `<i>${esc(i)}</i>`;const p=doc.pkgs[i];return `${esc(p.n)} <span class="muted">${esc(p.f.versionInfo||'')}${p.t==='src'?' (src)':''}${p.e!=='rpm'?' ['+esc(p.e)+']':''}</span>`}
function tree(el,key){const doc=S[key],ix=index(doc),m=doc.meta;
 let h=`<div class="panel"><h3>${esc(doc.label)}</h3><div class="muted">${esc(doc.src)}<br>${doc.pkgs.length} packages · ${esc(m.spdxVersion)} · ${esc((m.creators||[]).join(', '))}</div>`;
 h+=`<div class="muted">namespace: ${esc(m.namespace)}</div>`;
 h+=`<div class="node"><div class="leaf">document <b>${esc(m.name)}</b></div>`;
 if(!ix.desc.length)h+=`<div class="node leaf"><span class="b fail">no DESCRIBES root</span></div>`;
 ix.desc.forEach(d=>h+=nodeHTML(key,d,'DESCRIBES'));
 (m.extDocs||[]).forEach(x=>{const rel=doc.rels.filter(r=>String(r[0]).startsWith(x.externalDocumentId)||String(r[2]).startsWith(x.externalDocumentId));
  h+=`<div class="node leaf"><span class="rt EXT">externalDocumentRef</span>${esc(x.externalDocumentId)} <span class="muted">${esc(x.spdxDocument)} ${esc(x.checksum?.algorithm)}:${esc((x.checksum?.checksumValue||'').slice(0,12))}…</span>`+rel.map(r=>`<div class="node leaf"><span class="rt ${r[1]}">${r[1]}</span>${pname(doc,r[0])} → ${pname(doc,r[2])}</div>`).join('')+'</div>'});
 if(!(m.extDocs||[]).length)h+=`<div class="node leaf muted">no externalDocumentRefs (no build-root link)</div>`;
 el.innerHTML=h+'</div></div>'}
function nodeHTML(key,i,rt){const doc=S[key],ix=index(doc),kids=(ix.out[i]||[]);const p=typeof i==='number'?doc.pkgs[i]:null;
 const ck=p&&Object.keys(p.f).find(k=>k.startsWith('checksum.'));const extra=p&&rt==='DESCRIBES'?` <span class="muted">${esc(p.f.primaryPackagePurpose||'')} ${ck?esc(ck.slice(9))+':'+esc(p.f[ck].slice(0,12))+'…':'<span class="b fail">no checksum</span>'}</span>`:'';
 if(!kids.length)return `<div class="node"><div class="lbl leaf"><span class="rt ${rt}">${rt}</span>${pname(doc,i)}${extra}</div></div>`;
 const cnt={};kids.forEach(([t])=>cnt[t]=(cnt[t]||0)+1);
 return `<div class="node" data-k="${key}" data-i="${i}"><div class="lbl"><span class="rt ${rt}">${rt}</span>${pname(doc,i)}${extra} <span class="muted">(${Object.entries(cnt).map(([t,n])=>n+' '+t).join(', ')})</span></div></div>`}
document.addEventListener('click',e=>{const l=e.target.closest('.lbl');if(!l||l.classList.contains('leaf'))return;const n=l.parentElement;
 if(n.classList.toggle('open')){if(!n._r){const key=n.dataset.k,i=isNaN(+n.dataset.i)?n.dataset.i:+n.dataset.i,kids=index(S[key]).out[i]||[];
  const d=document.createElement('div');const MAX=400;d.innerHTML=kids.slice(0,MAX).map(([t,b])=>t==='CONTAINS'||t==='DEPENDS_ON'?nodeHTML(key,b,t):`<div class="node"><div class="lbl leaf"><span class="rt ${t}">${t}</span>${pname(S[key],b)}</div></div>`).join('')+(kids.length>MAX?`<div class="node muted">… ${kids.length-MAX} more</div>`:'');
  n.appendChild(d);n._r=d}n._r.style.display=''}else if(n._r)n._r.style.display='none'});
// field diff
function fieldDiff(){const q=$('pkgq').value.trim(),src=$('srcpkg').checked;const ia=index(A),ib=index(B);
 const find=(doc,ix)=>{for(const e of ['rpm','other','golang','npm','pypi']){const i=ix.byKey[e+':'+q+(src?':src':'')];if(i!=null)return doc.pkgs[i]}return doc.pkgs.find(p=>p.n===q&&(src?p.t==='src':p.t!=='src'))};
 const pa=find(A,ia),pb=find(B,ib);if(!pa&&!pb){$('fielddiff').innerHTML='<p class="muted">Not found in either SBOM.</p>';return}
 const keys=[...new Set([...Object.keys(pa?.f||{}),...Object.keys(pb?.f||{})])].sort();
 let h=`<table><tr><th>field</th><th>A: ${esc(A.label)}</th><th>B: ${esc(B.label)}</th><th></th></tr>`;
 for(const k of keys){const a=pa?.f[k],b=pb?.f[k];const ha=fv(a),hb=fv(b);const c=!ha&&hb?'added':ha&&!hb?'removed':a!==b?'changed':'';
  h+=`<tr class="${c}"><td>${esc(k)}</td><td class="v">${a==null?'<span class="muted">—</span>':esc(a)}</td><td class="v">${b==null?'<span class="muted">—</span>':esc(b)}</td><td>${c}</td></tr>`}
 $('fielddiff').innerHTML=(!pa?'<p><span class="b fail">absent in A</span></p>':'')+(!pb?'<p><span class="b fail">absent in B</span></p>':'')+h+'</table><p class="legend"><span class="b pass">added</span><span class="b fail">removed</span><span class="b warn">changed</span> (NOASSERTION counts as no value)</p>'}
$('pkgq').oninput=fieldDiff;$('srcpkg').onchange=fieldDiff;
// coverage
const COV=[['checksum','SHA256 checksum',p=>fv(p.f['checksum.SHA256'])],['anyck','any checksum',p=>Object.keys(p.f).some(k=>k.startsWith('checksum.'))],['ver','versionInfo with release (V-R)',p=>/-/.test(p.f.versionInfo||'')],['lic','licenseDeclared',p=>fv(p.f.licenseDeclared)],['licc','licenseConcluded',p=>fv(p.f.licenseConcluded)],['purl','purl',p=>fv(p.f.purl)],['rid','purl repository_id',p=>/repository_id=/.test(p.f.purl||'')],['sup','supplier',p=>fv(p.f.supplier)],['fn','packageFileName',p=>fv(p.f.packageFileName)],['dl','downloadLocation = NOASSERTION (guide)',p=>p.f.downloadLocation==='NOASSERTION'],['srpm','GENERATED_FROM → SRPM',p=>!!p.f['GENERATED_FROM →']],['si','sourceInfo',p=>fv(p.f.sourceInfo)]];
function coverage(){const sets=[A,B].map(d=>d.pkgs.filter(p=>p.e==='rpm'&&p.t!=='src'));
 let h=`<table><tr><th>field (binary RPMs only)</th><th>A: ${esc(A.label)} — ${sets[0].length} RPMs</th><th>B: ${esc(B.label)} — ${sets[1].length} RPMs</th></tr>`;
 for(const [,l,f] of COV){h+=`<tr><td>${esc(l)}</td>`+sets.map(s=>{const n=s.filter(f).length,pc=s.length?n/s.length*100:0;return `<td>${n} / ${s.length} (${pc.toFixed(0)}%)<div class="bar"><i style="width:${pc}%;background:${pc>95?'var(--pass)':pc>20?'var(--warn)':'var(--fail)'}"></i></div></td>`}).join('')+'</tr>'}
 const others=[A,B].map(d=>{const c={};d.pkgs.forEach(p=>c[p.t==='src'?'source RPM':p.e]=(c[p.t==='src'?'source RPM':p.e]||0)+1);return Object.entries(c).map(([k,v])=>`${v} ${k}`).join(', ')});
 h+=`<tr><td>all packages by kind</td><td>${esc(others[0])}</td><td>${esc(others[1])}</td></tr>`;
 $('coverage').innerHTML=h+'</table>'}
// set diff
function setDiff(){const q=$('setq').value.trim().toLowerCase(),f=$('setf').value,e=$('sete').value;
 const ok=p=>e==='any'||(e==='rpm'?p.e==='rpm'&&p.t!=='src':p.t==='src');
 const ma=new Map(),mb=new Map();A.pkgs.filter(ok).forEach(p=>ma.set(p.k,p));B.pkgs.filter(ok).forEach(p=>mb.set(p.k,p));
 const keys=[...new Set([...ma.keys(),...mb.keys()])].sort();let rows=[],c={a:0,b:0,both:0,ver:0,rel:0};
 for(const k of keys){const a=ma.get(k),b=mb.get(k);const s=a&&b?'both':a?'a':'b';c[s]++;const va=a?.f.versionInfo||'',vb=b?.f.versionInfo||'';const vd=a&&b&&va!==vb;const ra=vd&&vb.startsWith(va+'-');if(ra)c.rel++;else if(vd)c.ver++;
  if(f!=='all'&&!(f==='ver'?vd&&!ra:f==='rel'?ra:f===s))continue;if(q&&!k.toLowerCase().includes(q))continue;
  rows.push(`<tr class="${s==='a'?'removed':s==='b'?'added':vd?'changed':''}"><td><a href="#field" data-pkg="${esc((a||b).n)}" data-src="${(a||b).t==='src'?1:0}">${esc((a||b).n)}</a></td><td>${s==='a'?'only A':s==='b'?'only B':ra?'both · release added':vd?'both · version differs':'both'}</td><td class="v">${esc(a?.f.versionInfo||'')}</td><td class="v">${esc(b?.f.versionInfo||'')}</td></tr>`)}
 $('setcount').textContent=`only A: ${c.a} · only B: ${c.b} · both: ${c.both} (release added: ${c.rel}, version differs: ${c.ver}) · showing ${rows.length}`;
 $('setdiff').innerHTML=`<table><tr><th>package</th><th>where</th><th>A version</th><th>B version</th></tr>${rows.join('')}</table>`}
['setq','setf','sete'].forEach(i=>$(i).addEventListener('input',setDiff));
$('setdiff').onclick=e=>{const a=e.target.closest('a[data-pkg]');if(a){$('pkgq').value=a.dataset.pkg;$('srcpkg').checked=a.dataset.src==='1';fieldDiff()}};
function pick(i){const p=PAIRS[i];A=S[p.a];B=S[p.b];document.querySelectorAll('#pairs button').forEach((b,j)=>b.classList.toggle('on',j===i));
 $('pairnote').innerHTML=`<b>A</b> = ${esc(A.label)} · <b>B</b> = ${esc(B.label)}<br>${esc(p.d)}`;
 tree($('treeA'),p.a);tree($('treeB'),p.b);
 const names=[...new Set([...A.pkgs,...B.pkgs].map(x=>x.n))].sort();$('pkglist').innerHTML=names.map(n=>`<option value="${esc(n)}">`).join('');
 if(!$('pkgq').value||!names.includes($('pkgq').value))$('pkgq').value=names.includes('bash')?'bash':names[0];
 fieldDiff();coverage();setDiff();location.hash.length<2||0}
// explainer
const EX=[
 ['osbuild','Richer RPM metadata','Each RPM now carries its full version-release (5.1.8 → 5.1.8-9.el9), its file name, supplier, a concluded license, and a GENERATED_FROM link to the source RPM it was built from, which is added as its own package. Scanners can match CVEs on the exact build.'],
 ['osbuild','Red Hat guide layout','downloadLocation becomes NOASSERTION (the mirror URL moves into an annotation), purls use repository_id instead of a mirror URL, LicenseRefs are defined and licenseListVersion is set. That is what the Red Hat SBOM guide asks for.'],
 ['osbuild','One root for the image','The document DESCRIBES a single OPERATING_SYSTEM package for the image, which CONTAINS the RPMs. Unpatched osbuild DESCRIBES every RPM directly, so tools such as Trustify have no single thing the SBOM is about.'],
 ['osbuild','Build root kept separate','Tools used only to build the image go in a second SBOM, linked with an externalDocumentRef and BUILD_TOOL_OF, so they stay out of the image package list.'],
];
$('explain').innerHTML=EX.map(([r,t,d])=>`<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p><a href="${PR[r]}">${PR[r].replace('https://github.com/','').replace('/pull/','#')}</a></div>`).join('');
pick(0);document.getElementById('cmp').querySelector('#pairs').style.display='none';
