import * as XLSX from "xlsx";
import { ProcessedOrder } from "./interface";

export function exportToExcel(worksheetData) {
  console.log(worksheetData, 'worksheetData')

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

// Helper function to format date for filename
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};
