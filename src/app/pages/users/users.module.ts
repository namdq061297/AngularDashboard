import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UsersRoutingModule } from './users-routing.module';
import { ListComponent } from './list/list.component';
import { CreateUserComponent } from './create/create.component';
import { FormFieldComponent } from '@shared/components';

@NgModule({
  declarations: [ListComponent, CreateUserComponent],
  imports: [CommonModule, ReactiveFormsModule, UsersRoutingModule, FormFieldComponent],
})
export class UsersModule {}
