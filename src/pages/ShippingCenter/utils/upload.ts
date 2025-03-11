export interface ProcessedData {
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
}

interface Buyer {
  buyer_id: number;
  email: string;
  name: string;
}

interface Product {
  product_identifier: string;
  title: string;
}

interface Transaction {
  product: Product;
}

interface ToAddress {
  name: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  first_line: string;
  second_line: string;
}

interface Fulfillment {
  to_address: ToAddress;
}

interface Order {
  buyer_id: number;
  transactions: Transaction[];
  fulfillment: Fulfillment;
}

interface JsonData {
  buyers: Buyer[];
  orders: Order[];
}

export function processData(jsonData: JsonData): ProcessedData[] {
  const processedData: ProcessedData[] = [];

  // Process each order
  jsonData.orders.forEach((order) => {
    // Find the buyer that matches the order's buyer_id
    const buyer = jsonData.buyers.find((b) => b.buyer_id === order.buyer_id);

    if (!buyer) return;

    // Process each transaction in the order
    order.transactions.forEach((transaction) => {
      const { product } = transaction;
      const { to_address } = order.fulfillment;

      // Create a new processed data entry
      processedData.push({
        name: to_address.name,
        email: buyer.email,
        country: to_address.country,
        state: to_address.state,
        city: to_address.city,
        zip: to_address.zip,
        first_line: to_address.first_line,
        second_line: to_address.second_line || "",
        product_identifier: product.product_identifier,
        title: product.title,
      });
    });
  });
  return processedData;
}

export function processJsonData(jsonData: JsonData): ProcessedOrder[] {
  const processedOrders: ProcessedOrder[] = [];

  // Create a map of buyers by buyer_id for quick lookup
  const buyersMap = new Map<number, Buyer>();
  jsonData.buyers.forEach((buyer) => {
    buyersMap.set(buyer.buyer_id, buyer);
  });

  // Process each order
  jsonData.orders.forEach((order) => {
    const buyer = buyersMap.get(order.buyer_id);

    if (!buyer) return;

    // Process each transaction in the order
    order.transactions.forEach((transaction) => {
      const { product } = transaction;
      const { to_address } = order.fulfillment;

      processedOrders.push({
        // Buyer ID
        buyer_id: buyer.buyer_id,

        // Buyer information
        email: buyer.email,

        // Address information
        name: to_address.name,
        country: to_address.country,
        state: to_address.state,
        city: to_address.city,
        zip: to_address.zip,
        first_line: to_address.first_line,
        second_line: to_address.second_line || "",

        // Product information
        product_identifier: product.product_identifier,
        title: product.title,
      });
    });
  });

  return processedOrders;
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
}
