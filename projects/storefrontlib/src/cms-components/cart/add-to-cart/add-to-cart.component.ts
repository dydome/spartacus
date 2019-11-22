import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  CartAddEvent,
  CartService,
  EventEmitter,
  OrderEntry,
  Product,
} from '@spartacus/core';
import { throttle } from 'helpful-decorators';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ModalRef, ModalService } from '../../../shared/components/modal/index';
import { CurrentProductService } from '../../product/current-product.service';
import { AddedToCartDialogComponent } from './added-to-cart-dialog/added-to-cart-dialog.component';

@Component({
  selector: 'cx-add-to-cart',
  templateUrl: './add-to-cart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToCartComponent implements OnInit, OnDestroy {
  @Input() productCode: string;
  @Input() showQuantity = true;

  /**
   * As long as we do not support #5026, we require product input, as we need
   *  a reference to the product model to fetch the stock data.
   */
  @Input() product: Product;

  maxQuantity: number;
  modalRef: ModalRef;

  hasStock = false;
  quantity = 1;
  increment = false;

  cartEntry$: Observable<OrderEntry>;

  subscription: Subscription;

  hoverDetails: BehaviorSubject<{}[]> = new BehaviorSubject([]);

  @HostListener('mouseenter') onEnter() {
    this.hoverDetails.next([]);
  }

  @HostListener('mousemove', ['$event'])
  @throttle(300)
  onHover(event: MouseEvent) {
    if (event.target instanceof HTMLButtonElement) {
      const mousePositions = this.hoverDetails.value;
      mousePositions.push({ offsetX: event.offsetX, offsetY: event.offsetY });
      this.hoverDetails.next(mousePositions);
    }
  }

  constructor(
    cartService: CartService,
    modalService: ModalService,
    currentProductService: CurrentProductService,
    cd: ChangeDetectorRef,
    eventRegister?: EventEmitter
  );

  constructor(
    protected cartService: CartService,
    protected modalService: ModalService,
    protected currentProductService: CurrentProductService,
    private cd: ChangeDetectorRef,
    private eventEmitter?: EventEmitter
  ) {}

  ngOnInit() {
    if (this.product) {
      this.productCode = this.product.code;
      this.cartEntry$ = this.cartService.getEntry(this.productCode);
      this.setStockInfo(this.product);
      this.cd.markForCheck();
    } else if (this.productCode) {
      this.cartEntry$ = this.cartService.getEntry(this.productCode);
      // force hasStock and quanity for the time being, as we do not have more info:
      this.quantity = 1;
      this.hasStock = true;
      this.cd.markForCheck();
    } else {
      this.subscription = this.currentProductService
        .getProduct()
        .pipe(filter(Boolean))
        .subscribe((product: Product) => {
          this.productCode = product.code;
          this.setStockInfo(product);
          this.cartEntry$ = this.cartService.getEntry(this.productCode);
          this.cd.markForCheck();
        });
    }
  }

  private setStockInfo(product: Product): void {
    this.quantity = 1;
    this.hasStock =
      product.stock && product.stock.stockLevelStatus !== 'outOfStock';
    if (this.hasStock && product.stock.stockLevel) {
      this.maxQuantity = product.stock.stockLevel;
    }
  }

  updateCount(value: number): void {
    this.quantity = value;
  }

  addToCart(event: MouseEvent) {
    if (!this.productCode || this.quantity <= 0) {
      return;
    }

    if (this.eventEmitter) {
      this.eventEmitter.merge(
        CartAddEvent,
        this.hoverDetails.pipe(map(hover => ({ hover: hover }))),
        (eventData: CartAddEvent) => {
          return eventData.state.productCode === this.productCode;
        }
      );
      // // emit mouse event
      this.eventEmitter.merge(
        CartAddEvent,
        of({ mouseEvent: event }),
        (eventData: CartAddEvent) => {
          return eventData.state.productCode === this.productCode;
        }
      );
    }

    // check item is already present in the cart
    // so modal will have proper header text displayed
    this.cartService
      .getEntry(this.productCode)
      .subscribe(entry => {
        if (entry) {
          this.increment = true;
        }
        this.openModal();
        this.cartService.addEntry(this.productCode, this.quantity);
        this.increment = false;
      })
      .unsubscribe();
  }

  private openModal() {
    let modalInstance: any;
    this.modalRef = this.modalService.open(AddedToCartDialogComponent, {
      centered: true,
      size: 'lg',
    });

    modalInstance = this.modalRef.componentInstance;
    modalInstance.entry$ = this.cartEntry$;
    modalInstance.cart$ = this.cartService.getActive();
    modalInstance.loaded$ = this.cartService.getLoaded();
    modalInstance.quantity = this.quantity;
    modalInstance.increment = this.increment;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
