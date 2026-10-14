from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
text=''.join(p.read_text() for p in [Path('index.html'),*Path('src').glob('*.js')])
text+=''.join(chr(n) for n in range(32,127))+'零一二三四五六七八九十年月日分秒時上下左右北南東西全音記録保存完了読込探戦闘'
Path('public/fonts').mkdir(exist_ok=True)
for name,source,weight in [('kiriha-sans','.cache/sans.ttf',400),('kiriha-serif','.cache/serif.ttf',500)]:
 font=TTFont(source)
 if 'fvar' in font:font=instantiateVariableFont(font,{'wght':weight},inplace=True)
 options=subset.Options();options.flavor='woff2';options.desubroutinize=True
 s=subset.Subsetter(options=options);s.populate(text=text);s.subset(font);
 for record in font['name'].names:
  if record.nameID in (1,4,6):record.string=name.encode(record.getEncoding())
 font.flavor='woff2';font.save('public/fonts/'+name+'.woff2')
 print(name,Path('public/fonts/'+name+'.woff2').stat().st_size)
