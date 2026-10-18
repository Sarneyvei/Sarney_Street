// Display-resolution branding for the original 256x224 game. The simulation,
// button handling, title demo and save files remain in the original engine.
const NS = 'http://www.w3.org/2000/svg';
const GLYPHS = {
  S:['01111','10000','10000','01110','00001','00001','11110'],
  U:['10001','10001','10001','10001','10001','10001','01110'],
  P:['11110','10001','10001','11110','10000','10000','10000'],
  E:['11111','10000','10000','11110','10000','10000','11111'],
  R:['11110','10001','10001','11110','10100','10010','10001'],
  A:['01110','10001','10001','11111','10001','10001','10001'],
  N:['10001','11001','11001','10101','10011','10011','10001'],
  Y:['10001','10001','01010','00100','00100','00100','00100'],
  W:['10001','10001','10001','10101','10101','11011','10001'],
  O:['01110','10001','10001','10001','10001','10001','01110'],
  L:['10000','10000','10000','10000','10000','10000','11111'],
  D:['11110','10001','10001','10001','10001','10001','11110'],
  V:['10001','10001','10001','10001','10001','01010','00100'],
  G:['01111','10000','10000','10111','10001','10001','01111'],
  T:['11111','00100','00100','00100','00100','00100','00100'],
  I:['11111','00100','00100','00100','00100','00100','11111'],
  '0':['01110','10001','10011','10101','11001','10001','01110'],
  '2':['01110','10001','00001','00010','00100','01000','11111'],
  '6':['01110','10000','10000','11110','10001','10001','01110'],
  ' ':['00000','00000','00000','00000','00000','00000','00000'],
};
const COLORS = ['#f44338','#00b5e5','#ffcf19','#29c747','#ffcf19','#00b5e5','#29c747','#ffcf19','#f44338','#00b5e5','#29c747'];
function svgElement(tag, attributes, parent) {
  const element = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  parent?.append(element);
  return element;
}
function lettering(parent, text, x, y, sx, sy, colors, stroke = 0) {
  for (const [index, letter] of [...text].entries()) {
    let path = '';
    for (const [row, pixels] of GLYPHS[letter].entries()) {
      for (let col = 0; col < pixels.length; col++) if (pixels[col] === '1') {
        const px=x+(index*6+col)*sx, py=y+row*sy;
        path += `M${px},${py}h${sx}v${sy}h${-sx}Z`;
      }
    }
    svgElement('path', {d:path, fill:colors[index%colors.length], stroke:stroke?'#101510':'none',
      'stroke-width':stroke, 'stroke-linejoin':'round', 'paint-order':'stroke'}, parent);
  }
}

export function createBrandOverlays(playfield) {
  const layer = svgElement('svg', {viewBox:'0 0 256 224', preserveAspectRatio:'none',
    'aria-hidden':'true', class:'sarney-brand-overlays'});
  Object.assign(layer.style, {position:'absolute', pointerEvents:'none', overflow:'hidden', zIndex:'1'});
  layer.style.display = 'none';
  playfield.append(layer);

  const opening = svgElement('g', {}, layer);
  svgElement('rect', {x:79,y:105,width:99,height:27,fill:'#000'}, opening);
  const openingText = svgElement('g', {}, opening);
  lettering(openingText, 'EVAGOS', 103,111,1.4,1.4,['#fff']);
  lettering(openingText, 'PRESENTS', 104,123,.9,.9,['#fff']);

  const title = svgElement('g', {}, layer);
  const titleMask = svgElement('rect', {x:17,y:31,width:223,height:71,fill:'#99e2e2'}, title);
  const titleArt = svgElement('g', {}, title);
  lettering(titleArt, 'SUPER', 74,36,2.8,2.8,COLORS,1.5);
  lettering(titleArt, 'SARNEYWORLD', 20,66,2.6,4,COLORS,1.6);
  // Two beveled Roman numerals keep the original arcade title's gold/red cue.
  const defs = svgElement('defs', {}, titleArt);
  const gradient = svgElement('linearGradient', {id:'sarney-title-gold', x1:'0', y1:'0', x2:'.3', y2:'1'}, defs);
  svgElement('stop', {offset:'0', 'stop-color':'#ffe577'}, gradient);
  svgElement('stop', {offset:'.42', 'stop-color':'#ffbe19'}, gradient);
  svgElement('stop', {offset:'.8', 'stop-color':'#f0440c'}, gradient);
  svgElement('stop', {offset:'1', 'stop-color':'#df1313'}, gradient);
  const numerals='M203 43L218 40L216 45L212 46L208 87L213 86L212 91L197 94L198 89L202 88L206 47L202 48Z M222 40L237 37L235 42L231 43L227 84L232 83L231 88L216 91L217 86L221 85L225 44L221 45Z';
  svgElement('path', {d:numerals,fill:'#222320',transform:'translate(2 2)'}, titleArt);
  svgElement('path', {d:numerals,fill:'url(#sarney-title-gold)'}, titleArt);

  const copyright = svgElement('g', {}, title);
  const copyrightMask = svgElement('rect', {x:54,y:191,width:157,height:9,fill:'#dbaf52'}, copyright);
  const copyrightText = svgElement('g', {}, copyright);
  const copyrightSymbol=svgElement('text',{x:75,y:199,'font-size':9.5,
    'font-family':'Arial, sans-serif','font-weight':'bold',fill:'#00bce7',stroke:'#101510',
    'stroke-width':.4,'paint-order':'stroke'},copyrightText);
  copyrightSymbol.textContent='©';
  lettering(copyrightText, '2026 EVAGOS', 88,192,1.4,.9,['#00bce7'],.55);

  let canvas;
  function resize() {
    const next=playfield.querySelector('#screen');
    if(!next)return;
    if(canvas!==next) {
      if(canvas)observer.unobserve(canvas);
      canvas=next;observer.observe(canvas);
    }
    const bounds=canvas.getBoundingClientRect(),parent=playfield.getBoundingClientRect();
    const scale=Math.min(bounds.width/256,bounds.height/224);
    Object.assign(layer.style, {
      left:bounds.left-parent.left+(bounds.width-256*scale)/2+'px',
      top:bounds.top-parent.top+(bounds.height-224*scale)/2+'px',
      width:256*scale+'px',height:224*scale+'px',
    });
  }
  const observer = new ResizeObserver(resize);
  observer.observe(playfield);resize();
  function dominantColor(bytes, x, y, width, height) {
    const counts = new Map();
    let best = 0, total = 0;
    for(let row=y;row<y+height;row+=2)for(let col=x;col<x+width;col+=2) {
      const p=(row*256+col)*4,key=bytes[p+2]<<16|bytes[p+1]<<8|bytes[p];
      const count=(counts.get(key)||0)+1;counts.set(key,count);
      if(count>total){best=key;total=count;}
    }
    return [best>>16&255,best>>8&255,best&255];
  }
  return {
    draw(game) {
      const mode=game._ww_web_state(0),intro=mode===1||mode===2,onTitle=mode===6||mode===7;
      const visible=intro||onTitle;
      layer.style.display=visible?'':'none';
      opening.style.display=intro?'':'none';title.style.display=onTitle?'':'none';
      if(!visible)return;
      const pointer=game._ww_web_pixels(),bytes=game.HEAPU8.subarray(pointer,pointer+256*224*4);
      if(intro) {
        let brightness=0;
        for(let y=111;y<129;y++)for(let x=94;x<162;x++)brightness=Math.max(brightness,bytes[(y*256+x)*4+2]);
        openingText.setAttribute('opacity',brightness/255);
      } else {
        // Sky and wood are the dominant original colors in these regions.
        // Sampling an area prevents a scrolling cloud or wood fleck from
        // changing the entire mask color during the animated title demo.
        const sky=dominantColor(bytes,17,31,223,71),gold=dominantColor(bytes,54,191,157,9);
        const brightness=Math.min(1,Math.max(...sky)/231);
        titleMask.setAttribute('fill',`rgb(${sky})`);
        copyrightMask.setAttribute('fill',`rgb(${gold})`);
        titleArt.setAttribute('opacity',brightness);
        copyrightText.setAttribute('opacity',brightness);
      }
      if(canvas!==playfield.querySelector('#screen'))resize();
    },
    destroy() {observer.disconnect();layer.remove();},
  };
}
