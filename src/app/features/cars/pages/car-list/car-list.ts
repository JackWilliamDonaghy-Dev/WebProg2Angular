import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { withLoadState } from '../../../../shared/load-state';
import { CarCard } from '../../components/car-card/car-card';
import { CarService } from '../../services/car.service';

@Component({
  selector: 'app-car-list',
  imports: [CarCard],
  templateUrl: './car-list.html',
  styleUrl: './car-list.scss',
})
export class CarList {
  private readonly carService = inject(CarService);

  readonly state = toSignal(withLoadState(this.carService.getCars()), {
    requireSync: true,
  });
}