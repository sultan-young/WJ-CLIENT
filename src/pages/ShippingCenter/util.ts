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

// Helper function to escape CSV values
const escapeCsvValue = (value: string) => {
  // If the value contains commas, quotes, or newlines, wrap it in quotes
  if (
    value &&
    (value.includes(",") || value.includes('"') || value.includes("\n"))
  ) {
    // Replace any quotes with double quotes
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export function exportToExcel(data: ProcessedOrder[]) {
  // Create a CSV string from the data
  const headers = [
    "买家ID",
    "姓名",
    "邮箱",
    "国家",
    "州",
    "城市",
    "邮编",
    "具体地址",
    "门牌号",
    "SKU编号",
    "产品标题",
  ];

  const csvRows = [
    headers.join(","), // Header row
    ...data.map((item) =>
      [
        item.buyer_id,
        escapeCsvValue(item.name),
        escapeCsvValue(item.email),
        escapeCsvValue(item.country),
        escapeCsvValue(item.state),
        escapeCsvValue(item.city),
        escapeCsvValue(item.zip),
        escapeCsvValue(item.first_line),
        escapeCsvValue(item.second_line),
        escapeCsvValue(item.product_identifier),
        escapeCsvValue(item.title),
      ].join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");

  // Create a Blob with the CSV data
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `订单数据_${formatDate(new Date())}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper function to format date for filename
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

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
