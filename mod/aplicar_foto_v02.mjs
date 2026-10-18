// Rebuild only the 100 Sarney records already customized in v01.
// The 12-character roster, Akuma records, effects and audio are preserved.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require('sharp');
const {PNG}=require('pngjs');
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
const sheet=PNG.sync.read(fs.readFileSync(path.join(here,'sarney-sprites-v02.png')));
const portrait=path.join(here,'sarney-retrato-hd.png');
// Manual cells prevent high arms and feet from being cut by an assumed grid.
// Pivots are anatomical ground references, not variable crop-box centres.
const cells=[
 {box:[20,15,285,340],pivot:[149,335]},
 {box:[333,15,590,340],pivot:[461,335]},
 {box:[655,15,905,340],pivot:[780,335]},
 {box:[960,15,1222,340],pivot:[1090,335]},
 {box:[35,340,250,610],pivot:[147,590]},
 {box:[348,410,548,653],pivot:[453,645]},
 {box:[615,355,925,670],pivot:[760,662]},
 {box:[927,357,1247,669],pivot:[1074,660]},
 {box:[10,690,327,984],pivot:[143,977]},
 {box:[405,640,584,992],pivot:[490,981]},
 {box:[662,690,886,987],pivot:[783,980]},
 {box:[891,885,1254,987],pivot:[1068,978]},
 {box:[42,953,285,1254],pivot:[161,1248]},
 {box:[330,985,588,1254],pivot:[466,1248]},
 {box:[667,1020,923,1254],pivot:[776,1248]},
 {box:[950,980,1247,1243],pivot:[1078,1235]},
];
const W=128,H=144,AX=64,AY=128,SCALE=.28;
// Remove detached fragments from adjacent cells and tiny generated specks.
function cropConnected(cell){
 const[x0,y0,x1,y1]=cell.box,w=x1-x0,h=y1-y0;
 const rgba=Buffer.alloc(w*h*4),marked=new Uint8Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const s=((y+y0)*sheet.width+x+x0)*4,d=(y*w+x)*4;
  rgba[d]=sheet.data[s];rgba[d+1]=sheet.data[s+1];rgba[d+2]=sheet.data[s+2];
  rgba[d+3]=sheet.data[s+3]>=128?255:0;
 }
 let largest=[];
 for(let start=0;start<w*h;start++){
  if(marked[start]||!rgba[start*4+3])continue;
  const queue=[start];marked[start]=1;
  for(let k=0;k<queue.length;k++){
   const p=queue[k],x=p%w,y=(p/w)|0;
   for(const n of[x>0?p-1:-1,x+1<w?p+1:-1,y>0?p-w:-1,y+1<h?p+w:-1])
    if(n>=0&&!marked[n]&&rgba[n*4+3]){marked[n]=1;queue.push(n);}
  }
  if(queue.length>largest.length)largest=queue;
 }
 const keep=new Uint8Array(w*h);for(const p of largest)keep[p]=1;
 for(let p=0;p<w*h;p++)if(!keep[p])rgba[p*4+3]=0;
 return {rgba,w,h};
}
const prepared=[];
for(const cell of cells){
 const{rgba,w,h}=cropConnected(cell),outW=Math.round(w*SCALE),outH=Math.round(h*SCALE);
 const image=await sharp(rgba,{raw:{width:w,height:h,channels:4}}).resize(outW,outH,{kernel:'lanczos3'}).raw().toBuffer();
 const left=AX-Math.round((cell.pivot[0]-cell.box[0])*SCALE),top=AY-Math.round((cell.pivot[1]-cell.box[1])*SCALE);
 if(left<0||top<0||left+outW>W||top+outH>H)throw new Error('Cell does not fit common canvas: '+JSON.stringify(cell));
 const canvas=Buffer.alloc(W*H*4);
 for(let y=0;y<outH;y++)image.copy(canvas,((top+y)*W+left)*4,y*outW*4,(y+1)*outW*4);
 prepared.push(canvas);
}
const poseCells={0:[0],1:[2,3],2:[4],3:[5],4:[6],5:[7],6:[8],7:[9],8:[7],9:[4],10:[6],11:[10],12:[11],13:[0],20:[12],21:[6],22:[15],23:[14],24:[15],43:[4],52:[5]};
const photoPoses=new Set([15,25,40]),airPoses=new Set([2,8,21,22,43]);
const gamePath=path.join(root,'game.mjs'),dataPath=path.join(root,'game.data');
let js=fs.readFileSync(gamePath,'utf8');
const match=js.match(/"filename": "\/sf2\/sprites.dat",\s*"start": (\d+),\s*"end": (\d+)/);
if(!match)throw new Error('Sprite package metadata missing');
const start=Number(match[1]),end=Number(match[2]),blob=fs.readFileSync(dataPath),original=blob.subarray(start,end);
if(original.toString('ascii',0,4)!=='WWA1')throw new Error('Unsupported sprite package');
const count=original.readUInt16LE(4),parts=[original.subarray(0,6)],seen={},changes=[];
let pos=6;
for(let i=0;i<count;i++){
 const oldHeader=original.subarray(pos,pos+14),values=Array.from({length:7},(_,k)=>oldHeader.readUInt16LE(k*2));
 const[c,p,t,oldW,oldH,oldAX,oldAY]=values;pos+=14;
 let pixels=original.subarray(pos,pos+oldW*oldH*4);pos+=oldW*oldH*4;
 let w=oldW,h=oldH,ax=oldAX,ay=oldAY;
 if(c===0&&(poseCells[p]||photoPoses.has(p))){
  let rgba;
  if(photoPoses.has(p)){
   const thumb=await sharp(portrait).resize({width:w,height:h,fit:'inside',kernel:'lanczos3'}).toBuffer();
   const info=await sharp(thumb).metadata();
   rgba=await sharp({create:{width:w,height:h,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:thumb,left:Math.floor((w-info.width)/2),top:h-info.height}]).raw().toBuffer();
  }else{
   const choices=poseCells[p],frame=seen[p]||0;seen[p]=frame+1;
   rgba=prepared[choices[frame%choices.length]];w=W;h=H;ax=AX;ay=AY+(airPoses.has(p)?16:0);
  }
  pixels=Buffer.alloc(w*h*4);
  for(let k=0;k<pixels.length;k+=4){pixels[k]=rgba[k+2];pixels[k+1]=rgba[k+1];pixels[k+2]=rgba[k];pixels[k+3]=rgba[k+3];}
  changes.push({index:i,pose:p,old:[oldW,oldH,oldAX,oldAY],new:[w,h,ax,ay]});
 }
 const header=Buffer.alloc(14);[c,p,t,w,h,ax,ay].forEach((v,k)=>header.writeUInt16LE(v,k*2));
 parts.push(header,pixels);
}
if(pos!==original.length||changes.length!==100)throw new Error('Unexpected sprite record counts: '+changes.length);
const sprites=Buffer.concat(parts),delta=sprites.length-original.length,newBlob=Buffer.concat([blob.subarray(0,start),sprites,blob.subarray(end)]);
js=js.replace(/("(?:start|end)":\s*)(\d+)/g,(all,prefix,value)=>Number(value)>=end?prefix+(Number(value)+delta):all);
js=js.replace(/("remote_package_size":\s*)\d+/,(_,prefix)=>prefix+newBlob.length);
fs.writeFileSync(dataPath,newBlob);fs.writeFileSync(gamePath,js);
fs.writeFileSync(path.join(here,'sprites-v02-report.json'),JSON.stringify({count,changed:changes.length,scale:SCALE,canvas:[W,H],anchor:[AX,AY],airAnchor:[AX,AY+16],packageBytes:newBlob.length,changes},null,2));
const thumbs=await Promise.all(prepared.map((rgba,i)=>({input:sharp(rgba,{raw:{width:W,height:H,channels:4}}).png().toBuffer(),i})));
await sharp({create:{width:W*4,height:H*4,channels:4,background:'#282e37'}}).composite(await Promise.all(thumbs.map(async({input,i})=>({input:await input,left:i%4*W,top:Math.floor(i/4)*H})))).png().toFile(path.join(here,'previa-v02.png'));
console.log(JSON.stringify({records:count,replaced:changes.length,poses:Object.keys(poseCells).length+3,packageBytes:newBlob.length,delta,commonCanvas:[W,H],groundAnchor:[AX,AY],airAnchor:[AX,AY+16]}));
