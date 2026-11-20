import { Component, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { withLoadState } from '../../../shared/load-state';
import { Car } from '../../cars/models/car.model';
import { CarService } from '../../cars/services/car.service';

@Component({
  selector: 'app-car-details',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './car-details.html',
  styleUrl: './car-details.scss',
})
export class CarDetails {
  private readonly carService = inject(CarService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly state = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => withLoadState(this.carService.getCarById(id))),
    ),
    { initialValue: { status: 'loading' } as const },
  );

  readonly deleting = signal(false);
  readonly deleteError = signal<string | null>(null);

  deleteCar(car: Car): void {
    if (this.deleting()) return;
    if (!window.confirm(`Delete ${car.make} ${car.model}?`)) return;

    this.deleteError.set(null);
    this.deleting.set(true);

    this.carService.deleteCar(car._id).subscribe({
      next: () => {
        this.deleting.set(false);
        void this.router.navigate(['/cars']);
      },
      error: (error: Error) => {
        this.deleteError.set(error.message);
        this.deleting.set(false);
      },
    });
  }
}