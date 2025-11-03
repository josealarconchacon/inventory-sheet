import { formatSoldValue } from './calculations.js';

const generateSheetHtml = (sheet, totals) => {
  const safeSheet = sheet ?? {};
  const safeTotals = totals ?? {};

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Inventory Sheet - ${safeSheet.date ?? ''}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { text-align: center; margin-bottom: 30px; font-size: 18px; }
          .header { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #000; padding: 10px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .section-header { background-color: #e0e0e0; font-weight: bold; text-align: center; }
          .totals-col { text-align: right; font-weight: bold; }
          .highlight { background-color: #f5f8ff; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>BEGINNING + END OF DAY INVENTORY SHEET</h1>
        <div class="header">
          <strong>NAME:</strong> ${safeSheet.name ?? ''}<br>
          <strong>LOCATION + DATE:</strong> ${safeSheet.location ?? ''} - ${safeSheet.date ?? ''}
        </div>
        <table>
          <tr>
            <th colspan="2" class="section-header">AT THE START OF THE DAY:</th>
            <th class="totals-col">TOTALS:</th>
          </tr>
          <tr>
            <td colspan="2">Total amount of Lobster brought</td>
            <td class="totals-col">${safeSheet.startLobster ?? ''}</td>
          </tr>
          <tr>
            <td colspan="2">Total amount of Buns brought</td>
            <td class="totals-col">${safeSheet.startBuns ?? ''}</td>
          </tr>
          <tr>
            <td colspan="2">Total number of Oysters brought</td>
            <td class="totals-col">${safeSheet.startOysters ?? ''}</td>
          </tr>
          <tr>
            <td colspan="2">Total amount of Caviar brought</td>
            <td class="totals-col">${safeSheet.startCaviar ?? ''}</td>
          </tr>
          <tr>
            <td colspan="2">Total starting Cash (should be $200)</td>
            <td class="totals-col">$${safeSheet.startCash ?? ''}</td>
          </tr>
          <tr>
            <th colspan="2" class="section-header">AT THE END OF THE DAY:</th>
            <th></th>
          </tr>
          <tr>
            <td colspan="2">Total amount of Lobster leftover</td>
            <td class="totals-col">${safeSheet.endLobster ?? ''}</td>
          </tr>
          <tr>
            <td colspan="2">Total number of Buns leftover</td>
            <td class="totals-col">${safeSheet.endBuns ?? ''}</td>
          </tr>
          <tr>
            <td colspan="2">Total number of Oysters leftover</td>
            <td class="totals-col">${safeSheet.endOysters ?? ''}</td>
          </tr>
          <tr>
            <td colspan="2">Total amount of Caviar leftover</td>
            <td class="totals-col">${safeSheet.endCaviar ?? ''}</td>
          </tr>
          <tr>
            <td colspan="2">Total Cash (including starting cash)</td>
            <td class="totals-col">$${safeSheet.endCash ?? ''}</td>
          </tr>
          <tr>
            <th colspan="2" class="section-header">PRODUCT TOTALS:</th>
            <th></th>
          </tr>
          <tr class="highlight">
            <td colspan="2">Total Lobster sold (amount brought minus leftover)</td>
            <td class="totals-col">${formatSoldValue(safeTotals.lobster)}</td>
          </tr>
          <tr class="highlight">
            <td colspan="2">Total Rolls sold (amount brought minus leftover)</td>
            <td class="totals-col">${formatSoldValue(safeTotals.buns)}</td>
          </tr>
          <tr class="highlight">
            <td colspan="2">Total Oysters sold (amount brought minus leftover)</td>
            <td class="totals-col">${formatSoldValue(safeTotals.oysters)}</td>
          </tr>
        </table>
      </body>
      </html>
    `;
};

export const downloadSheetPdf = (sheet, totals) => {
  if (typeof window === 'undefined') {
    return;
  }

  const printWindow = window.open('', '_blank', 'noopener,noreferrer');

  if (!printWindow) {
    console.error('Unable to open print window for PDF export');
    return;
  }

  printWindow.document.write(generateSheetHtml(sheet, totals));
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
  }, 250);
};

