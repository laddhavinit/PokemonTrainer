import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const trainerName = localStorage.getItem('trainerName');
      const isLoggedIn = trainerName && trainerName.trim();
      const targetPath = route.routeConfig?.path || '';

      if (isLoggedIn) {
        // User is logged in
        if (targetPath === '') {
          // Trying to access landing page, redirect to catalogue
          this.router.navigate(['/catalogue']);
          return false;
        }
        // Allow access to catalogue/trainer pages
        return true;
      } else {
        // User is NOT logged in
        if (targetPath === '' || targetPath === undefined) {
          // Allow access to landing page
          return true;
        }
        // Block access to catalogue/trainer, redirect to landing
        this.router.navigate(['/']);
        return false;
      }
    }
    
    // Allow access during SSR to prevent issues
    return true;
  }
}