// Compatibility hook for the included upstream WASM build. Source version is
// also included in the package; fail explicitly if a different build is used.
export function installSarney(game) {
  const heap=game.HEAPU8, view=new DataView(heap.buffer);
  const find=text=>{const bytes=new TextEncoder().encode(text+'\0');outer:for(let p=0;p<heap.length-bytes.length;p++){for(let i=0;i<bytes.length;i++)if(heap[p+i]!==bytes[i])continue outer;return p;}return -1;};
  const ryu=find('RYU'),superName=find('SHINKU HADOUKEN');
  if(ryu<0||superName<0)throw new Error('Versão do jogo incompatível com o personagem Sarney.');
  const matches=[];
  for(let p=0;p<heap.length-40;p+=4)
    if(view.getUint32(p,true)===ryu&&view.getUint32(p+16,true)===superName&&view.getUint32(p+32,true)===100&&view.getUint32(p+20,true)===0x64e7ff)matches.push(p);
  if(matches.length!==1)throw new Error('Não foi possível localizar o personagem com segurança.');
  // Reuse the existing 9-byte suffix: SHINKU HADOUKEN -> SHINKU SARNEY.
  heap.set(new TextEncoder().encode('SARNEY\0'),superName+7);
  view.setUint32(matches[0],superName+7,true);
  return matches[0];
}
