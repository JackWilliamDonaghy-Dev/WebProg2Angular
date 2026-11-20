import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { CreateCarDto } from '../../cars/models/car.model';
import { CarService } from '../../cars/services/car.service';

@Component({
  selector: 'app-car-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './car-form.html',
  styleUrl: './car-form.scss',
})
export class CarForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly carService = inject(CarService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly maxYear = new Date().getFullYear() + 1;

  readonly carForm = this.formBuilder.nonNullable.group({
    make: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    model: ['', [Validators.required, Validators.maxLength(30)]],
    year: this.formBuilder.control<number | null>(null, [
      Validators.min(1950),
      Validators.max(this.maxYear),
    ]),
  });

  onSubmit(): void {
    if (this.saving()) return;

    this.saveError.set(null);
    if (this.carForm.invalid) {
      this.carForm.markAllAsTouched();
      return;
    }

    const { make, model, year } = this.carForm.getRawValue();
    const car: CreateCarDto = {
      make,
      model,
      ...(year === null ? {} : { year }),
    };

    this.saving.set(true);
    this.carForm.disable();

    this.carService.addCar(car).subscribe({
      next: () => {
        this.saving.set(false);
        this.carForm.enable();
        this.snackBar.open(`${car.make} ${car.model} saved`, 'Close', {
          duration: 4000,
        });
        void this.router.navigate(['/cars']);
      },
      error: (error: Error) => {
        this.saveError.set(error.message);
        this.carForm.enable();
        this.saving.set(false);
      },
    });
  }
}