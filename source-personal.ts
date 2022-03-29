import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
    UpdateDateColumn,
  } from "typeorm"
  import { ulid } from "ulid"
  import {
    DbAwareColumn,
    resolveDbGenerationStrategy,
    resolveDbType,
  } from "../utils/db-aware-column"
  import { manualAutoIncrement } from "../utils/manual-auto-increment"
  import { Address } from "./address"
  import { Cart } from "./cart"
  import { ClaimOrder } from "./claim-order"
  import { Currency } from "./currency"
  import { Customer } from "./customer"
  import { Discount } from "./discount"
  import { DraftOrder } from "./draft-order"
  import { Fulfillment } from "./fulfillment"
  import { GiftCard } from "./gift-card"
  import { GiftCardTransaction } from "./gift-card-transaction"
  import { LineItem } from "./line-item"
  import { Payment } from "./payment"
  import { Refund } from "./refund"
  import { Region } from "./region"
  import { Return } from "./return"
  import { ShippingMethod } from "./shipping-method"
  import { Swap } from "./swap"
  
  export enum OrderStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    ARCHIVED = "archived",
    CANCELED = "canceled",
    REQUIRES_ACTION = "requires_action",
  }
  
  export enum FulfillmentStatus {
    NOT_FULFILLED = "not_fulfilled",
    PARTIALLY_FULFILLED = "partially_fulfilled",
    FULFILLED = "fulfilled",
    PARTIALLY_SHIPPED = "partially_shipped",
    SHIPPED = "shipped",
    PARTIALLY_RETURNED = "partially_returned",
    RETURNED = "returned",
    CANCELED = "canceled",
    REQUIRES_ACTION = "requires_action",
  }
  
  export enum PaymentStatus {
    NOT_PAID = "not_paid",
    AWAITING = "awaiting",
    CAPTURED = "captured",
    PARTIALLY_REFUNDED = "partially_refunded",
    REFUNDED = "refunded",
    CANCELED = "canceled",
    REQUIRES_ACTION = "requires_action",
  }
  
  @Entity()
  export class Order {
    @PrimaryColumn()
    id: string
  
    @DbAwareColumn({ type: "enum", enum: OrderStatus, default: "pending" })
    status: OrderStatus
  
    @DbAwareColumn({
      type: "enum",
      enum: FulfillmentStatus,
      default: "not_fulfilled",
    })
    fulfillment_status: FulfillmentStatus
  
    @DbAwareColumn({ type: "enum", enum: PaymentStatus, default: "not_paid" })
    payment_status: PaymentStatus
  
    @Index()
    @Column()
    @Generated(resolveDbGenerationStrategy("increment"))
    display_id: number
  
    @Index()
    @Column({ nullable: true })
    cart_id: string
  
    @OneToOne(() => Cart)
    @JoinColumn({ name: "cart_id" })
    cart: Cart
  
    @Index()
    @Column()
    customer_id: string
  
    @ManyToOne(() => Customer, { cascade: ["insert"] })
    @JoinColumn({ name: "customer_id" })
    customer: Customer
  
    @Column()
    email: string
  
    @Index()
    @Column({ nullable: true })
    billing_address_id: string
  
    @ManyToOne(() => Address, { cascade: ["insert"] })
    @JoinColumn({ name: "billing_address_id" })
    billing_address: Address
  
    @Index()
    @Column({ nullable: true })
    shipping_address_id: string
  
    @ManyToOne(() => Address, { cascade: ["insert"] })
    @JoinColumn({ name: "shipping_address_id" })
    shipping_address: Address
  
    @Index()
    @Column()
    region_id: string
  
    @ManyToOne(() => Region)
    @JoinColumn({ name: "region_id" })
    region: Region
  
    @Column()
    currency_code: string
  
    @ManyToOne(() => Currency)
    @JoinColumn({ name: "currency_code", referencedColumnName: "code" })
    currency: Currency
  
    @Column({ type: "int" })
    tax_rate: number
  
    @ManyToMany(() => Discount, { cascade: ["insert"] })
    @JoinTable({
      name: "order_discounts",
      joinColumn: {
        name: "order_id",
        referencedColumnName: "id",
      },
      inverseJoinColumn: {
        name: "discount_id",
        referencedColumnName: "id",
      },
    })
    discounts: Discount[]
  
    @ManyToMany(() => GiftCard, { cascade: ["insert"] })
    @JoinTable({
      name: "order_gift_cards",
      joinColumn: {
        name: "order_id",
        referencedColumnName: "id",
      },
      inverseJoinColumn: {
        name: "gift_card_id",
        referencedColumnName: "id",
      },
    })
    gift_cards: GiftCard[]
  
    @OneToMany(() => ShippingMethod, (method) => method.order, {
      cascade: ["insert"],
    })
    shipping_methods: ShippingMethod[]
  
    @OneToMany(() => Payment, (payment) => payment.order, { cascade: ["insert"] })
    payments: Payment[]
  
    @OneToMany(() => Fulfillment, (fulfillment) => fulfillment.order, {
      cascade: ["insert"],
    })
    fulfillments: Fulfillment[]
  
    @OneToMany(() => Return, (ret) => ret.order, { cascade: ["insert"] })
    returns: Return[]
  
    @OneToMany(() => ClaimOrder, (co) => co.order, { cascade: ["insert"] })
    claims: ClaimOrder[]
  
    @OneToMany(() => Refund, (ref) => ref.order, { cascade: ["insert"] })
    refunds: Refund[]
  
    @OneToMany(() => Swap, (swap) => swap.order, { cascade: ["insert"] })
    swaps: Swap[]
  
    @Column({ nullable: true })
    draft_order_id: string
  
    @OneToOne(() => DraftOrder)
    @JoinColumn({ name: "draft_order_id" })
    draft_order: DraftOrder
  
    @OneToMany(() => LineItem, (lineItem) => lineItem.order, {
      cascade: ["insert"],
    })
    items: LineItem[]
  
    @OneToMany(() => GiftCardTransaction, (gc) => gc.order)
    gift_card_transactions: GiftCardTransaction[]
  
    @Column({ nullable: true, type: resolveDbType("timestamptz") })
    canceled_at: Date
  
    @CreateDateColumn({ type: resolveDbType("timestamptz") })
    created_at: Date
  
    @UpdateDateColumn({ type: resolveDbType("timestamptz") })
    updated_at: Date
  
    @DbAwareColumn({ type: "jsonb", nullable: true })
    metadata: any
  
    @Column({ type: "boolean", nullable: true })
    no_notification: boolean
  
    @Column({ nullable: true })
    idempotency_key: string
  
    // Total fields
    shipping_total: number
    discount_total: number
    tax_total: number
    refunded_total: number
    total: number
    subtotal: number
    paid_total: number
    refundable_amount: number
    gift_card_total: number
  
    @BeforeInsert()
    private async beforeInsert(): Promise<void> {
      if (!this.id) {
        const id = ulid()
        this.id = `order_${id}`
      }
  
      if (process.env.NODE_ENV === "development" && !this.display_id) {
        const disId = await manualAutoIncrement("order")
  
        if (disId) {
          this.display_id = disId
        }
      }
    }
  }
  