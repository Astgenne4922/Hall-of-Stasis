import { Injectable } from '@angular/core';
import { FabricImage, StaticCanvas } from 'fabric';
import { BG_URL, HEIGHT, WIDTH } from '../../story-player.constants';
import { Command } from '../command.model';
import { fadein, fadeout } from '../common.animation';

@Injectable({
    providedIn: 'root',
})
export class ImageCommandsService {
    backgroundImages: { [key: string]: HTMLImageElement } = {};

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
            cropX: options?.x ?? 0,
            cropY: options?.y ?? 0,
            scaleX: (options?.xScale ?? 1) * (WIDTH / this.backgroundImages[image].width),
            scaleY: (options?.yScale ?? 1) * (HEIGHT / this.backgroundImages[image].height),
            opacity: options?.fadetime ? 0 : 1,
        };
        if (canvas.backgroundImage) canvas.backgroundImage.set({ image: this.backgroundImages[image], ...properties });
        else canvas.backgroundImage = new FabricImage(this.backgroundImages[image], properties);

        if (options?.fadetime) {
            if (options?.block) this.isInAnimation = true;
            fadein(canvas, canvas.backgroundImage, options.fadetime, () => {
                if (options?.block) this.isInAnimation = false;
            });
        }
    }
    handleBackgroundClear(canvas: StaticCanvas, options?: { fadetime?: number; block?: boolean }) {
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

    loadImages(
        script: {
            original: string;
            parsed: Command;
        }[],
    ) {
        this.backgroundImages =
            script.reduce((acc: { [key: string]: HTMLImageElement }, e) => {
                const bg = e.parsed.parameters?.['image']?.toLowerCase();
                if (e.parsed.command === 'background' && bg && !acc[bg]) {
                    acc[bg] = new Image();
                    acc[bg].src = `${BG_URL}/${bg}.png`;
                }

                return acc;
            }, {}) ?? {};
    }
}
