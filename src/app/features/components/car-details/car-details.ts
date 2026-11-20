import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { LoadState, withLoadState } from '../../../shared/load-state';
import { Car } from '../../cars/models/car.model';
import { CarService } from '../../cars/services/car.service';

@Component({
  selector: 'app-car-details',
  templateUrl: './car-details.html',
  styleUrl: './car-details.scss',
})
export class CarDetails {
  private readonly carService = inject(CarService);
  readonly id = input.required<string>();

  private readonly initial: LoadState<Car> = { status: 'loading' };

  readonly state = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => withLoadState(this.carService.getCarById(id))),
    ),
    { initialValue: this.initial },
  );
}