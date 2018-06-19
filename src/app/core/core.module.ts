import { NgModule } from '@angular/core';
import { NotfoundComponent } from 'app/core/notfound/notfound.component';
import { SharedModule } from 'app/shared/shared.module';
import { AppRoutingModule } from 'app/app-routing.module';

@NgModule({
  imports: [SharedModule, AppRoutingModule],
  exports: [AppRoutingModule],
  declarations: [NotfoundComponent],
  providers: []
})
export class CoreModule {}
