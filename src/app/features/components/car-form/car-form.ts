import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { notBlank } from '../../../shared/validators/not-blank.validator';
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
export class CarForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly carService = inject(CarService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly id = input<string>();
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly maxYear = new Date().getFullYear() + 1;

  readonly carForm = this.formBuilder.nonNullable.group({
    make: ['', [Validators.required, notBlank, Validators.minLength(2), Validators.maxLength(30)]],
    model: ['', [Validators.required, notBlank, Validators.maxLength(30)]],
    year: this.formBuilder.control<number | null>(null, [
      Validators.min(1950),
      Validators.max(this.maxYear),
    ]),
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    this.loading.set(true);
    this.carForm.disable();

    this.carService.getCarById(id).subscribe({
      next: (car) => {
        this.carForm.patchValue({
          make: car.make,
          model: car.model,
          year: car.year ?? null,
        });
        this.carForm.enable();
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loadError.set(error.message);
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.saving() || this.loading() || this.loadError()) return;

    this.saveError.set(null);
    if (this.carForm.invalid) {
      this.carForm.markAllAsTouched();
      return;
    }

    const id = this.id();
    const { make, model, year } = this.carForm.getRawValue();
    const car: CreateCarDto = {
      make,
      model,
      ...(year === null ? {} : { year }),
    };

    this.saving.set(true);
    this.carForm.disable();

    const request = id
      ? this.carService.updateCar(id, car)
      : this.carService.addCar(car);

    request.subscribe({
      next: (savedCar) => {
        this.carForm.enable();
        this.saving.set(false);
        this.snackBar.open(`${savedCar.make} ${savedCar.model} saved`, 'Close', {
          duration: 4000,
        });
        void this.router.navigate(id ? ['/cars', id] : ['/cars']);
      },
      error: (error: Error) => {
        this.saveError.set(error.message);
        this.carForm.enable();
        this.saving.set(false);
      },
    });
  }
}