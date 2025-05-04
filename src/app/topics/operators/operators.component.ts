import { Component, computed, effect, inject, signal } from '@angular/core';
import { OperatorsService } from './operators.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-operators',
    templateUrl: './operators.component.html',
    styleUrls: ['./operators.component.scss'],
    imports: [FormsModule],
})
export class OperatorsComponent {
    public opService = inject(OperatorsService);

    selectedOpCode = signal('');
    selectedOp = computed(() =>
        this.opService.getOperator(this.selectedOpCode())
    );
    selectedFiles = computed(() =>
        this.opService.getOperatorFiles(this.selectedOpCode())
    );
    selectedModules = computed(() =>
        this.opService.getModules(this.selectedOpCode())
    );
    selectedVoices = computed(() =>
        this.opService.getVoices(this.selectedOpCode())
    );

    constructor() {
        effect(() => {
            console.log(this.selectedOp());
            console.log(this.selectedFiles());
            console.log(this.selectedModules());
            console.log(this.selectedVoices());
        });
    }
}
