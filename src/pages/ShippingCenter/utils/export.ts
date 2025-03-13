import * as XLSX from "xlsx";
import { ProcessedOrder } from "./interface";

export function exportToExcel(worksheetData) {
  // const headers = [
  //   "订单号",
  //   "平台交易号",
  //   "交货仓",
  //   "产品名称",
  //   "收件人姓名",
  //   "收件人电话",
  //   "收件人邮箱",
  //   "收件人税号",
  //   "收件人公司",
  //   "收件人国家",
  //   "收件人省/州",
  //   "收件人城市",
  //   "收件人邮编",
  //   "收件人地址",
  //   "收件人门牌号",
  //   "销售平台",
  //   "发件人税号信息",
  //   "CSP",
  //   "包装尺寸【长】cm",
  //   "包装尺寸【宽】cm",
  //   "包装尺寸【高】cm",
  //   "收款到账日期",
  //   "币种类型",
  //   "是否含电",
  //   "拣货单信息",
  //   "IOSS税号",
  //   "中文品名1",
  //   "英文品名1",
  //   "单票数量1",
  //   "重量1(g)",
  //   "申报价值1",
  //   "商品材质1",
  //   "商品海关编码1",
  //   "商品链接1",
  //   "SKU1",
  // ];

  // const today = new Date();
  // const dateStr = formatDateForOrderNumber(today);
  // // Convert data to a worksheet
  // const worksheetData = [
  //   headers, // Header row
  //   ...data.map((item, index) => {
  //     const orderNumber = `YW${dateStr}${String(index + 1).padStart(2, "0")}`;

  //     // b. Set warehouse and determine product name based on country
  //     const warehouse = "杭州燕文";
  //     const countryInChinese = getCountryInChinese(item.country);
  //     const productName = getProductNameByCountry(item.country);

  //     // d. Generate random phone number
  //     const phoneNumber = generateRandomPhoneNumber();

  //     // k. Set sender tax information based on country
  //     const senderTaxInfo = getSenderTaxInfo(item.country);

  //     let pickingListInfo = item.products
  //       .map((p) => {
  //         let info = `${p.product_identifier} x ${p.quantity}`;
  //         if (p.personalisation) {
  //           info += ` [个性化: ${p.personalisation}]`;
  //         }
  //         return info;
  //       })
  //       .join("; ");

  //     if (item.option) {
  //       pickingListInfo += ` | 选项: ${item.option}`;
  //     }
  //     // Add merchant notes if they exist
  //     if (item.merchant_notes.length > 0) {
  //       pickingListInfo += ` | 商家备注: ${item.merchant_notes.join("; ")}`;
  //     }

  //     return [
  //       orderNumber, // 订单号
  //       "", // 平台交易号
  //       warehouse, // 交货仓
  //       productName, // 产品名称
  //       item.name, // 收件人姓名
  //       phoneNumber, // 收件人电话
  //       item.email, // 收件人邮箱
  //       "", // 收件人税号
  //       "", // 收件人公司
  //       countryInChinese, // 收件人国家
  //       item.state, // 收件人省/州
  //       item.city, // 收件人城市
  //       item.zip, // 收件人邮编
  //       item.first_line, // 收件人地址
  //       item.second_line, // 收件人门牌号
  //       "", // 销售平台
  //       senderTaxInfo, // 发件人税号信息
  //       "", // CSP
  //       "1", // 包装尺寸【长】cm
  //       "1", // 包装尺寸【宽】cm
  //       "1", // 包装尺寸【高】cm
  //       "", // 收款到账日期
  //       "美元", // 币种类型
  //       "否", // 是否含电
  //       pickingListInfo, // 拣货单信息
  //       "", // IOSS税号
  //       "", // 中文品名1
  //       "", // 英文品名1
  //       "", // 单票数量1
  //       "", // 重量1(g)
  //       "", // 申报价值1
  //       "", // 商品材质1
  //       "", // 商品海关编码1
  //       "", // 商品链接1
  //       item.product_identifier, // SKU1
  //     ];
  //   }),
  // ];

  // 创建表格
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // 优化设置列宽
  const range = XLSX.utils.decode_range(worksheet["!ref"]!);
  for (let col = range.s.c; col <= range.e.c; col++) {
    // Set column width (optional,可以根据需要调整宽度)
    const colWidth = 20; // 设置列宽为 20 字符
    worksheet["!cols"] = worksheet["!cols"] || [];
    worksheet["!cols"][col] = { wch: colWidth };

    // Set wrap text for all cells in this column
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      if (!cell) continue;

      // Ensure cell has a style object
      cell.s = cell.s || {};
      cell.s.alignment = cell.s.alignment || {};
      cell.s.alignment.wrapText = true; // Enable wrap text
    }
  }

  // Create a workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "订单数据");

  // Generate XLSX file
  const xlsxContent = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

  // Create a Blob with the XLSX data
  const blob = new Blob([xlsxContent], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `订单数据_${formatDate(new Date())}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getCountryInChinese(country: string): string {
  const countryMap: Record<string, string> = {
    "United States": "美国",
    "United Kingdom": "英国",
    France: "法国",
    Germany: "德国",
    // Add more countries as needed
  };

  return countryMap[country] || country;
}

function formatDateForOrderNumber(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

// Helper function to get product name based on country
function getProductNameByCountry(country: string): string {
  switch (country) {
    case "United States":
      return "燕文美国快线-普货";
    case "United Kingdom":
      return "燕文英国YODEL快线-普货";
    case "France":
      return "燕文法国快线-普货";
    case "Germany":
      return "燕文德国快线-普货";
    default:
      return "燕文国际快线-普货";
  }
}

function generateRandomPhoneNumber(): string {
  const part1 = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const part2 = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const part3 = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${part1}-${part2}-${part3}`;
}

// Helper function to get sender tax information based on country
function getSenderTaxInfo(country: string): string {
  switch (country) {
    case "United States":
      return "";
    case "Germany":
    case "France":
      return "IM3720000224";
    case "United Kingdom":
      return "370 6004 28";
    default:
      return "";
  }
}

// Helper function to format date for filename
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};
