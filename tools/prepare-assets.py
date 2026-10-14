"""Make only game-ready derivatives; original reference art is never distributed."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import colorsys,json
OUT=Path('public/assets'); OUT.mkdir(exist_ok=True)
# Rebuild the normalised reference-specific 32x48 character atlases.
import runpy
runpy.run_path(str(Path(__file__).with_name('character-art.py')),run_name='__main__')
# Portraits: crop, downsample and quantize supplied references (derivatives only).
for name,fn,box in [('ryoma','chr_ryoma_01_tsuujou.png',(332,20,702,440)),('mie','chr_mie_01_reishou.png',(330,0,690,440)),('rei','chr_rei_01_suzushii.png',(20,0,390,420))]:
 p=Path('google_drive')/fn
 if p.exists():
  im=Image.open(p).convert('RGBA');print(fn,im.size)
  # References have very different widths; face bounding boxes are explicit.
  if name=='rei' and im.width>500: box=(int(im.width*.28),0,int(im.width*.72),int(im.height*.30))
  im=im.crop(box).resize((96,112),Image.Resampling.LANCZOS)
  im=im.quantize(colors=48,method=Image.Quantize.FASTOCTREE).convert('RGBA')
  im.save(OUT/f'{name}-portrait.png')
# External animated foes assembled losslessly, subtly unified to violet palette.
for name in ['necromancer','chort','big_demon']:
 frames=[Image.open(f'.cache/frames/{name}_idle_anim_f{i}.png').convert('RGBA') for i in range(4)]
 w,h=frames[0].size; sheet=Image.new('RGBA',(w*4,h))
 for i,im in enumerate(frames):
  for y in range(h):
   for x in range(w):
    r,g,b,a=im.getpixel((x,y))
    if a:
     lum=max(r,g,b)/255
     rr,gg,bb=colorsys.hsv_to_rgb(.735,.37,lum)
     im.putpixel((x,y),(int(rr*255),int(gg*255),int(bb*255),a))
  sheet.paste(im,(i*w,0))
 sheet.save(OUT/f'{name}.png')
# 40-frame public-domain explosion remapped into a 32px violet dissolve.
im=Image.open('.cache/explosion-realistic-128x128.png').convert('RGBA')
sheet=Image.new('RGBA',(32*8,32*5))
for f in range(40):
 p=im.crop(((f%8)*128,(f//8)*128,(f%8+1)*128,(f//8+1)*128)).resize((32,32),Image.Resampling.LANCZOS)
 for y in range(32):
  for x in range(32):
   r,g,b,a=p.getpixel((x,y));m=max(r,g,b);p.putpixel((x,y),(int(m*.83),int(m*.67),m,a))
 sheet.paste(p,((f%8)*32,(f//8)*32))
sheet.save(OUT/'dissolve.png')

# Authored eight-frame pixel impact by ansimuz; native resolution is retained.
Image.open(".cache/explosion-1.png").save(OUT/"impact.png")
