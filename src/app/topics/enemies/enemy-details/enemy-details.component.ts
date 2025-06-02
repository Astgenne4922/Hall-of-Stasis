import { httpResource } from '@angular/common/http';
import { Component, effect, input } from '@angular/core';
import { Enemy } from './enemy.model';

@Component({
    selector: 'hos-enemy-details',
    templateUrl: './enemy-details.component.html',
    styleUrls: ['./enemy-details.component.scss'],
})
export class EnemyDetailsComponent {
    ENEMY_URL =
        'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/enemies';

    code = input.required<string>();

    enemy = httpResource<Enemy>(() => `/enemies/${this.code()}/enemy.json`);
}
