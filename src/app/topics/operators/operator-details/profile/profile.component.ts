import { Component, input } from '@angular/core';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
    profile = input.required<{
        name: string;
        classDescription: string;
        faction: string;
        appellation: string | null;
        description1: string;
        description2: string;
        rarity: string;
        class: string;
        subClass: string;
        basicInfo: { title: string; body: string };
        physicalExam: { title: string; body: string };
    }>();
}
