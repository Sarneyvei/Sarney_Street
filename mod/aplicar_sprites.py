"""Repack generated Sarney cells; input is the pinned upstream game.data.
Requires Pillow. The playable distribution is already patched.
"""
from pathlib import Path
from PIL import Image
import struct,json,re,collections
ROOT=Path(__file__).resolve().parents[1]
SHEET=Image.open(Path(__file__).with_name('sarney-sprites.png')).convert('RGBA')
xs=[0,245,465,711,932,1190,1374];ys=[0,250,518,725,940,1145]
cells=[]
for row in range(5):
 for col in range(6):
  box=(xs[col],ys[row],xs[col+1],ys[row+1])
  if row==1 and col==5:box=(1190,235,1374,543)
  if row==2 and col==5:box=(1190,543,1374,725)
  im=SHEET.crop(box)
  mask=im.getchannel('A').point(lambda a:255 if a>=96 else 0)
  bbox=mask.getbbox()
  if not bbox:raise ValueError('Empty sprite cell')
  im=im.crop(bbox);im.putalpha(mask.crop(bbox));cells.append(im)
# Pose IDs match assets.h. Global fonts, world map and boss effects remain intact.
poses={0:[0,1],1:[2,3],2:[4],3:[5],4:[7,6,7],5:[9,8,9],6:[10],7:[11],8:[12],9:[13],10:[14],11:[15],12:[16],13:[17],15:[27],20:[18],21:[19],22:[20],23:[21],24:[22],25:[27],40:[27],43:[23],52:[24]}
blob=(ROOT/'game.data').read_bytes()
start,end=10595082,71245792
original=blob[start:end]
if original[:4]!=b'WWA1':raise ValueError('Expected original pinned game.data; already patched?')
count=struct.unpack_from('<H',original,4)[0];pos=6;out=bytearray(original[:6]);seen=collections.Counter();changed=0
for _ in range(count):
 c,p,t,w,h,ax,ay=struct.unpack_from('<7H',original,pos);pos+=14
 pixels=original[pos:pos+w*h*4];pos+=w*h*4
 if c==0 and p in poses:
  choices=poses[p];i=seen[p];seen[p]+=1
  # Spread anticipation/active/recovery variants across existing frame slots.
  cell=choices[i%len(choices)];im=cells[cell]
  if p in (15,25,40):
   im=im.copy();im.thumbnail((w,h),Image.Resampling.NEAREST)
   canvas=Image.new('RGBA',(w,h));canvas.alpha_composite(im,((w-im.width)//2,h-im.height));im=canvas
  else:
   scale=0.41;im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),Image.Resampling.NEAREST)
   w,h=im.size
   ax=round(w*(0.32 if p in (4,6,21,23,24) else 0.5))
   ay=h+(16 if p in (2,8,21,22,43) else 0)
  # WWA1 stores little-endian uint32 ARGB (BGRA bytes).
  pixels=im.tobytes('raw','BGRA');changed+=1
 out+=struct.pack('<7H',c,p,t,w,h,ax,ay)+pixels
if pos!=len(original):raise ValueError('Invalid sprite package size')
newblob=blob[:start]+out+blob[end:]
(ROOT/'game.data').write_bytes(newblob)
p=ROOT/'game.mjs';js=p.read_text()
delta=len(out)-(end-start)
js=js.replace('"end": 71245792','"end": '+str(end+delta)).replace('"start": 71245792','"start": '+str(end+delta)).replace('"end": 71601660','"end": '+str(len(newblob))).replace('"remote_package_size": 71601660','"remote_package_size": '+str(len(newblob)))
p.write_text(js)
print(f'Replaced {changed} character frames. Package {len(newblob)} bytes.')
# A contact sheet for QA, preserving actual generated sprites.
preview=Image.new('RGBA',(600,500),(28,30,35,255))
for i,im in enumerate(cells):
 im=im.copy();im.thumbnail((96,96),Image.Resampling.NEAREST);preview.alpha_composite(im,((i%6)*100+(100-im.width)//2,(i//6)*100+100-im.height))
preview.save(Path(__file__).with_name('previa.png'))
