import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

function friendlyMessage(status: number): string {
  switch (status) {
    case 0:
    case 502:
    case 503:
    case 504:
      return 'Cannot reach the server. Check that the API is running.';
    case 400:
      return 'Some of the data was not valid.';
    case 401:
      return 'Please log in to continue.';
    case 403:
      return 'You are not allowed to do that.';
    case 404:
      return 'The requested car could not be found.';
    default:
      return 'Something went wrong on the server. Please try again.';
  }
}

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`HTTP ${error.status} ${req.method} ${req.url}`);
      return throwError(() => new Error(friendlyMessage(error.status)));
    }),
  );