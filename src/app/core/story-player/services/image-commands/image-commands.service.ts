import { Injectable } from '@angular/core';
import { FabricImage, FabricObject, Point, StaticCanvas } from 'fabric';
import { HEIGHT, WIDTH } from '../../story-player.constants';
import { Command } from '../command.model';
import { fadein, fadeout } from '../common.animation';
import { BG_URL, IMAGE_OVERLAY, IMG_URL } from './image-commands.constants';
import { DIALOG_GROUP } from '../text-commands/text-commands.constants';

@Injectable({
    providedIn: 'root',
})
export class ImageCommandsService {
    loadedImages: { [key: string]: HTMLImageElement } = {};

    isInAnimation = false;

    handleBackground(
        canvas: StaticCanvas,
        image: string,
        options?: {
            x?: number;
            y?: number;
            xScale?: number;
            yScale?: number;
            fadetime?: number;
            block?: boolean;
        },
    ) {
        const properties = {
            // left: options?.x ?? 0,
            // top: options?.y ?? 0,
            // scaleX: (options?.xScale ?? 1) * (WIDTH / this.loadedImages[image].width),
            // scaleY: (options?.yScale ?? 1) * (HEIGHT / this.loadedImages[image].height),
            opacity: options?.fadetime ? 0 : 1,
        };

        if (canvas.backgroundImage) {
            (canvas.backgroundImage as FabricImage).setElement(this.loadedImages[image]);
            (canvas.backgroundImage as FabricImage).set({ ...properties });
        } else canvas.backgroundImage = new FabricImage(this.loadedImages[image], properties);

        // canvas.backgroundImage.scaleToWidth(WIDTH * (options?.xScale ?? 1));
        // canvas.backgroundImage.scaleToHeight(HEIGHT * (options?.yScale ?? 1));
        canvas.backgroundImage.scaleToWidth(1500 * (options?.xScale ?? 1));
        canvas.backgroundImage.scaleToHeight(843 * (options?.yScale ?? 1));
        canvas.backgroundImage.setPositionByOrigin(
            new Point(WIDTH / 2 - (options?.x ?? 0), HEIGHT / 2 - (options?.y ?? 0)),
            'center',
            'center',
        );

        if (options?.fadetime) {
            if (options?.block) this.isInAnimation = true;
            fadein(canvas, canvas.backgroundImage, options.fadetime, () => {
                if (options?.block) this.isInAnimation = false;
            });
        }
    }
    clearBackground(canvas: StaticCanvas, options?: { fadetime?: number; block?: boolean }) {
        if (!canvas.backgroundImage) return;

        if (options?.fadetime) {
            if (options?.block) this.isInAnimation = true;
            fadeout(canvas, canvas.backgroundImage, options.fadetime, () => {
                if (options?.block) this.isInAnimation = false;
            });
        } else {
            canvas.backgroundImage = undefined;
        }
    }
    handleBackgroundTween(
        canvas: StaticCanvas,
        options: {
            xFrom?: number;
            yFrom?: number;
            xTo?: number;
            yTo?: number;
            xScaleFrom?: number;
            yScaleFrom?: number;
            xScaleTo?: number;
            yScaleTo?: number;
            duration?: number;
            block: boolean;
            ease?: string;
        },
    ) {
        if (canvas.backgroundImage) this.animateImage(canvas, canvas.backgroundImage, options);
    }

    handleImage(
        canvas: StaticCanvas,
        image: string,
        options?: {
            x?: number;
            y?: number;
            xScale?: number;
            yScale?: number;
            fadetime?: number;
            block?: boolean;
        },
    ) {
        const properties = {
            // left: options?.x ?? 0,
            // top: options?.y ?? 0,
            // scaleX: (options?.xScale ?? 1) * (WIDTH / this.loadedImages[image].width),
            // scaleY: (options?.yScale ?? 1) * (HEIGHT / this.loadedImages[image].height),
            opacity: options?.fadetime ? 0 : 1,
        };

        if (!IMAGE_OVERLAY.isEmpty()) {
            (IMAGE_OVERLAY.item(0) as FabricImage).setElement(this.loadedImages[image]);
            (IMAGE_OVERLAY.item(0) as FabricImage).set({ ...properties });
        } else IMAGE_OVERLAY.add(new FabricImage(this.loadedImages[image], properties));

        (IMAGE_OVERLAY.item(0) as FabricImage).scaleToWidth(WIDTH * (options?.xScale ?? 1));
        (IMAGE_OVERLAY.item(0) as FabricImage).scaleToHeight(HEIGHT * (options?.yScale ?? 1));
        // (IMAGE_OVERLAY.item(0) as FabricImage).setPositionByOrigin(
        //     new Point(WIDTH / 2 - (options?.x ?? 0), HEIGHT / 2 - (options?.y ?? 0)),
        //     'center',
        //     'center',
        // );
        (IMAGE_OVERLAY.item(0) as FabricImage).setPositionByOrigin(
            new Point(-(options?.x ?? 0), -(options?.y ?? 0)),
            'center',
            'center',
        );

        IMAGE_OVERLAY.set('visible', true);

        if (options?.fadetime) {
            if (options?.block) this.isInAnimation = true;
            fadein(canvas, IMAGE_OVERLAY.item(0), options.fadetime, () => {
                if (options?.block) this.isInAnimation = false;
            });
        }
    }
    clearImage(canvas: StaticCanvas, options?: { fadetime?: number; block?: boolean }) {
        if (IMAGE_OVERLAY.isEmpty()) return;

        if (options?.fadetime) {
            if (options?.block) this.isInAnimation = true;
            fadeout(canvas, IMAGE_OVERLAY.item(0), options.fadetime, () => {
                if (options?.block) this.isInAnimation = false;
            });
        } else {
            IMAGE_OVERLAY.removeAll();
        }
    }
    handleImageTween(
        canvas: StaticCanvas,
        options: {
            xFrom?: number;
            yFrom?: number;
            xTo?: number;
            yTo?: number;
            xScaleFrom?: number;
            yScaleFrom?: number;
            xScaleTo?: number;
            yScaleTo?: number;
            duration?: number;
            block: boolean;
            ease?: string;
        },
    ) {
        if (!IMAGE_OVERLAY.isEmpty())
            this.animateImage(canvas, IMAGE_OVERLAY.item(0), {
                ...options,
                xTo: IMAGE_OVERLAY.item(0).get('left') + options.xTo,
                yTo: IMAGE_OVERLAY.item(0).get('top') + options.yTo,
            });
    }

    private animateImage(
        canvas: StaticCanvas,
        imageObj: FabricObject,
        options: {
            xFrom?: number;
            yFrom?: number;
            xTo?: number;
            yTo?: number;
            xScaleFrom?: number;
            yScaleFrom?: number;
            xScaleTo?: number;
            yScaleTo?: number;
            duration?: number;
            block: boolean;
            ease?: string;
        },
    ) {
        if (options.block) this.isInAnimation = true;
        console.log(imageObj.scaleX);
        console.log(imageObj.scaleY);

        imageObj.animate(
            {
                // left: options.xTo!,
                // top: options.yTo!,
                scaleX: options.xScaleTo!,
                scaleY: options.yScaleTo!,
            },
            {
                duration: options.duration,
                onChange: () => canvas.renderAll(),
                onComplete: () => {
                    if (options.block) this.isInAnimation = false;
                },
            },
        );
    }

    loadImages(
        script: {
            original: string;
            parsed: Command;
        }[],
    ) {
        this.loadedImages =
            script.reduce((acc: { [key: string]: HTMLImageElement }, e) => {
                const bg = e.parsed.parameters?.['image']?.toLowerCase();
                // if (e.parsed.command === 'background' && bg && !acc[bg]) {
                if (bg && !acc[bg]) {
                    switch (e.parsed.command) {
                        case 'background':
                            acc[bg] = new Image();
                            acc[bg].src = `${BG_URL}/${bg}.png`;
                            break;
                        case 'image':
                            acc[bg] = new Image();
                            acc[bg].src = `${IMG_URL}/${bg}.png`;
                            break;
                    }
                }

                return acc;
            }, {}) ?? {};
    }
}
