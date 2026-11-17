"""Builds the single-file game (index.html) from src/, shared/ and assets/.
Usage: python3 build.py"""
import json,base64,os
R=os.path.dirname(os.path.abspath(__file__))
rd=lambda p:open(os.path.join(R,p),encoding='utf-8').read()
def data(p):
    ext=p.rsplit('.',1)[1];mime={'jpg':'jpeg'}.get(ext,ext)
    return f'data:image/{mime};base64,'+base64.b64encode(open(os.path.join(R,p),'rb').read()).decode()
def folder(d):return {os.path.splitext(f)[0]:data(f'{d}/{f}') for f in sorted(os.listdir(os.path.join(R,d)))}
man=json.load(open(os.path.join(R,'assets/manifest.json')))
P={k:data(v[3]) for k,v in man['cases'].items()}
WF={k:[data(x) for x in v[:3]] for k,v in man['cases'].items()}
assets='const PORTRAITS='+json.dumps(P)+';const WF='+json.dumps(WF)+';const CF='+json.dumps(folder('assets/court'))+';const EI='+json.dumps(folder('assets/cards'))+';const ARTHUR="'+data(man['arthur'])+'";'
s=rd('src/game.html')
for k,v in {'/*FONTS*/':rd('shared/fonts.css'),'/*SPLASHCSS*/':rd('shared/splash.css'),'/*SPLASHHTML*/':rd('shared/splash.html'),'/*AUDIO*/':rd('shared/audio.js'),'/*ASSETS*/':assets,
 '/*ENGINE*/':rd('src/cases.js')+rd('src/engine.js'),'/*NOTES*/':rd('src/notes.js')}.items():
    assert k in s,k;s=s.replace(k,v)
open(os.path.join(R,'index.html'),'w',encoding='utf-8').write(s);print('index.html',len(s),'bytes')
