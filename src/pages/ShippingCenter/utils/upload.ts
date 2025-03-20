import { uniqueId } from "lodash";
import {
  ProductInfo,
  ProcessedOrder,
  Buyer,
  JsonData,
  MerchantNote,
} from "./interface";
import {v4} from 'uuid'

export function processJsonData(jsonData: JsonData, shopAbbr): ProcessedOrder[] {
  const processedOrders: ProcessedOrder[] = [];

  // Create a map of buyers by buyer_id for quick lookup
  const buyersMap = new Map<number, Buyer>();
  jsonData.buyers.forEach((buyer) => {
    buyersMap.set(buyer.buyer_id, buyer);
  });

  // Group orders by buyer_id, zip, first_line, and second_line
  const orderMap = new Map<
    string,
    {
      buyer_id: number;
      email: string;
      name: string;
      country: string;
      state: string;
      city: string;
      zip: string;
      first_line: string;
      second_line: string;
      order_id: string,
      order_date: string,
      is_gift_wrapped: boolean,
      gift_message: string,
      gift_buyer_first_name: string,
      products: ProductInfo[];
      merchant_notes: MerchantNote[];
      [key: string]: any;
    }
  >();

  // Process each order
  jsonData.orders.forEach((order) => {
    const buyer = buyersMap.get(order.buyer_id);

    if (!buyer) return;

    const { to_address } = order.fulfillment;

    // Create a unique key based on buyer_id, zip, first_line, and second_line
    const addressKey = `${order.buyer_id}_${to_address.zip || ""}_${
      to_address.first_line
    }_${to_address.second_line || ""}`;

    // Get or create the order entry
    let orderEntry = orderMap.get(addressKey);

    console.log(order, 'order')

    if (!orderEntry) {
      orderEntry = {
        buyer_id: buyer.buyer_id,
        email: buyer.email,
        name: to_address.name,
        country: to_address.country,
        state: to_address.state,
        city: to_address.city,
        zip: to_address.zip || "", // Use zip if it exists, otherwise empty string
        first_line: to_address.first_line,
        second_line: to_address.second_line || "",
        order_id: order.order_id,
        order_date: order.order_date,
        is_gift_wrapped: order.is_gift_wrapped,
        gift_message: order.gift_message,
        gift_buyer_first_name: order.gift_buyer_first_name,
        note_from_buyer: order?.notes?.note_from_buyer,
        products: [],
        merchant_notes: [],
      };
      
      orderMap.set(addressKey, orderEntry);
    }


    // Add merchant notes if they exist
    if (order.notes && order.notes.private_order_notes) {
      order.notes.private_order_notes.forEach((noteObj) => {
        if (noteObj.note) {
          // Check if this note already exists for this order
          const existingNoteIndex = orderEntry!.merchant_notes.findIndex(
            (n) => n.note === noteObj.note && n.order_id === order.order_id
          );

          if (existingNoteIndex === -1) {
            // Add new note with order_id
            orderEntry!.merchant_notes.push({
              note: noteObj.note,
              order_id: order.order_id,
            });
          }
        }
      });
    }

    // Add all products from this order
    order.transactions.forEach((transaction) => {
      const { product } = transaction;

      // Calculate quantity
      let quantity = transaction.quantity || 1;
      let personalisation = "";

      // Check if there's a "Quantity" property in variations
      if (transaction.variations) {
        const quantityVariation = transaction.variations.find(
          (v) => v.property === "Quantity"
        );

        if (quantityVariation) {
          // Multiply by transaction quantity
          const variationQuantity =
            Number.parseInt(quantityVariation.value, 10) || 1;
          quantity = quantity * variationQuantity;
        }
        // Check for Personalisation
        const personalisationVariation = transaction.variations.find(
          (v) => v.property === "Personalisation"
        );

        if (personalisationVariation) {
          personalisation = personalisationVariation.value || "";
          if (personalisation === "Not requested on this item.") {
            personalisation = ""
          }
        }
      }

      // Check if this product with the same transaction_id already exists
      const existingProductIndex = orderEntry!.products.findIndex(
        (p) =>
          p.transaction_id === transaction.transaction_id &&
          p.order_id === order.order_id
      );

      if (existingProductIndex >= 0) {
        // Product exists, update quantity
        orderEntry!.products[existingProductIndex].quantity += quantity;
      } else {
        // Add new product
        orderEntry!.products.push({
          product_identifier: product.product_identifier,
          title: product.title,
          quantity: quantity,
          personalisation: personalisation || undefined,
          transaction_id: transaction.transaction_id,
          order_id: order.order_id,
        });
      }
    });
  });

  // Convert the map to an array of processed orders
  orderMap.forEach((entry) => {
    processedOrders.push({
      buyer_id: entry.buyer_id,
      order_id: entry.order_id,
      order_date: entry.order_date,
      is_gift_wrapped: entry.is_gift_wrapped,
      gift_message: entry.gift_message,
      gift_buyer_first_name: entry.gift_buyer_first_name,
      note_from_buyer: entry.note_from_buyer,
      email: entry.email,
      name: entry.name,
      country: entry.country,
      state: entry.state,
      city: entry.city,
      zip: entry.zip,
      first_line: entry.first_line,
      second_line: entry.second_line,
      product_identifier: entry.products
        .map((p) => p.product_identifier)
        .join(", "),
      title: entry.products.map((p) => p.title).join(", "),
      products: entry.products,
      merchant_notes: entry.merchant_notes,
      __shopAbbr: shopAbbr,
      __uid: v4()
    });
  });

  return processedOrders;
}
