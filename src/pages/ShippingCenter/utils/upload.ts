import { ProductInfo, ProcessedOrder, Buyer, JsonData } from "./interface";

export function processJsonData(jsonData: JsonData): ProcessedOrder[] {
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
      products: ProductInfo[];
      merchant_notes: string[];
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
        products: [],
        merchant_notes: [],
      };

      orderMap.set(addressKey, orderEntry);
    }

    // Add merchant notes if they exist
    if (order.notes && order.notes.private_order_notes) {
      order.notes.private_order_notes.forEach((noteObj) => {
        if (
          noteObj.note &&
          !orderEntry!.merchant_notes.includes(noteObj.note)
        ) {
          orderEntry!.merchant_notes.push(noteObj.note);
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
        }
      }

      // Check if this product is already in the list
      const existingProductIndex = orderEntry!.products.findIndex(
        (p) =>
          p.product_identifier === product.product_identifier &&
          p.title === product.title &&
          p.personalisation === personalisation
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
        });
      }
    });
  });

  // Convert the map to an array of processed orders
  orderMap.forEach((entry) => {
    processedOrders.push({
      buyer_id: entry.buyer_id,
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
    });
  });

  return processedOrders;
}
