import { Component, Input, inject } from '@angular/core';
import { AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() controlName: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() errors: Record<string, string> = {};
  @Input() maxlength?: number;

  private controlContainer = inject(ControlContainer);

  get control(): AbstractControl | null {
    return this.controlContainer.control?.get(this.controlName) ?? null;
  }

  get showErrors(): boolean {
    return !!(this.control?.touched && this.control?.invalid);
  }

  get errorMessage(): string {
    const errs = this.control?.errors;
    if (!errs) return '';
    for (const key of Object.keys(errs)) {
      if (this.errors[key]) return this.errors[key];
    }
    return '';
  }
}
