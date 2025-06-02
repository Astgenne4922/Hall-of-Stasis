import { Component, input, signal } from '@angular/core';

@Component({
    selector: 'hos-files',
    templateUrl: './files.component.html',
    styleUrls: ['./files.component.scss'],
})
export class FilesComponent {
    files = input.required<{ title: string; body: string }[]>();
    switch = signal(0);
}
