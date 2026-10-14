"""Visual-structure regression for the side-view nape, not just alpha connectivity.
Run: .venv/bin/python tests/profile-art.py [asset-directory]
The old v2 sheets fail because the back edge jumps inward 6–7 pixels
above the shoulder, even though the chin is connected to the shirt.
"""
from pathlib import Path
import sys
from PIL import Image, ImageOps

assets = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('public/assets')
checked = 0
for name, crown_offset in [('ryoma', 0), ('mie', 2), ('rei', 1)]:
    joins = set()
    for animation in ['run', 'idle_anim']:
        sheet = Image.open(assets / f'{name}-{animation}.png').convert('RGBA')
        for direction in [0, 2]:
            for index in range(6):
                x = (direction * 6 + index) * 32
                frame = sheet.crop((x, 0, x + 32, 48))
                # Canonical right view: back on the left, face on the right.
                if direction == 0:
                    frame = ImageOps.mirror(frame)
                ny = frame.getbbox()[1] + 21 - crown_offset
                context = (name, animation, direction, index)
                back_edges = []
                for y in range(ny - 6, ny + 2):
                    opaque = [x for x in range(32) if frame.getpixel((x, y))[3]]
                    assert opaque, (*context, 'disconnected neck row', y)
                    back_edges.append(min(opaque))
                assert max(b - a for a, b in zip(back_edges, back_edges[1:])) <= 2, (*context, 'deep air notch under occiput', back_edges)
                # The nape must meet the back collar, not hang off the chin.
                for x, dy in [(14, -2), (15, -1), (16, 0), (17, 1)]:
                    assert frame.getpixel((x, ny + dy))[3] == 255, (*context, 'missing nape/back-collar support', x, dy)
                # A common bob anchor preserves the exact join in all poses;
                # eye blinks, moving arms and the held book lie outside it.
                joins.add(frame.crop((13, ny - 4, 21, ny + 2)).tobytes())
                checked += 1
    assert len(joins) == 1, (name, 'head and collar move independently across frames')
print(f'PASS: {checked} side-view frames; continuous occiput/nape/shoulder contour, supported back collar, mirrored and bob-stable join')
