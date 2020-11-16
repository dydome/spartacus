import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProductListOutlets } from '../../product-outlets.model';

@Component({
  selector: 'cx-product-list-item',
  templateUrl: './product-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListItemComponent {
  readonly Outlets = ProductListOutlets;
  @Input() product: any;
}
