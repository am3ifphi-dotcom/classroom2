"""Reference-specific edits over LimeZu's six-frame movement silhouettes.

The original Alex strips are RIGHT, UP, LEFT, DOWN. Output is explicitly
normalised to LEFT, UP, RIGHT, DOWN. Each frame is 32x48 with a stable foot
anchor. Head, school-uniform details and Rei's book are reference-specific
pixel edits, not assets authored by LimeZu. No high-resolution references
are copied into the output or required to regenerate the field sprites.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageOps

W, H = 32, 48
DIRECTIONS = ['left', 'up', 'right', 'down']
SOURCE_BLOCKS = [2, 1, 0, 3]
OUT = Path('public/assets')
PALETTES = {
 'ryoma': ['#482f2c','#704338','#925540','#b77450','#cd9469'],
 'mie': ['#29262b','#3c3132','#51413c','#675248','#80695a'],
 'rei': ['#222331','#303140','#40404f','#50515f','#656170'],
}
SKIN = ['#ac7668','#d49b81','#edbea0','#f7d9b8','#ffe6c9']
OUTLINE = '#262b3c'


def head(name, direction, blink=False):
    im = Image.new('RGBA', (32, 24))
    d = ImageDraw.Draw(im)
    h = PALETTES[name]
    if direction == 'up':
        # Occiput only: glasses and face pixels must never appear in this view.
        contour = [(7,6),(9,3),(14,2),(18,1),(23,3),(25,7),(26,13),(24,18),(21,21),(10,21),(7,18),(6,12)]
        if name == 'ryoma':
            contour = [(6,9),(5,6),(8,6),(7,2),(12,4),(15,0),(17,3),(23,1),(23,4),(27,5),(25,9),(26,13),(23,19),(19,20),(11,20),(7,16)]
        if name == 'rei':
            contour = [(6,8),(5,5),(9,5),(11,2),(15,3),(18,1),(22,3),(26,3),(25,6),(27,9),(25,10),(27,15),(24,14),(25,19),(22,18),(21,22),(18,20),(14,22),(12,20),(8,22),(8,18),(5,17),(7,14)]
        d.polygon(contour, fill=h[0]);d.polygon([(8,8),(11,4),(18,3),(23,6),(24,12),(21,18),(12,18),(8,14)],fill=h[1])
        d.polygon([(9,7),(13,4),(20,5),(22,8),(18,9),(12,8)],fill=h[2])
        d.line([(10,6),(15,4),(20,5)],fill=h[3]);d.line([(9,11),(10,16),(12,18)],fill=h[2])
        d.line([(22,10),(21,15),(19,18)],fill=h[2]);d.line([(14,12),(15,18)],fill=h[0])
        if name=='ryoma':
            for a,b in [((9,7),(12,3)),((14,7),(16,2)),((19,7),(23,3))]:d.line([a,b],fill=h[3])
        return im
    if direction in ('right','left'):
        # Profile has its eye and nose on the requested screen side.
        d.polygon([(16,7),(22,6),(25,8),(26,11),(26,13),(28,14),(26,15),(25,18),(22,20),(17,19),(14,16)],fill=SKIN[1])
        d.polygon([(20,8),(24,9),(25,12),(25,14),(27,14),(24,16),(24,18),(21,19),(18,17),(18,11)],fill=SKIN[3])
        d.line([(22,19),(24,18)],fill=SKIN[0]);d.point((25,16),fill=SKIN[0])
        d.rectangle((15,12,18,16),fill=SKIN[2]);d.line((16,13,16,15),fill=SKIN[0])
        d.line((22,11,24,11),fill=h[0])
        if blink:d.line((23,13,25,13),fill=OUTLINE)
        else:
            d.line((23,12,25,12),fill=OUTLINE);d.point((24,13),fill='#565564');d.point((25,13),fill=SKIN[4])
        if name == 'ryoma':
            contour=[(6,10),(4,7),(8,7),(6,3),(11,5),(12,1),(16,3),(19,0),(21,3),(25,2),(24,5),(27,5),(25,8),(21,8),(18,9),(17,12),(15,12),(15,17),(16,19),(15,20),(13,20),(10,18),(7,15)]
        elif name == 'mie':
            contour=[(6,8),(8,5),(12,3),(18,2),(22,4),(25,7),(25,10),(23,9),(22,12),(21,9),(19,12),(17,11),(16,14),(14,13),(15,17),(16,19),(15,20),(13,20),(10,18),(8,16),(6,13)]
        else:
            contour=[(5,9),(7,5),(6,3),(10,4),(12,1),(17,3),(20,1),(22,4),(26,5),(25,8),(27,10),(25,11),(25,14),(23,13),(23,10),(21,13),(19,11),(17,15),(15,13),(15,18),(13,21),(11,19),(8,21),(8,17),(6,18),(7,14),(5,15)]
        d.polygon(contour,fill=h[0]);d.polygon([(8,8),(12,5),(17,4),(22,6),(21,8),(17,9),(14,13),(10,15),(8,13)],fill=h[1])
        d.polygon([(10,6),(14,4),(20,5),(21,7),(16,7),(12,10)],fill=h[2]);d.line([(11,6),(15,4),(19,5)],fill=h[3])
        d.line([(9,10),(10,14),(12,16)],fill=h[2]);d.line([(17,8),(15,11)],fill=h[3])
        if name=='ryoma':
            d.line([(10,7),(13,3)],fill=h[3]);d.line([(16,6),(19,2)],fill=h[4]);d.line([(21,6),(24,4)],fill=h[3])
        if name!='rei':
            d.line((17,12,22,13),fill='#38373d');d.rectangle((22,12,26,14),outline='#38373d');d.point((25,13),fill='#b4b6b9')
        else:
            d.line([(20,7),(22,9),(21,11)],fill=h[2]);d.point((8,19),fill=h[2])
        return ImageOps.mirror(im) if direction=='left' else im
    # Front: same face anchor for all frames, independent of hair colour.
    d.polygon([(9,7),(22,7),(24,11),(24,16),(21,20),(17,22),(12,21),(8,17),(7,12)],fill=SKIN[0])
    d.polygon([(10,8),(21,8),(23,11),(22,17),(19,20),(14,20),(10,17),(9,11)],fill=SKIN[2])
    d.polygon([(12,9),(20,9),(22,12),(21,17),(18,20),(14,19),(11,16)],fill=SKIN[3])
    d.rectangle((7,12,9,16),fill=SKIN[1]);d.rectangle((23,12,24,16),fill=SKIN[1]);d.point((8,13),fill=SKIN[3]);d.point((23,13),fill=SKIN[3])
    d.line((16,16,17,17),fill=SKIN[1]);d.line((15,19,18,19),fill='#ac7a70')
    d.line((10,11,13,10),fill=h[0]);d.line((18,10,21,11),fill=h[0])
    if blink:
        d.line((10,14,13,14),fill=OUTLINE);d.line((18,14,21,14),fill=OUTLINE)
    else:
        for x in [10,18]:
            d.line((x,13,x+3,13),fill=OUTLINE);d.rectangle((x+1,14,x+2,15),fill='#555461');d.point((x+3,14),fill=SKIN[4]);d.point((x+1,13),fill='#353540')
    if name=='ryoma':
        contour=[(7,13),(6,10),(5,7),(5,5),(8,6),(8,3),(11,4),(14,1),(16,3),(21,2),(21,4),(25,3),(25,6),(26,7),(25,10),(24,13),(22,11),(22,8),(19,7),(15,7),(11,8),(9,11),(9,14)]
    elif name=='mie':
        contour=[(7,14),(6,10),(7,6),(10,3),(15,2),(20,3),(23,5),(25,8),(25,12),(23,15),(22,11),(21,8),(18,10),(16,12),(16,9),(12,12),(12,9),(9,13),(9,16)]
    else:
        contour=[(5,11),(6,7),(5,5),(9,5),(11,2),(15,3),(18,1),(21,3),(26,2),(25,5),(28,8),(26,10),(27,12),(25,12),(25,16),(22,19),(22,13),(20,15),(20,10),(17,12),(13,15),(13,11),(10,14),(10,18),(8,16),(7,20),(7,15),(5,16)]
    d.polygon(contour,fill=h[0]);d.polygon([(8,8),(11,5),(17,4),(22,5),(24,8),(21,7),(17,8),(13,9),(10,11),(8,12)],fill=h[1])
    d.polygon([(9,7),(13,4),(19,4),(22,6),(18,6),(14,7),(11,9)],fill=h[2]);d.line([(10,6),(15,4),(19,5)],fill=h[3])
    if name=='ryoma':
        d.line([(9,7),(8,4)],fill=h[3]);d.line([(12,6),(14,2)],fill=h[4]);d.line([(17,5),(20,3)],fill=h[3]);d.line([(22,7),(25,4)],fill=h[3])
    else:
        d.line([(20,6),(17,9)],fill=h[3]);d.line([(14,7),(11,11)],fill=h[2]);d.line([(23,9),(23,12)],fill=h[2])
    if name!='rei':
        # Thin rectangular frames sit on the eyes, never detected from hair RGB.
        d.rectangle((9,12,14,15),outline='#3a383f');d.rectangle((17,12,22,15),outline='#3a383f');d.line((14,13,17,13),fill='#3a383f');d.line((7,12,9,13),fill='#3a383f');d.line((22,13,24,12),fill='#3a383f');d.point((13,13),fill='#bec0bd');d.point((21,13),fill='#bec0bd')
    else:
        # Long, separated locks rather than the old short-haired Adam silhouette.
        d.line([(11,9),(9,13),(9,16)],fill=h[2]);d.line([(18,8),(15,11),(14,13)],fill=h[2]);d.line([(24,13),(23,16)],fill=h[2])
    return im


def recolour_body(piece):
    """Preserve author-authored arm/leg silhouettes, not the original plaid shirt."""
    piece=piece.convert('RGBA')
    for y in range(piece.height):
        for x in range(piece.width):
            r,g,b,a=piece.getpixel((x,y))
            if not a: continue
            if r>=195 and g>=140 and b>=115:
                color = (239,194,163,a) if g>185 else (207,153,126,a)
            else:
                # Exact brightness bands intentionally eliminate ALL red plaid pixels.
                v=max(r,g,b)
                color=(*( (34,40,57) if v<88 else (48,56,76) if v<120 else (64,74,95) if v<157 else (80,91,111) ),a)
            piece.putpixel((x,y),color)
    return piece


def frame(name, direction, source, index, anim):
    # Original head top is measured from alpha; skin colours never affect anchoring.
    top=min(y for y in range(32) for x in range(16) if source.getpixel((x,y))[3])
    neck=top+13;hip=min(29,top+18);ny=26+(top-10)
    im=Image.new('RGBA',(W,H))
    torso=recolour_body(source.crop((0,neck,16,hip))).resize((32,12),Image.Resampling.NEAREST)
    legs=recolour_body(source.crop((0,hip,16,32))).resize((32,H-ny-12),Image.Resampling.NEAREST)
    for yy in range(max(0,legs.height-3),legs.height):
        for xx in range(legs.width):
            r,g,b,a=legs.getpixel((xx,yy))
            if a:legs.putpixel((xx,yy),(29 if b<90 else 49,32 if b<90 else 53,43 if b<90 else 64,a))
    im.alpha_composite(legs,(0,ny+12));im.alpha_composite(torso,(0,ny))
    d=ImageDraw.Draw(im)
    # All three wear navy blazers, white shirts and burgundy ties, not red vests.
    if direction=='down':
        d.polygon([(10,ny),(21,ny),(24,ny+4),(22,ny+11),(17,ny+12),(9,ny+11),(8,ny+4)],fill='#30384c')
        d.polygon([(12,ny),(19,ny),(18,ny+7),(15,ny+7)],fill='#ecdfcf')
        d.polygon([(12,ny),(16,ny+2),(14,ny+5),(11,ny+1)],fill='#faf1df')
        d.polygon([(19,ny),(16,ny+2),(18,ny+5),(21,ny+1)],fill='#d3d0c9')
        knot=ny+3 if name=='rei' else ny+2
        d.polygon([(15,knot),(17,knot),(17,knot+2),(18,ny+8),(16,ny+10),(15,ny+8)],fill='#8c3e47');d.line((16,knot+2,16,ny+7),fill='#b46260')
        d.line([(10,ny),(12,ny+4),(14,ny+5),(13,ny+7),(16,ny+11)],fill='#51596b')
        d.line([(21,ny),(19,ny+4),(18,ny+5),(20,ny+6),(17,ny+11)],fill='#222a3e')
        d.line((21,ny+6,23,ny+6),fill='#586074');d.point((16,ny+10),fill='#a6a092')
        if name=='rei':d.polygon([(14,ny+10),(17,ny+12),(12,ny+12)],fill='#d4cfc7')
    elif direction=='up':
        d.polygon([(9,ny),(22,ny),(23,ny+10),(17,ny+12),(8,ny+10)],fill='#30394e')
        d.line([(11,ny),(15,ny+1),(19,ny)],fill='#d3cdc5');d.line([(10,ny+2),(15,ny+3),(21,ny+2)],fill='#515b70')
        d.line((16,ny+4,16,ny+10),fill='#3f4a62');d.line((16,ny+10,15,ny+12),fill='#22293b')
        d.line((10,ny+5,9,ny+9),fill='#434f66');d.line((20,ny+5,21,ny+9),fill='#22293b')
    else:
        # Draw right-facing jacket panel, then mirror that panel only for left.
        panel=Image.new('RGBA',(32,16));q=ImageDraw.Draw(panel)
        q.polygon([(11,0),(19,0),(23,3),(23,11),(17,12),(11,10)],fill='#323c51')
        q.polygon([(18,0),(22,2),(21,6),(19,3)],fill='#f0e3cf');q.line([(19,3),(21,7),(20,9)],fill='#984951')
        q.line([(17,1),(19,5),(17,6),(19,10)],fill='#566175');q.line((13,3,13,10),fill='#414d65')
        q.line((20,10,23,10),fill='#20283a');q.point((22,9),fill='#a39e91')
        if direction=='left':panel=ImageOps.mirror(panel)
        im.alpha_composite(panel,(0,ny))
        # A profile needs a sloping trapezius/back collar under the occiput.
        # Merely joining the chin to the shirt leaves an air notch behind the
        # neck. Keep the external swinging arms, but model this fixed shoulder
        # slope from the same ny anchor as the head (mirrored as one unit).
        shoulder=Image.new('RGBA',(W,H));q=ImageDraw.Draw(shoulder)
        q.polygon([(7,ny+1),(8,ny-1),(12,ny-3),(15,ny-3),(19,ny),(21,ny+3),(14,ny+4),(9,ny+3)],fill='#323c51')
        q.line([(7,ny+1),(8,ny-1),(12,ny-3)],fill='#262b3c')
        q.line([(9,ny+1),(11,ny-1),(13,ny-2)],fill='#515b70')
        q.polygon([(13,ny-3),(16,ny-3),(19,ny),(18,ny+2),(14,ny),(12,ny-1)],fill='#d3d0c9')
        if direction=='left':shoulder=ImageOps.mirror(shoulder)
        im.alpha_composite(shoulder)
    # Anatomical join is explicit: head and torso share ny, and the neck
    # overlaps both jaw and collar. In particular, profiles/back must not rely
    # on the head's last opaque row touching the jacket by accident.
    if direction=='down':
        d.polygon([(13,ny-4),(19,ny-4),(19,ny),(16,ny+1),(13,ny)],fill=SKIN[1])
        d.polygon([(14,ny-3),(18,ny-3),(18,ny-1),(16,ny),(14,ny-1)],fill=SKIN[2])
    elif direction=='up':
        d.rectangle((13,ny-4,19,ny),fill=SKIN[0])
        d.line((14,ny,18,ny),fill=SKIN[1])
        d.line([(11,ny),(13,ny+1),(19,ny+1),(21,ny)],fill='#d3cdc5')
    else:
        neck_layer=Image.new('RGBA',(32,48));nd=ImageDraw.Draw(neck_layer)
        # Nape is under the ear/back of skull, not under the front of the jaw.
        # Hair overlaps this shaded root; the collar overlaps its lower edge.
        nd.polygon([(14,ny-6),(18,ny-6),(21,ny-3),(20,ny),(18,ny+1),(15,ny),(13,ny-3)],fill=SKIN[0])
        nd.polygon([(17,ny-4),(20,ny-3),(20,ny-1),(18,ny),(16,ny-1)],fill=SKIN[1])
        nd.line((19,ny-2,19,ny-1),fill=SKIN[2])
        nd.line([(13,ny-1),(15,ny),(17,ny+1)],fill='#d3d0c9')
        if direction=='left':neck_layer=ImageOps.mirror(neck_layer)
        im.alpha_composite(neck_layer)
        d=ImageDraw.Draw(im)
    # Book remains in the same anatomical hand in all views. Only the free arm swings.
    if name=='rei':
        if direction=='down':
            bx,by=5,ny+3;d.polygon([(bx,by),(bx+8,by-1),(bx+10,by+10),(bx+2,by+11)],fill='#171f30')
            d.line([(bx+1,by+1),(bx+7,by),(bx+9,by+9)],fill='#b6a887');d.line((bx+2,by+9,bx+8,by+9),fill='#d5c6a2')
            d.ellipse((bx+3,by+3,bx+6,by+6),outline='#968779');d.line((bx+4,by+2,bx+6,by+7),fill='#716971')
            d.rectangle((bx+7,by+5,bx+9,by+7),fill=SKIN[2]);d.line((bx+8,by+6,bx+9,by+6),fill=SKIN[1])
        elif direction=='left':
            bx,by=5,ny+3;d.polygon([(bx,by),(bx+7,by-1),(bx+8,by+9),(bx+1,by+10)],fill='#171f30');d.line((bx+1,by+1,bx+2,by+8),fill='#b6a887');d.line((bx+2,by+8,bx+7,by+8),fill='#d6c8a2');d.ellipse((bx+3,by+3,bx+5,by+5),outline='#978a79');d.rectangle((bx+5,by+5,bx+8,by+7),fill=SKIN[2])
        elif direction=='right':
            d.rectangle((23,ny+3,25,ny+11),fill='#182136');d.line((25,ny+4,25,ny+10),fill='#baa88d')
        else:
            d.rectangle((22,ny+4,26,ny+12),fill='#182136');d.line((26,ny+5,26,ny+10),fill='#a99e89');d.rectangle((22,ny+5,24,ny+7),fill=SKIN[2])
    # The head shares the source's vertical bob, without falling back to a guessed RGB row.
    blink=(anim=='idle_anim' and index==4)
    im.alpha_composite(head(name,direction,blink),(0,ny-21))
    return im


def build():
    OUT.mkdir(parents=True,exist_ok=True)
    for name in PALETTES:
        for anim in ['run','idle_anim']:
            source=Image.open(f'.cache/Alex_{anim}_16x16.png').convert('RGBA')
            sheet=Image.new('RGBA',(W*24,H))
            for direction_id,direction in enumerate(DIRECTIONS):
                for i in range(6):
                    src_i=SOURCE_BLOCKS[direction_id]*6+i
                    src=source.crop((src_i*16,0,(src_i+1)*16,32))
                    sheet.alpha_composite(frame(name,direction,src,i,anim),((direction_id*6+i)*W,0))
            sheet.save(OUT/f'{name}-{anim}.png')
    metadata={'version':3,'frameWidth':W,'frameHeight':H,'framesPerDirection':6,'directions':DIRECTIONS,'sourceDirections':['right','up','left','down'],'sourceBlocks':SOURCE_BLOCKS,'characters':['ryoma','mie','rei'],'anchor':{'x':16,'y':47},'animations':{'run':{'fps':10},'idle_anim':{'fps':3,'blinkFrame':4}},'derivation':'LimeZu Alex arm/leg motion; reference-specific head, uniform and book edits; profile nape and sloping back-collar join.'}
    (OUT/'characters.json').write_text(json.dumps(metadata,indent=2)+'\n')

if __name__=='__main__':build()
