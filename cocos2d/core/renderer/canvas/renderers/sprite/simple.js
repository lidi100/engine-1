/****************************************************************************
 Copyright (c) 2018 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

const utils = require('../utils');

let renderer = {

    createData (sprite) {
        let renderData = sprite.requestRenderData();
        // 0 for bottom left, 1 for top right
        renderData.dataLength = 2;
        return renderData;
    },

    updateRenderData (sprite) {
        if (!sprite._material) {
            sprite._activateMaterial();
        }

        if (sprite._vertsDirty) {
            this.updateUVs(sprite);
            this.updateVerts(sprite);
            sprite._vertsDirty = false;
        }
    },

    updateUVs (sprite) {
        let frame = sprite.spriteFrame;
        let renderData = sprite._renderData;
        let verts = renderData.vertices;
        let rect = frame._rect;
        
        if (frame._rotated) {
            let l = rect.x;
            let r = rect.height;
            let b = rect.y;
            let t = rect.width;
            verts[0].u = l;
            verts[0].v = t;
            verts[1].u = r;
            verts[1].v = b;
        }
        else {
            let l = rect.x;
            let r = rect.width;
            let b = rect.y;
            let t = rect.height;
            verts[0].u = l;
            verts[0].v = b;
            verts[1].u = r;
            verts[1].v = t;
        }
    },

    updateVerts (sprite) {
        let renderData = sprite._renderData,
            node = sprite.node,
            verts = renderData.vertices,
            cw = node.width, ch = node.height,
            appx = node.anchorX * cw, appy = node.anchorY * ch,
            l, b, r, t;
        if (sprite.trim) {
            l = -appx;
            b = -appy;
            r = cw;
            t = ch;
        }
        else {
            let frame = sprite.spriteFrame,
                ow = frame._originalSize.width, oh = frame._originalSize.height,
                rw = frame._rect.width, rh = frame._rect.height,
                offset = frame._offset,
                scaleX = cw / ow, scaleY = ch / oh;
            let trimLeft = offset.x + (ow - rw) / 2;
            let trimRight = offset.x - (ow - rw) / 2;
            let trimBottom = offset.y + (oh - rh) / 2;
            let trimTop = offset.y - (oh - rh) / 2;
            l = trimLeft * scaleX - appx;
            b = trimBottom * scaleY - appy;
            r = cw;
            t = ch;
        }
        
        verts[0].x = l;
        verts[0].y = b;
        verts[1].x = r;
        verts[1].y = t;
    },

    draw (ctx, comp) {
        let node = comp.node;
        // Transform
        let matrix = node._worldMatrix;
        let a = matrix.m00, b = matrix.m01, c = matrix.m04, d = matrix.m05,
            tx = matrix.m12, ty = matrix.m13;
        ctx.transform(a, b, c, d, tx, ty);
        ctx.scale(1, -1);

        // TODO: handle blend function

        // opacity
        ctx.globalAlpha = node.opacity / 255;

        let tex = comp._spriteFrame._texture,
            verts = comp._renderData.vertices;

        let image = utils.getColorizedImage(tex, node._color);

        let x = verts[0].x;
        let y = verts[0].y;
        let w = verts[1].x;
        let h = verts[1].y;
        y = - y - h;

        let sx = verts[0].u;
        let sy = verts[0].v;
        let sw = verts[1].u;
        let sh = verts[1].v;

        ctx.drawImage(image,
            sx, sy, sw, sh,
            x, y, w, h);
        return 1;
    }
};

module.exports = renderer;