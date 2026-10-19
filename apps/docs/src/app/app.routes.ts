import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home').then((m) => m.HomePage), title: 'NXT Design' },
  { path: 'roadmap', loadComponent: () => import('./pages/roadmap').then((m) => m.RoadmapPage), title: 'Roadmap · NXT Design' },
  // Bare example rendering — used by Playwright a11y/visual tests and "Mở riêng" links.
  { path: 'examples/:id', loadComponent: () => import('./pages/example-page').then((m) => m.ExamplePage) },
  { path: ':section/:slug', loadComponent: () => import('./pages/doc-page').then((m) => m.DocPageView) },
  { path: '**', loadComponent: () => import('./pages/not-found').then((m) => m.NotFoundPage), title: 'Không tìm thấy · NXT Design' },
];
