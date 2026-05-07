import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing-component/landing-component';
import { TrainerComponent } from './pages/trainer-component/trainer-component';
import { CatalogueComponent } from './pages/catalogue-component/catalogue-component';

export const routes: Routes = [
    {path:'', component:LandingComponent},
    {path:'trainer', component:TrainerComponent},
    {path:'catalogue', component:CatalogueComponent}
];
