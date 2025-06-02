import { Component, input } from '@angular/core';
import { BaseSkin, Skin } from '../operator.model';

@Component({
    selector: 'hos-outfits',
    templateUrl: './outfits.component.html',
    styleUrls: ['./outfits.component.scss'],
})
export class OutfitsComponent {
    SKIN_URL =
        'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/characters';

    code = input.required<string>();

    baseSkin = input.required<BaseSkin | null>();
    elite1Skin = input.required<BaseSkin | null>();
    elite2Skin = input.required<BaseSkin | null>();

    skins = input.required<Skin[]>();
}
