import { Component, input, signal } from '@angular/core';
import { Module } from '../operator.model';

@Component({
    selector: 'app-modules',
    templateUrl: './modules.component.html',
    styleUrls: ['./modules.component.scss'],
})
export class ModulesComponent {
    MODULE_URL =
        'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/uniequipimg';
    SUBCLASS_URL =
        'https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/subprofessionicon';

    modules = input.required<Module[]>();
    subClass = input.required<string>();
    switch = signal<number>(0);
}
