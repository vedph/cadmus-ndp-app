/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { setWorkerUrl } from 'maplibre-gl';
import { appConfig } from './app/app.config';
import { App } from './app/app';

setWorkerUrl(new URL('assets/maplibre-gl/maplibre-gl-worker.mjs', document.baseURI).toString());

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
