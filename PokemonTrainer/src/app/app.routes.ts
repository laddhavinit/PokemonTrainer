import { Routes } from '@angular/router';
import { LandingComponent } from '@pages/landing/landing.component';
import { TrainerComponent } from '@pages/trainer/trainer.component';
import { CatalogueComponent } from '@pages/catalogue/catalogue.component';
import { AuthGuard } from '@guards/auth.guard';
import { LandingGuard } from '@guards/landing.guard';

export const routes: Routes = [
    { 
        path: '', 
        component: LandingComponent,
        canActivate: [LandingGuard]
    },
    { 
        path: 'trainer', 
        component: TrainerComponent,
        canActivate: [AuthGuard]
    },
    { 
        path: 'catalogue', 
        component: CatalogueComponent,
        canActivate: [AuthGuard]
    }
];
