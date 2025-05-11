import { Component, input } from '@angular/core';
import { Voice } from '../operator.model';

@Component({
    selector: 'app-voicelines',
    templateUrl: './voicelines.component.html',
    styleUrls: ['./voicelines.component.scss'],
})
export class VoicelinesComponent {
    voices = input.required<Voice[]>();
}
