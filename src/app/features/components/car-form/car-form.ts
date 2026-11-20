import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Car, CreateCarDto } from '../../cars/models/car.model';
import { CarService } from '../../cars/services/car.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-form',
  imports: [ReactiveFormsModule],
  templateUrl: './car-form.html',
  styleUrl: './car-form.scss',
})
export class CarForm {

  private formBuilder = inject(FormBuilder);
  private carService = inject(CarService);
  private router = inject(Router);

  carForm = this.formBuilder.nonNullable.group({
     make: ['', Validators.required],
     model: ['', Validators.required],
     year: this.formBuilder.control<number|null> (null)
   });


  onSubmit(): void {

  const { make, model, year } = this.carForm.getRawValue();
  const newCar: CreateCarDto = { make, model, year: year ?? undefined };
      
      console.log('Submitted Car:', newCar);

      this.carService.addCar(newCar).subscribe({
        next: (response) => {
          console.log('Car added successfully:', response);
          this.router.navigate(['/cars']); 
        },
        error: (error) => {
          console.error('Error adding car:', error);
                }
      });
    
    //route back to car list page
    this.router.navigate(['/cars']); 
  }
}
