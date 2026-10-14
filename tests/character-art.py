"""Pixel-level regressions: catches visually reversed atlases, not just enums.
Run: .venv/bin/python tests/character-art.py (Pillow required).
"""
from pathlib import Path
import hashlib
from PIL import Image

root=Path(__file__).resolve().parents[1]
front_heads=[]
for name in ['ryoma','mie','rei']:
    for anim in ['run','idle_anim']:
        im=Image.open(root/f'public/assets/{name}-{anim}.png').convert('RGBA')
        assert im.size==(768,48)
        for direction in range(4):
            unique=set()
            for i in range(6):
                frame=im.crop(((direction*6+i)*32,0,(direction*6+i+1)*32,48))
                unique.add(hashlib.sha256(frame.tobytes()).digest())
                # Reference heads are anchored above y=21 (neck pixels below are legitimate); uniform hands are below it.
                skin=[]
                for y in range(21):
                    for x in range(32):
                        r,g,b,a=frame.getpixel((x,y))
                        if a and r>180 and g>140 and r>g*1.08 and g>b*1.05:skin.append((x,y))
                if direction==0:assert skin and sum(x for x,y in skin)/len(skin)<13,(name,anim,direction,i,'left face points right')
                if direction==2:assert skin and sum(x for x,y in skin)/len(skin)>18,(name,anim,direction,i,'right face points left')
                if direction==1:assert not skin,(name,anim,i,'face leaked onto back of head')
                assert frame.getbbox(),(name,anim,direction,i,'empty frame')
                # A real alpha-connected neck must link head, jacket and feet.
                opaque={(x,y) for y in range(48) for x in range(32) if frame.getpixel((x,y))[3]}
                seed=min(opaque,key=lambda xy:xy[1]*32+abs(xy[0]-16))
                connected={seed};queue=[seed]
                for x,y in queue:
                    for dx,dy in [(1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,1),(1,-1),(-1,-1)]:
                        p=(x+dx,y+dy)
                        if p in opaque and p not in connected:connected.add(p);queue.append(p)
                assert any(y>=43 for x,y in connected),(name,anim,direction,i,'floating head or torso')

            assert len(unique)>=3,(name,anim,direction,'animation collapsed to still')
        if anim=='run':
            front=im.crop((18*32,0,19*32,24));front_heads.append(hashlib.sha256(front.tobytes()).digest())
        if name=='rei':
            # Every pose retains the gold-edged book in the right hand, including the back view.
            book_colours={(182,168,135),(214,200,162),(186,168,141),(169,158,137)}
            for i in range(24):
                crop=im.crop((i*32,28,(i+1)*32,48))
                assert any(p[:3] in book_colours and p[3] for p in crop.get_flattened_data()),(anim,i,'missing book')
assert len(set(front_heads))==3,'characters lost their distinguishing head designs'
print('PASS: all 144 frames; left/right face pixels, no face on back, distinct heads, animated poses, Rei book continuity, head-to-foot connectivity')
