#!/usr/bin/env python3
"""Preprocess SPDX SBOMs from /workspace/sbom-research into compact JSON for the site."""
import json, os, re, urllib.parse
R=os.environ.get('SBOM_RESEARCH','../sbom-research'); O=os.environ.get('SBOM_OUTPUT','../sbom-output')
DOCS={
 'unpatched':(O+'/centos-9-unpatched/centos-9-qcow2-x86_64.image-os.spdx.json','osbuild main (unpatched)'),
 'patched':(O+'/final/manifest-centos-9/centos-9-qcow2-x86_64.image-os.spdx.json','osbuild + patches (osbuild#1)'),
}
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
out={}
for k,(p,label) in DOCS.items():
    c=compact(p); c['label']=label; c['src']=os.path.relpath(p,os.path.dirname(R)); out[k]=c
    print(k,len(c['pkgs']),len(c['rels']))
s=json.dumps(out,separators=(',',':'))
open('data/sboms.json','w').write(s)
open('data/sboms.js','w').write('window.SBOMS='+s+';')
print('bytes',len(s))
