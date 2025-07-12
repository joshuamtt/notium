import {
    Application,
    Container,
    Graphics,
    Text
} from "pixi.js";
// Listener that will host our zoom and strafe camera actions
const wheelListener = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const friction = 1;
    const event = e as WheelEvent;
    const deltaX = event.deltaX * friction;
    const deltaY = event.deltaY * friction;
    if (!event.ctrlKey) {
        CanvasStore.moveCamera(deltaX, deltaY);
    } else {
        CanvasStore.zoomCamera(deltaX, deltaY);
    }
};

// Listener to keep track of our pointer. Used for accurate zoom
const pointerListener = (event: PointerEvent) => {
    CanvasStore.movePointer(event.offsetX, event.offsetY);
};

class App {
    // Draws blocks with texts in the middle of them
    private drawCanvas() {
        const container = new Container();
        const colors = [
            0xf1f7ed, 0x61c9a8, 0x7ca982, 0xe0eec6, 0xc2a83e, 0xff99c8, 0xfcf6bd,
            0x9c92a3, 0xc6b9cd,
        ];
        const texts = [
            "Infinite",
            "Canvases",
            "Are",
            "Easy",
            "When",
            "You",
            "Know",
            "The",
            "Fundamentals",
        ];
        const rectW = 500;
        const rectH = 500;
        for (let i = 0; i < 9; i++) {
            const block = new Container();
            const randomColor = colors[i];
            const bg = new Graphics();
            const leftOffset = (i % 3) * rectW;
            const topOffset = Math.floor(i / 3) * rectH;
            bg.beginFill(randomColor);
            bg.drawRect(leftOffset, topOffset, rectW, rectH);
            bg.endFill();
            block.addChild(bg);
            const textElement = new Text(texts[i], {
                fontSize: 10,
                fill: 0x000000,
                fontWeight: "700",
                wordWrap: false,
            });
            textElement.anchor.set(0.5);
            textElement.position.set(leftOffset + block.width / 2, topOffset + block.height / 2);
            block.addChild(textElement);
            container.addChild(block);
        }
        return container;
    }
    attach(root: HTMLElement) {
        const app = new Application({
            width: document.body.clientWidth,
            height: document.body.clientHeight,
            backgroundColor: 0xffffff,
            resolution: 2,
            antialias: true,
            autoDensity: true,
        });
        root.appendChild(app.view);
        const canvas = this.drawCanvas();
        app.stage.addChild(canvas);
        root.addEventListener("mousewheel", wheelListener, {
            passive: false
        });
        root.addEventListener("pointermove", pointerListener, {
            passive: true,
        });
    }
    detach(root: HTMLElement) {
        root.removeEventListener("mousewheel", wheelListener);
        root.removeEventListener("pointermove", pointerListener);
    }
}
// Loading and Unloading logic for our app
let _app: App | null;
window.onload = () => {
    _app = new App();
    _app.attach(document.body);
};
window.onbeforeunload = () => {
    if (_app) _app.detach(document.body);
};


interface CanvasState {
    pixelRatio: number; // our resolution for dip calculations
    container: { //holds information related to our screen container
        width: number;
        height: number;
    };
    camera: { //holds camera state
        x: number;
        y: number;
        z: number;
    };
}
export const getInitialCanvasState = (): CanvasState => {
    return {
        pixelRatio: window.devicePixelRatio || 1,
        container: {
            width: 0,
            height: 0,
        },
        camera: {
            x: 0,
            y: 0,
            z: 0,
        },
    };
};
const radians = (angle: number) => {
    return angle * (Math.PI / 180);
};
export const CAMERA_ANGLE = radians(30);
export const RECT_W = 500;
export const RECT_H = 500;
export default class CanvasStore {
    private static get data() {
        if (!canvasData) canvasData = {
            pixelRatio: window.devicePixelRatio || 1,
            pixelsPerFrame: 1,
            container: {
                width: 0,
                height: 0,
            },
            pointer: {
                x: 0,
                y: 0,
            },
            canvas: {
                width: 0,
                height: 0,
            },
            camera: {
                x: 0,
                y: 0,
                z: 0,
            },
        };
        return canvasData;
    }


    static initialize(width: number, height: number) {
        const containerWidth = width;
        const containerHeight = height;
        canvasData = getInitialCanvasState();
        canvasData.pixelRatio = window.devicePixelRatio || 1;
        canvasData.container.width = containerWidth;
        canvasData.container.height = containerHeight;
        canvasData.camera.x = 1.5 * RECT_W;
        canvasData.camera.y = 1.5 * RECT_H;
        canvasData.camera.z = containerWidth / (2 * Math.tan(CAMERA_ANGLE));
    }
    public static get screen() {
        const {
            x,
            y,
            z
        } = this.camera;
        const aspect = this.aspect;
        const angle = radians(30);
        return cameraToScreenCoordinates(x, y, z, angle, aspect);
    }
    public static get camera() {
        return this.data.camera;
    }
    public static get scale() {
        const {
            width: w,
            height: h
        } = CanvasStore.screen;
        const {
            width: cw,
            height: ch
        } = CanvasStore.container;
        return {
            x: cw / w,
            y: ch / h
        };
    }

    export const cameraToScreenCoordinates = (
        x: number,
        y: number,
        z: number,
        cameraAngle: number,
        screenAspect: number
    ) => {
        const width = 2 * z * Math.tan(CAMERA_ANGLE);
        const height = width / screenAspect;
        const screenX = x - width / 2;
        const screenY = y - height / 2;
        return {
            x: screenX,
            y: screenY,
            width,
            height
        };
    };

    attach(root: HTMLElement) {
        CanvasStore.initialize(
            document.body.clientWidth,
            document.body.clientHeight
        );
        const app = new Application({
            width: document.body.clientWidth,
            height: document.body.clientHeight,
            backgroundColor: 0xffffff,
            resolution: 2,
            antialias: true,
            autoDensity: true,
        });
        root.appendChild(app.view);
        const canvas = this.drawCanvas();
        app.stage.addChild(canvas);
        app.ticker.add(() => {
            const {
                x,
                y
            } = CanvasStore.screen;
            const scale = CanvasStore.scale;
            canvas.position.set(-scale.x * x, -scale.y * y);
            canvas.scale.set(scale.x, scale.y);
        });
        root.addEventListener("mousewheel", wheelListener, {
            passive: false
        });
        root.addEventListener("pointermove", pointerListener, {
            passive: true,
        });
    }

    public static moveCamera(mx: number, my: number) {
        const scrollFactor = 1.5;
        const deltaX = mx * scrollFactor;
        const deltaY = my * scrollFactor;
        const {
            x,
            y,
            z
        } = this.camera;
        this.data.camera.x += deltaX;
        this.data.camera.y += deltaY;
        // move pointer by the same amount
        this.movePointer(deltaY, deltaY);
    }
    public static movePointer(deltaX: number, deltaY: number) {
        const scale = this.scale;
        const {
            x: left,
            y: top
        } = this.screen;
        this.data.pointer.x = left + deltaX / scale.x;
        this.data.pointer.y = top + deltaY / scale.y;
    }

    const scaleWithAnchorPoint = (
        anchorPointX: number,
        anchorPointY: number,
        cameraX1: number,
        cameraY1: number,
        scaleX1: number,
        scaleY1: number,
        scaleX2: number,
        scaleY2: number
    ) => {
        const cameraX2 =
            (anchorPointX * (scaleX2 - scaleX1) + scaleX1 * cameraX1) / scaleX2;
        const cameraY2 =
            (anchorPointY * (scaleY2 - scaleY1) + scaleY1 * cameraY1) / scaleY2;
        return {
            x: cameraX2,
            y: cameraY2
        };
    };
    public static zoomCamera(deltaX: number, deltaY: number) {
        // Normal zoom is quite slow, we want to scale the amount quite a bit
        const zoomScaleFactor = 10;
        const deltaAmount = zoomScaleFactor * Math.max(deltaY);
        const {
            x: oldX,
            y: oldY,
            z: oldZ
        } = this.camera;
        const oldScale = {
            ...this.scale
        };
        const {
            width: containerWidth,
            height: containerHeight
        } = this.container;
        const {
            width,
            height
        } = cameraToScreenCoordinates(
            oldX,
            oldY,
            oldZ + deltaAmount,
            this.cameraAngle,
            this.aspect
        );
        const newScaleX = containerWidth / width;
        const newScaleY = containerHeight / height;
        const {
            x: newX,
            y: newY
        } = scaleWithAnchorPoint(
            this.pointer.x,
            this.pointer.y,
            oldX,
            oldY,
            oldScale.x,
            oldScale.y,
            newScaleX,
            newScaleY
        );
        const newZ = oldZ + deltaAmount;
        this.data.camera = {
            x: newX,
            y: newY,
            z: newZ,
        };
    }
}