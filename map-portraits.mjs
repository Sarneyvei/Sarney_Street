// Photographic avatars stay at display resolution; the game keeps its
// original 256x224 pixel framebuffer and simulation.
export async function createMapPortraits(playfield) {
  const layer = document.createElement('div');
  layer.className = 'sarney-map-portraits';
  layer.hidden = true;
  layer.setAttribute('aria-hidden', 'true');
  const images = ['lives', 'player', 'selection', 'hud'].map(role => {
    const image = document.createElement('img');
    image.className = 'sarney-map-portrait sarney-map-' + role;
    image.alt = '';
    image.draggable = false;
    image.src = new URL('./mod/sarney-retrato-hd.png?v=sarney-foto-02', import.meta.url).href;
    layer.append(image);
    return image;
  });
  await Promise.all(images.map(image => image.decode()));
  playfield.append(layer);
  let canvas, ram = -1;
  function resize() {
    const next = playfield.querySelector('#screen');
    if (!next) return;
    if (canvas !== next) {
      if (canvas) observer.unobserve(canvas);
      canvas = next;
      observer.observe(canvas);
    }
    const bounds = canvas.getBoundingClientRect();
    const parent = playfield.getBoundingClientRect();
    const scale = Math.min(bounds.width / 256, bounds.height / 224);
    Object.assign(layer.style, {
      left: bounds.left - parent.left + (bounds.width - 256 * scale) / 2 + 'px',
      top: bounds.top - parent.top + (bounds.height - 224 * scale) / 2 + 'px',
      width: 256 * scale + 'px', height: 224 * scale + 'px',
    });
  }
  const observer = new ResizeObserver(resize);
  observer.observe(playfield);
  resize();
  const word = (heap, offset) => heap[offset] | heap[offset + 1] << 8;
  function compatible(heap, base, game) {
    const hud = base + 0x200 + 122 * 4;
    return base >= 0 && base + 0x20000 <= heap.length &&
      heap[base + 0x100] === 14 &&
      word(heap, base + 0x94) === game._ww_web_state(3) &&
      word(heap, base + 0x96) === game._ww_web_state(4) &&
      heap[hud] === 30 && heap[hud + 1] >= 5 && heap[hud + 1] <= 9 &&
      heap[hud + 4] === 30 && heap[hud + 5] === heap[hud + 1] + 16;
  }
  function locateRam(game) {
    const heap = game.HEAPU8;
    if (compatible(heap, ram, game)) return ram;
    const matches = [];
    // Identify this build's emulated RAM from exported state and both HUD
    // sprite entries rather than relying on a hard-coded WASM heap address.
    for (let p = 0; p + 0x20000 <= heap.length; p += 16) {
      if (heap[p + 0x100] === 14 && compatible(heap, p, game)) matches.push(p);
    }
    return matches.length === 1 ? matches[0] : -1;
  }
  function position(image, x, y, width, height = width) {
    image.style.left = x / 256 * 100 + '%';
    image.style.top = y / 224 * 100 + '%';
    image.style.width = width / 256 * 100 + '%';
    image.style.height = height / 224 * 100 + '%';
  }
  return {
    draw(game) {
      const selecting = !!game._ww_web_state(16);
      const map = game._ww_web_state(0) === 14 && !selecting && !game._ww_web_state(24);
      const hud = game._ww_web_state(0) === 20 && !selecting && !game._ww_web_state(24) && game._ww_web_state(20) === 0;
      images.forEach(image => image.hidden = true);
      layer.hidden = !(map || selecting || hud);
      if (layer.hidden) return;
      if (canvas !== playfield.querySelector('#screen')) resize();
      if (selecting) {
        position(images[2], 9, 122, 35, 33);
        images[2].hidden = false;
        return;
      }
      if (hud) {
        position(images[3], 7, 29, 20, 26);
        images[3].hidden = false;
        return;
      }
      ram = locateRam(game);
      if (ram < 0) { layer.hidden = true; return; }
      // OAM is the engine's actual on-screen sprite position, including map
      // scrolling and walk animation. Entries 39..42 form the map character.
      const heap = game.HEAPU8, sprite = ram + 0x200 + 39 * 4;
      const high = heap[ram + 0x400 + (39 >> 2)] >> (2 * (39 & 3));
      const x = heap[sprite] - ((high & 1) ? 256 : 0);
      const y = heap[sprite + 1];
      position(images[0], 14, 0, 42);
      position(images[1], x - 14, y - 26, 44);
      images[0].hidden = false;
      images[1].hidden = y >= 224 || x < -16 || x > 255;
      layer.hidden = false;
      if (canvas !== playfield.querySelector('#screen')) resize();
    },
  };
}
