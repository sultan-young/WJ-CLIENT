export interface ProductInfo {
  product_identifier: string;
  title: string;
  quantity: number;
  personalisation?: string; // 用户个性化定制
  transaction_id: string | number; // 添加transaction_id
  order_id: string | number; // 添加order_id
}

export interface MerchantNote {
  note: string;
  order_id: string | number; // 添加order_id
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
  merchant_notes: MerchantNote[]; // 修改为包含order_id的结构
  order_id: string,
  order_date: string,
  is_gift_wrapped: boolean,
  gift_message: string,
  gift_buyer_first_name: string,
  __shopAbbr: string,
  __uid: string,
  [key: string]: any;
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
  transaction_id: string | number;
}

interface Note {
  note: string;
}

interface Notes {
  private_order_notes: Note[];
  note_from_buyer: String;
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
  order_date: string,
  is_gift_wrapped: boolean,
  gift_message: string,
  gift_buyer_first_name: string,
  [key: string]: any;
}

export interface JsonData {
  buyers: Buyer[];
  orders: Order[];
}
