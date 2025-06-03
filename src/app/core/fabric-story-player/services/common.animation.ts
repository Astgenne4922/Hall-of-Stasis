import { StaticCanvas, FabricObject } from 'fabric';

export function fadein(canvas: StaticCanvas, element: FabricObject, fadetime: number, onComplete: () => void) {
    element.animate(
        { opacity: 1 },
        {
            duration: fadetime,
            onChange: () => canvas.renderAll(),
            onComplete,
        },
    );
}

export function fadeout(canvas: StaticCanvas, element: FabricObject, fadetime: number, onComplete: () => void) {
    element.animate(
        { opacity: 0 },
        {
            duration: fadetime,
            onChange: () => canvas.renderAll(),
            onComplete,
        },
    );
}
