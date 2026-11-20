import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CreateCarDto } from '../../cars/models/car.model';
import { CarService } from '../../cars/services/car.service';

@Component({
  selector: 'app-car-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './car-form.html',
  styleUrl: './car-form.scss',
})
export class CarForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly carService = inject(CarService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly carForm = this.formBuilder.nonNullable.group({
    make: ['', Validators.required],
    model: ['', Validators.required],
    year: this.formBuilder.control<number | null>(null),
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
    this.carService.addCar(car).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/cars']);
      },
      error: (error: Error) => {
        this.saveError.set(error.message);
        this.saving.set(false);
      },
    });
  }
}