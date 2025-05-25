import { Injectable } from '@angular/core';
import { dialogCommand, genericCommand } from './command.model';

const BG_URL =
    'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/avg/backgrounds';
const IMG_URL =
    'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/avg/images';
const CHAR_URL =
    'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/avg/characters';

@Injectable({
    providedIn: 'root',
})
export class StoryPlayerService {
    private moveImageAnimationRequest!: number;

    drawBlocker(command: genericCommand, ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, 1024, 576);

        let opacity = 0;

        const fadein = () => {
            if (opacity >= 1) return;
            requestAnimationFrame(fadein);

            ctx.clearRect(0, 0, 1024, 576);
            ctx.globalAlpha = opacity;
            ctx.fillStyle = `rgb(${command.parameters?.['r'] ?? 0},${command.parameters?.['g'] ?? 0},${command.parameters?.['b'] ?? 0})`;
            ctx.fillRect(0, 0, 1024, 576);
            opacity += 1 / (+command.parameters!['fadetime'] * 60);
        };

        const fadeout = () => {
            if (opacity <= 0) return;
            requestAnimationFrame(fadeout);

            ctx.clearRect(0, 0, 1024, 576);
            ctx.globalAlpha = opacity;
            ctx.fillStyle = `rgb(${command.parameters?.['r'] ?? 0},${command.parameters?.['g'] ?? 0},${command.parameters?.['b'] ?? 0})`;
            ctx.fillRect(0, 0, 1024, 576);
            opacity -= 1 / (+command.parameters!['fadetime'] * 60);
        };

        if (command.parameters!['a'] === '1') {
            opacity = 0;
            fadein();
        } else {
            opacity = 1;
            fadeout();
        }
    }

    drawImage(command: genericCommand, ctx: CanvasRenderingContext2D) {
        cancelAnimationFrame(this.moveImageAnimationRequest);
        if (!command.parameters) {
            ctx.clearRect(0, 0, 1024, 576);
            return;
        }

        const img = new Image();
        img.src = `${IMG_URL}/${command.parameters!['image']}.png`;
        img.onload = () => {
            const x = -(command.parameters?.['x'] ?? 0);
            const xScale = -(command.parameters?.['xScale'] ?? 1);
            const y = -(command.parameters?.['y'] ?? 0);
            const yScale = -(command.parameters?.['yScale'] ?? 1);

            if (+command.parameters!['fadetime']) {
                let opacity = 0;
                const fadein = () => {
                    if (opacity >= 1) return;
                    requestAnimationFrame(fadein);

                    ctx.clearRect(0, 0, 1024, 576);
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(
                        img,
                        x - (1024 * xScale - 1024) / 2,
                        y - (576 * yScale - 576) / 2,
                        1024 * xScale,
                        576 * yScale,
                    );
                    opacity += 1 / (+command.parameters!['fadetime'] * 60);
                };

                fadein();
            } else {
                ctx.reset();
                ctx.drawImage(
                    img,
                    x - (1024 * xScale - 1024) / 2,
                    y - (576 * yScale - 576) / 2,
                    1024 * xScale,
                    576 * yScale,
                );
            }
        };
    }
    moveImage(
        image: string,
        command: genericCommand,
        ctx: CanvasRenderingContext2D,
    ) {
        let time = 0;
        const original = new Image();
        original.src = `${IMG_URL}/${image}.png`;
        let currentX = +command.parameters!['xFrom'];
        let currentY = +command.parameters!['yFrom'];
        let currentXScale = +command.parameters!['xScaleFrom'];
        let currentYScale = +command.parameters!['yScaleFrom'];
        const transform = () => {
            if (time >= +command.parameters!['duration']) return;
            this.moveImageAnimationRequest = requestAnimationFrame(transform);

            ctx.drawImage(
                original,
                currentX - (1024 * currentXScale - 1024) / 2,
                currentY - (576 * currentYScale - 576) / 2,
                1024 * currentXScale,
                576 * currentYScale,
            );

            if (+command.parameters!['xTo'])
                currentX +=
                    (+command.parameters!['xTo'] -
                        +command.parameters!['xFrom']) /
                    (+command.parameters!['duration'] * 60);
            if (+command.parameters!['yTo'])
                currentY +=
                    (+command.parameters!['yTo'] -
                        +command.parameters!['yFrom']) /
                    (+command.parameters!['duration'] * 60);
            currentXScale +=
                (+command.parameters!['xScaleTo'] -
                    +command.parameters!['xScaleFrom']) /
                (+command.parameters!['duration'] * 60);
            currentYScale +=
                (+command.parameters!['yScaleTo'] -
                    +command.parameters!['yScaleFrom']) /
                (+command.parameters!['duration'] * 60);
            time += 1 / 60;
        };

        original.onload = transform;
    }

    drawBackground(command: genericCommand, ctx: CanvasRenderingContext2D) {
        if (!command.parameters) {
            ctx.clearRect(0, 0, 1024, 576);
            return;
        }

        const img = new Image();
        img.src = `${BG_URL}/${command.parameters!['image']}.png`;
        img.onload = () => {
            const x = -(command.parameters?.['x'] ?? 0);
            const xScale = -(command.parameters?.['xScale'] ?? 1);
            const y = -(command.parameters?.['y'] ?? 0);
            const yScale = -(command.parameters?.['yScale'] ?? 1);

            if (+command.parameters!['fadetime']) {
                let opacity = 0;
                const fadein = () => {
                    if (opacity >= 1) return;
                    requestAnimationFrame(fadein);

                    ctx.clearRect(0, 0, 1024, 576);
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(
                        img,
                        x - (1024 * xScale - 1024) / 2,
                        y - (576 * yScale - 576) / 2,
                        1024 * xScale,
                        576 * yScale,
                    );
                    opacity += 1 / (+command.parameters!['fadetime'] * 60);
                };

                fadein();
            } else {
                ctx.reset();
                ctx.drawImage(
                    img,
                    x - (1024 * xScale - 1024) / 2,
                    y - (576 * yScale - 576) / 2,
                    1024 * xScale,
                    576 * yScale,
                );
            }
        };
    }

    drawDialogBackground(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, 1024, 576);

        const grad = ctx.createLinearGradient(
            1024 / 2,
            576 - 200,
            1024 / 2,
            576,
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 1)');

        const grad2 = ctx.createLinearGradient(1024 / 2, 0, 1024 / 2, 100);
        grad2.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 576 - 200, 1024, 200);
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, 1024, 100);
    }
    typeDialog(
        command: dialogCommand,
        ctx: CanvasRenderingContext2D,
        cleanup: () => void,
    ) {
        this.drawDialogBackground(ctx);

        if (command.parameters.speaker) {
            ctx.font = '20px Arial, Helvetica, sans-serif';
            ctx.fillStyle = '#7B7B7B';
            ctx.textAlign = 'right';
            ctx.fillText(command.parameters.speaker, 260, 576 - 55);
        }

        ctx.font = '18px Arial, Helvetica, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        const lines = this.wrapText(command.content, ctx);
        const metrics = ctx.measureText(command.content);
        const lineHeight =
            metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

        let lineIdx = 0;
        let i = 0;
        let typeWriterInterval: ReturnType<typeof setInterval>;
        typeWriterInterval = setInterval(() => {
            const cursorX =
                ctx.measureText(lines[lineIdx].slice(0, i + 1)).width -
                ctx.measureText(lines[lineIdx][i]).width;
            ctx.fillText(
                lines[lineIdx][i],
                300 + cursorX,
                576 - 55 + lineHeight * lineIdx,
            );
            if (i + 1 < lines[lineIdx].length) i++;
            else if (lineIdx + 1 < lines.length) {
                lineIdx++;
                i = 0;
            } else {
                clearInterval(typeWriterInterval);
                cleanup();
            }
        }, 25);

        return typeWriterInterval;
    }
    drawDialog(command: dialogCommand, ctx: CanvasRenderingContext2D) {
        this.drawDialogBackground(ctx);

        if (command.parameters.speaker) {
            ctx.font = '20px Arial, Helvetica, sans-serif';
            ctx.fillStyle = '#7B7B7B';
            ctx.textAlign = 'right';
            ctx.fillText(command.parameters.speaker, 260, 576 - 55);
        }

        ctx.font = '18px Arial, Helvetica, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        const lines = this.wrapText(command.content, ctx);
        const metrics = ctx.measureText(command.content);
        const lineHeight =
            metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], 300, 576 - 55 + lineHeight * i);
        }
    }

    drawDecision(command: genericCommand, ctx: CanvasRenderingContext2D) {
        const options = command.parameters!['options'].split(';');
        for (let i = 0; i < options.length; i++) {
            let y;
            if (options.length === 3)
                y = 288 + (80 - 80 * (options.length - 1 - i));
            else if (options.length === 2)
                y = 288 + (40 - 80 * (options.length - 1 - i));
            else y = 288;

            ctx.fillStyle = '#313131';
            ctx.strokeStyle = 'white';
            ctx.fillRect(200, y, 624, 50);
            ctx.strokeRect(200, y, 624, 50);

            ctx.font = '18px Arial, Helvetica, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(options[i], 200 + 624 / 2, y + 25);
        }
    }

    drawCharacters(command: genericCommand, ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, 1024, 576);

        if (command.parameters?.['name']) {
            if (command.parameters!['name2']) {
                const left = new Image();
                if (command.parameters!['name'].split('_').length > 3)
                    left.src = `${CHAR_URL}/${command.parameters![
                        'name'
                    ].replace(
                        /#\d$/,
                        '',
                    )}/${command.parameters!['name'].replace(/\d#/, '')}.png`;
                else
                    left.src = `${CHAR_URL}/${command.parameters!['name']}.png`;
                left.onload = () => {
                    ctx.filter =
                        command.parameters!['focus'] === '2'
                            ? 'brightness(50%)'
                            : 'none';
                    ctx.drawImage(left, -35, 0, 774, 774);
                    ctx.strokeRect(-35, 0, 774, 774);
                };

                const right = new Image();
                if (command.parameters!['name2'].split('_').length > 3)
                    right.src = `${CHAR_URL}/${command.parameters![
                        'name2'
                    ].replace(
                        /#\d$/,
                        '',
                    )}/${command.parameters!['name2'].replace(/\d#/, '')}.png`;
                else
                    right.src = `${CHAR_URL}/${command.parameters!['name2']}.png`;
                right.onload = () => {
                    ctx.filter =
                        command.parameters!['focus'] === '1'
                            ? 'brightness(50%)'
                            : 'none';
                    ctx.drawImage(right, 235, -25, 874, 874);
                    ctx.strokeRect(235, -25, 874, 874);
                };
            } else {
                const img = new Image();
                if (command.parameters!['name'].split('_').length > 3)
                    img.src = `${CHAR_URL}/${command.parameters![
                        'name'
                    ].replace(
                        /#\d$/,
                        '',
                    )}/${command.parameters!['name'].replace(/\d#/, '')}.png`;
                else img.src = `${CHAR_URL}/${command.parameters!['name']}.png`;
                img.onload = () => {
                    ctx.filter = 'none';
                    ctx.drawImage(img, 100, 30, 824, 824);
                    ctx.strokeRect(100, 30, 824, 824);
                };
            }
        }
    }

    wrapText(text: string, ctx: CanvasRenderingContext2D) {
        const lines: string[] = [''];
        let i = 0;

        for (const word of text.trim().split(' ')) {
            if (ctx.measureText(`${lines[i]} ${word}`).width < 1024 - 300)
                lines[i] = `${lines[i]} ${word}`.trim();
            else {
                lines.push(word);
                i++;
            }
        }

        return lines;
    }
}
