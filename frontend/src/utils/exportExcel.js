import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportTicketsToExcel(tickets, fileName = "tickets.xlsx") {
  // Convert tickets JSON -> worksheet
  const ws = XLSX.utils.json_to_sheet(
    tickets.map((t) => ({
      TicketID: t.id,
      UserEmail: t.userEmail,
      Category: t.category,
      Title: t.title,
      Description: t.description,
      Status: t.status,
      Remark: t.remark || "",
      CreatedAt: t.createdAt,
      UpdatedAt: t.updatedAt,
    }))
  );

  // Create workbook and append sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tickets");

  // Create file as array buffer
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  // Download
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, fileName);
}
