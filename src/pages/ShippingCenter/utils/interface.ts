export interface ProductInfo {
  product_identifier: string;
  title: string;
  quantity: number;
  personalisation?: string; // 用户个性化定制
}

export interface ProcessedOrder {
  buyer_id: number;
  name: string;
  email: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  first_line: string;
  second_line: string;
  product_identifier: string;
  title: string;
  option?: string;
  products: ProductInfo[];
  merchant_notes: string[];
}

export interface Buyer {
  buyer_id: number;
  email: string;
  name: string;
}

export interface Product {
  product_identifier: string;
  title: string;
}

export interface ToAddress {
  name: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  first_line: string;
  second_line: string;
}

export interface Variation {
  property: string;
  value: string;
}

export interface Transaction {
  product: Product;
  quantity: number;
  variations?: Variation[];
}

interface Note {
  note: string;
}

interface Notes {
  private_order_notes: Note[];
}
export interface Fulfillment {
  to_address: ToAddress;
}

export interface Order {
  buyer_id: number;
  transactions: Transaction[];
  fulfillment: Fulfillment;
  order_id: string;
  notes?: Notes;
}

export interface JsonData {
  buyers: Buyer[];
  orders: Order[];
}
