import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';



bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));


// Special code to add a delay - remove later
app.use((_req, _res, next) => setTimeout(next, 2000));
