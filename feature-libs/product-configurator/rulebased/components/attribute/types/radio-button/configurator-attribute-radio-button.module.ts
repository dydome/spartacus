import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { I18nModule } from '@spartacus/core';
import { ItemCounterModule, KeyboardFocusModule } from '@spartacus/storefront';
import { ConfiguratorAttributeRadioButtonComponent } from './configurator-attribute-radio-button.component';

@NgModule({
  imports: [
    KeyboardFocusModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    I18nModule,
    ItemCounterModule,
  ],
  declarations: [ConfiguratorAttributeRadioButtonComponent],
  exports: [ConfiguratorAttributeRadioButtonComponent],
  entryComponents: [ConfiguratorAttributeRadioButtonComponent],
})
export class ConfiguratorAttributeRadioButtonModule {}
