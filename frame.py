# usage: frame.py raw.png id1,id2,id3,id4 [--key magenta]
# 2x2 sheet of card frames on chroma-key background -> art/frame_<id>.webp (360x480, transparent window)
import sys, numpy as np
from PIL import Image, ImageFilter
src, ids = sys.argv[1], sys.argv[2].split(',')
mag = '--key' in sys.argv and sys.argv[sys.argv.index('--key')+1] == 'magenta'
im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(np.int32); H, W, _ = a.shape
white = a.min(axis=2) > 225
def gutter(prof):
    m = len(prof)//2
    for d in range(len(prof)//5):
        for x in (m-d, m+d):
            if prof[x] > .8:
                l = r = x
                while l > 0 and prof[l-1] > .5: l -= 1
                while r < len(prof)-1 and prof[r+1] > .5: r += 1
                return l, r
    return m, m
cx = gutter(white.mean(axis=0)); cy = gutter(white.mean(axis=1))
cells = [(0,0,cx[0],cy[0]),(cx[1]+1,0,W,cy[0]),(0,cy[1]+1,cx[0],H),(cx[1]+1,cy[1]+1,W,H)]
def keymask(c):
    r, g, b = c[...,0], c[...,1], c[...,2]
    if mag:  # magenta: high r and b, low g
        d = np.minimum(r, b) - g
    else:    # green: g much higher than r and b
        d = g - np.maximum(r, b)
    # 1 = background. soft ramp between 40..110
    return np.clip((d - 40) / 70.0, 0, 1)
for id_, (x0, y0, x1, y1) in zip(ids, cells):
    if id_ == '-': continue
    c = a[y0:y1, x0:x1]
    nonwhite = ~(c.min(axis=2) > 225)
    bg = keymask(c) > .5
    content = nonwhite & ~bg
    ys = np.where(content.mean(axis=1) > .02)[0]; xs = np.where(content.mean(axis=0) > .02)[0]
    c = c[ys.min():ys.max()+1, xs.min():xs.max()+1]
    k = keymask(c)
    alpha = (1 - k)
    rgb = c.astype(np.float32)
    # despill: pull the key colour out of semi-transparent edge pixels
    if mag:
        lim = rgb[...,1:2] + 0
        rgb[...,0] = np.minimum(rgb[...,0], np.maximum(rgb[...,1], rgb[...,0]*alpha + rgb[...,1]*(1-alpha)))
        rgb[...,2] = np.minimum(rgb[...,2], np.maximum(rgb[...,1], rgb[...,2]*alpha + rgb[...,1]*(1-alpha)))
    else:
        rgb[...,1] = np.minimum(rgb[...,1], np.maximum(rgb[...,0], rgb[...,2]))
    out = np.dstack([np.clip(rgb, 0, 255), alpha*255]).astype(np.uint8)
    img = Image.fromarray(out, 'RGBA').resize((360, 480), Image.LANCZOS)
    A = img.getchannel('A').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.6))
    img.putalpha(A)
    img.save(f'art/frame_{id_}.webp', quality=88, method=6)
    print(id_, img.size, 'opaque%', round((np.asarray(A) > 128).mean()*100, 1))
