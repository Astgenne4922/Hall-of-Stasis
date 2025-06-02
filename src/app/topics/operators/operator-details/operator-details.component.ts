import { httpResource } from '@angular/common/http';
import { Component, effect, input, signal } from '@angular/core';
import { Operator } from './operator.model';
import { ProfileComponent } from './profile/profile.component';
import { FilesComponent } from './files/files.component';
import { VoicelinesComponent } from './voicelines/voicelines.component';
import { ModulesComponent } from './modules/modules.component';
import { OutfitsComponent } from './outfits/outfits.component';

@Component({
    selector: 'hos-operator-details',
    templateUrl: './operator-details.component.html',
    styleUrls: ['./operator-details.component.scss'],
    imports: [ProfileComponent, FilesComponent, VoicelinesComponent, ModulesComponent, OutfitsComponent],
})
export class OperatorDetailsComponent {
    code = input.required<string>();

    operator = httpResource<Operator>(() => `/characters/${this.code()}/character.json`);

    switch = signal('profile');

    constructor() {
        effect(() => {
            if (this.code()) this.switch.set('profile');
        });
    }
}
