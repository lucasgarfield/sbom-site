#!/usr/bin/env python3
"""Preprocess SPDX SBOMs (osbuild main vs patched) into compact JSON for the site."""
import glob, json, os, re, urllib.parse
R=os.environ.get('SBOM_RESEARCH','../sbom-research'); O=os.environ.get('SBOM_OUTPUT','../sbom-output')
F=O+'/fedora-qcow2'
RES=F+'/results'
# id: (path or None, label, stage, note)
DOCS={
 'u-pkg':(F+'/u-pkg-built/fedora-44-generic-qcow2-x86_64.image-os.spdx.json','osbuild main (unpatched)','built','image-builder main + osbuild 193 RPM; real qcow2 build in the Fedora 44 TCG VM'),
 'p-pkg':(F+'/p-pkg-built/fedora-44-generic-qcow2-x86_64.image-os.spdx.json','osbuild + images patches','built','patched image-builder (images 0001-0005) + patched osbuild SBOM code; real qcow2 build in the VM'),
 'u-bootc':(None,'osbuild main (unpatched)','manifest','no SBOM: image-builder main `manifest qcow2 --bootc-ref quay.io/coreos-devel/fedora-coreos@sha256:789b90d2… --with-sbom` exits 0 and writes the manifest but no SBOM file'),
 'p-bootc':(F+'/p-fcos-built/*.image-disk.spdx.json','image-builder + bootc patch 0005','built','`--bootc-ref-sbom` with the registry-attached Konflux SBOM: packages merged inline, GENERATED_FROM the container SBOM, disk sha256 recorded after the build'),
 'ctr-bootc':(R+'/bootc-konflux/fcos.spdx.json','input: Konflux container SBOM (registry-attached)','input','quay.io/coreos-devel/fedora-coreos:rawhide, amd64 sha256:789b90d2…; fetched exactly like build-vm-image 0.3 download-sbom (`cosign download sbom --platform=linux/amd64 <image>`); root checksum and pkg:oci purl = that digest. A Konflux container-build SBOM (syft 1.44 + hermeto + mobster 1.2.1) that build-vm-image re-attaches; not produced by build-vm-image itself'),
}
CASES=[
 {'id':'pkg','title':'Package mode (Fedora 44 qcow2)','docs':['u-pkg','p-pkg'],'pairs':[['u-pkg','p-pkg']]},
 {'id':'bootc','title':'bootc (qcow2 from Fedora CoreOS, Konflux-built container)','docs':['u-bootc','p-bootc','ctr-bootc'],'footnote':'An earlier run used quay.io/fedora/fedora-bootc:44 with a syft-generated input SBOM, because that image has no attached SBOM. It was replaced by this registry-attached Konflux SBOM. With the syft input the merged SBOM failed spdx-tools and mobster on undefined LicenseRefs from syft; with the Konflux SBOM both pass.','pairs':[['u-bootc','p-bootc'],['ctr-bootc','p-bootc']]},
]
def purls(p): return [r['referenceLocator'] for r in p.get('externalRefs',[]) if r.get('referenceType')=='purl']
def eco(p):
    u=purls(p); 
    if not u: return 'other'
    m=re.match(r'pkg:([^/]+)/',u[0]); return m.group(1) if m else 'other'
def arch(p):
    for u in purls(p):
        q=urllib.parse.parse_qs(u.split('?',1)[1]) if '?' in u else {}
        if 'arch' in q: return q['arch'][0]
    fn=p.get('packageFileName','')
    return 'src' if fn.endswith('.src.rpm') else ''
def norm(v):
    return None if v in (None,'',[],'NOASSERTION','NONE') else v
def compact(path):
    d=json.load(open(path)); ids={}
    pk=[]; seen={}
    for p in d.get('packages',[]):
        e=eco(p); a=arch(p); kind='src' if a=='src' else ('bin' if e=='rpm' else e)
        base=f"{e}:{p['name']}" + (':src' if kind=='src' else '')
        n=seen.get(base,0); seen[base]=n+1; key=base+(f'#{n}' if n else '')
        f={}
        for k in ['versionInfo','supplier','originator','downloadLocation','packageFileName','licenseDeclared','licenseConcluded','copyrightText','sourceInfo','primaryPackagePurpose','homepage','summary','builtDate']:
            if k in p: f[k]=p[k]
        if 'description' in p: f['description']=p['description'][:200]+('…' if len(p['description'])>200 else '')
        for c in p.get('checksums',[]): f['checksum.'+c['algorithm']]=c['checksumValue']
        for i,u in enumerate(purls(p)): f['purl'+(f'[{i}]' if i else '')]=u
        for r in p.get('externalRefs',[]):
            if r.get('referenceType')!='purl': f['ref.'+r['referenceType']]=r['referenceLocator']
        for i,a2 in enumerate(p.get('annotations',[])): f[f'annotation[{i}]']=a2.get('comment','')
        ids[p['SPDXID']]=len(pk)
        pk.append({'k':key,'n':p['name'],'e':e,'t':kind,'f':f})
    rels=[]
    for r in d.get('relationships',[]):
        a=r['spdxElementId']; b=r['relatedSpdxElement']; t=r['relationshipType']
        A=ids.get(a,a); B=ids.get(b,b)
        if (isinstance(A,int) or A=='SPDXRef-DOCUMENT' or 'DocumentRef' in str(A)) and (isinstance(B,int) or 'DocumentRef' in str(B)): rels.append([A,t,B])
    # srpm link field
    for A,t,B in rels:
        if t=='GENERATED_FROM' and isinstance(A,int) and isinstance(B,int): pk[A]['f']['GENERATED_FROM →']=pk[B]['n']+' (SRPM)'
        if t=='GENERATED_FROM' and isinstance(B,int) and isinstance(A,int) and False: pass
    ci=d.get('creationInfo',{})
    meta={'name':d.get('name'),'spdxVersion':d.get('spdxVersion'),'namespace':d.get('documentNamespace'),
          'creators':ci.get('creators'),'created':ci.get('created'),'comment':ci.get('comment'),
          'licenseListVersion':ci.get('licenseListVersion'),'extDocs':d.get('externalDocumentRefs',[]),
          'licenseRefs':len(d.get('hasExtractedLicensingInfos',[]))}
    return {'meta':meta,'pkgs':pk,'rels':rels}

def override(k):
    p=os.environ.get('DOC_'+k.replace('-','_').upper())
    return p
out={}
for k,(p,label,stage,note) in DOCS.items():
    p=override(k) or p
    if p and '*' in p:
        g=sorted(glob.glob(p)) or sorted(glob.glob(p.replace('-built/','-manifest/')))
        if g and '-manifest/' in g[0]: stage='manifest'; note+=' (manifest-time copy: the bootc build had not finished, so no disk sha256 yet; Conforma pushed placeholder disk bytes)'
        p=g[0] if g else None
        if p is None: stage,note='pending','bootc build still running in the TCG VM; not measured yet'
    if p and not os.path.exists(p):
        alt=p.replace('-built/','/')  # manifest-time fallback
        if os.path.exists(alt): p,stage=alt,'manifest'
        else: p=None
    if p is None:
        out[k]={'label':label,'stage':stage,'note':note,'missing':True}; continue
    c=compact(p); c.update(label=label,stage=stage,note=note,src=os.path.relpath(p,os.path.dirname(O)))
    out[k]=c; print(k,stage,len(c['pkgs']))
# results -> scorecard
ev={}
for f in glob.glob(RES+'/eval*.jsonl'):
    for l in open(f):
        if l.strip(): j=json.loads(l); ev[j['name']]=j
def ec(name,pol):
    f=f'{RES}/conforma/{name}.{pol}.ec.json'
    if not os.path.exists(f): return None
    c=json.load(open(f))['components'][0]
    pick=lambda xs:[x['metadata']['code'] for x in (xs or []) if re.match(r'(sbom|sbom_spdx|rpm_repos|rpm_packages|rpm_build_deps)\.',x['metadata']['code'])]
    return {'v':pick(c.get('violations')),'w':pick(c.get('warnings')),'s':len(pick(c.get('successes'))),'tv':len(c.get('violations') or []),'wall':c.get('warnings') or []}
NR=['nr','not run']
def cells(k):
    e=ev.get({'p-bootc':'p-fcos','ctr-bootc':'ctr-fcos'}.get(k,k)); d=out[k]
    if d.get('missing'): return {r:(['nr','pending: build not finished'] if d['stage']=='pending' else ['na','no SBOM']) for r in ROWS}
    r={}
    if not e: return {x:NR for x in ROWS}
    r['spdx']=['pass','valid'] if e['spdx']=='valid' else ['fail',e['spdx']]
    g=e['grade']; r['grader']=[{'A':'pass','B':'warn','C':'warn'}.get(g,'fail'),g+(': fails '+e['grade_fail'].replace(';','; ') if e['grade_fail'] else '')]
    for key,lab in (('mequal_up','mequp'),('mequal_p','meqp')):
        v=e[key]; ids=e[key+'_ids']
        r[lab]=['pass' if 'error' not in v and 'warning' not in v else ('fail' if 'error' in v else 'warn'), v+(' ('+ids+')' if ids else '')]
    r['mobup']=['fail',f"rejected: {e['mobster_up_err'] or 'rc='+e['mobster_up_rc']} (upstream has no way to take a disk SBOM)"] if e['mobster_up_rc']!='0' else ['pass','wrapped']
    r['mobp']=['pass',f"wrapped, {e['mobster_p_pkgs']} packages in output"] if e['mobster_p_rc']=='0' else ['fail','refused: '+e['mobster_p_err']]
    if e['trustify_id']:
        w=e['trustify_warnings']; r['trust']=['pass' if not w else 'warn',f"ingested, {e['trustify_packages']} packages; "+(f"{len(w)} warning(s): "+'; '.join(w)[:300] if w else 'no warnings')]
        r['tvuln']=['info',f"{e['trustify_advisories']} advisories matched (no Fedora advisory data loaded; Trustify matches by purl namespace)"]
    else: r['trust']=['fail','upload failed: '+e['trustify_resp']]; r['tvuln']=NR
    for pol,lab in (('fcos','ecf'),('redhat_security','ecs')):
        x=ec({'p-bootc':'p-fcos','ctr-bootc':'ctr-fcos'}.get(k,k),pol)
        if not x: r[lab]=NR; continue
        mi=[c for c in x['v']+x['w'] if c=='sbom_spdx.matches_image']
        txt=f"SBOM/RPM rules: {len(set(x['v']))} failing, {len(set(x['w']))} warning ({x['s']} pass)"
        if x['v']: txt+='; fails '+', '.join(f'{c} ×{x["v"].count(c)}' for c in sorted(set(x['v'])))
        if x['w']: txt+='; warns '+', '.join(f'{c} ×{x["w"].count(c)}' for c in sorted(set(x['w'])))
        r[lab]=['fail' if x['v'] else 'warn' if x['w'] else 'pass',txt+f". Total incl. faked-provenance rules: {x['tv']} violations"]
    for pol,lab in (('fcos','ecwf'),('redhat_security','ecws')):
        x=ec({'p-bootc':'p-fcos'}.get(k,k)+'-mobster',pol)
        if not x: r[lab]=['na','not possible: mobster refused this SBOM'] if e['mobster_p_rc']!='0' else NR; continue
        txt=f"SBOM/RPM rules: {len(set(x['v']))} failing, {len(set(x['w']))} warning ({x['s']} pass)"
        if x['v']: txt+='; fails '+', '.join(f'{c} ×{x["v"].count(c)}' for c in sorted(set(x['v'])))
        if x['w']: txt+='; warns '+', '.join(f'{c} ×{x["w"].count(c)}' for c in sorted(set(x['w'])))
        r[lab]=['fail' if x['v'] else 'warn' if x['w'] else 'pass',txt]
    if k=='ctr-bootc':
        r['mobp']=['na','n/a: refuses by design, the container SBOM root is the container digest, not a disk ('+r['mobp'][1][9:120]+'…)']
        for l in ('ecf','ecs'):
            if r[l][0]!='nr': r[l][1]+=' (same SBOM bytes as the earlier build-vm-image run, sbom-research/conforma/a-konflux-fcos, with placeholder disk bytes)'
    return r
ROWS={'spdx':'spdx-tools validation','grader':'sbom-grader (Red Hat guide)','mequp':'mequal, upstream policies','meqp':'mequal, ProdSec-patched policies',
 'mobup':'mobster upstream: oci-artifact --from-sbom','mobp':'mobster PR branch: oci-artifact --from-sbom --fold-content-root',
 'ecf':'Conforma, FCOS production policy (SBOM attached as-is)','ecs':'Conforma, @redhat_security (SBOM attached as-is)',
 'ecwf':'Conforma, FCOS policy (mobster-wrapped SBOM)','ecws':'Conforma, @redhat_security (mobster-wrapped SBOM)',
 'trust':'Trustify ingestion','tvuln':'Trustify vulnerability results'}
score={'rows':ROWS,'cases':{}}
for c in CASES:
    score['cases'][c['id']]={k:cells(k) for k in c['docs']}
meta={'cases':CASES,'score':score}
s=json.dumps(out,separators=(',',':'))
open('data/sboms.json','w').write(s)
open('data/sboms.js','w').write('window.SBOMS='+s+';window.META='+json.dumps(meta,separators=(',',':'))+';')
open('data/meta.json','w').write(json.dumps(meta,indent=1))
print('bytes',len(s))
