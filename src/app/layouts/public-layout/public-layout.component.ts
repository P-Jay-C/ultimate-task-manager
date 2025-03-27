// public-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicNavBarComponent } from "../../shared/components/public-nav-bar/public-nav-bar.component";
import { PublicFooterComponent } from "../../shared/components/public-footer/public-footer.component";

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicNavBarComponent, PublicFooterComponent],
  templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent {}
