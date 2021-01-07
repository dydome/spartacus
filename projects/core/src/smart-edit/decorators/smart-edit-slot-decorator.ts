import { Injectable, Renderer2 } from '@angular/core';
import { SlotDecorator } from '../../cms/decorators/slot-decorator';
import { ContentSlotData } from '../../cms/model/content-slot-data.model';
import { Priority } from '../../util/applicable';
import { SmartEditService } from '../services/smart-edit.service';

@Injectable({
  providedIn: 'root',
})
export class SmartEditSlotDecorator extends SlotDecorator {
  constructor(protected smartEditService: SmartEditService) {
    super();
  }

  decorate(element: Element, renderer: Renderer2, slot: ContentSlotData): void {
    this.smartEditService.addSmartEditContract(
      slot.properties,
      element,
      renderer
    );
  }

  hasMatch(): boolean {
    return this.smartEditService.isLaunchedInSmartEdit();
  }

  getPriority(): Priority {
    return Priority.NORMAL;
  }
}
