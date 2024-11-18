import jsPDF from "jspdf";
import { formatDate } from "date-fns";
import {
  AccountMonthlyReportResponse,
  AccountReportItem,
  AccountResponse,
  FundCommit,
  OfficeResult,
  OfficeWalletResponse,
  WalletTradingResponse,
} from "../client";
import autoTable, { Color, RowInput } from "jspdf-autotable";
import { getMoneyPrefix } from "../utils";

const logoBase64 =
  "data:image/png;base64,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";

export interface Receipt {
  amount: number;
  description: string;
  code: string;
  account: string;
  phone: string;
}
export interface ResultReport {
  result: OfficeResult[];
  office: string;
}

const renderDescription = (pdf: jsPDF, description: string, x: number, y: number) => {
  const text = description.split(" ");
  const maxLine = 7;
  let line = 0;
  let textLine = "";
  text.forEach((word) => {
    if (textLine.split(" ").length <= maxLine) {
      textLine += ` ${word}`;
    } else {
      pdf.text(textLine, x, y + line);
      line += 0.5;
      textLine = "";
    }
  });
  if (textLine) {
    pdf.text(textLine, x, y + line);
  }
};

export const generateReceipt = (item: Receipt) => {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "cm",
    format: [21.0, 14.8],
  });
  pdf.setProperties({
    title: "Receipt",
    subject: "Transaction Receipt",
  });
  pdf.addImage(logoBase64, "PNG", 0.5, 0.5, 0.8, 0.8);
  pdf.setFontSize(15);
  const startText = 0.7;
  pdf.setLineWidth(0.0001);
  pdf.line(0.5, 1.5, 20, 1.5);
  pdf.text("Date", startText, 2.2);
  //
  pdf.text(formatDate(new Date(), "MMM dd yyyy H:mm"), startText + 4, 2.2);
  pdf.text("VOUCHER NO", 12, 2.2);
  pdf.text(item.code, 16, 2.2);
  pdf.text("Account", startText, 3.2);
  pdf.text(item.account.toUpperCase(), startText + 4.3, 3.2);
  pdf.rect(startText + 4, 2.6, 6, 0.8);

  pdf.text("Description", startText, 4.2);
  pdf.rect(startText + 4, 3.6, 14, 2.4);

  // render description text
  renderDescription(pdf, item.description, startText + 4.3, 4.2);

  pdf.text("Amount (USD)", startText, 7);
  pdf.rect(startText + 4, 6.4, 6, 0.8);
  // format amount to 2 decimal places using Intl.NumberFormat
  pdf.text(
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.amount),
    startText + 4.3,
    7
  );

  pdf.text("Amount (AED)", startText, 8.5);
  pdf.rect(startText + 4, 7.9, 6, 0.8);
  pdf.text(
    new Intl.NumberFormat("en-US", { style: "currency", currency: "AED" }).format(item.amount * 3.67),
    startText + 4.3,
    8.5
  );

  pdf.text("MOBILE NO.", 10, 10);
  if (item.phone) {
    pdf.text(item.phone, 13.5, 10);
  }
  pdf.line(13.5, 10.2, 20, 10.2);
  pdf.text("AUTHORIZED ", startText, 11.5);
  pdf.line(startText + 4, 11.6, 9.6, 11.6);
  pdf.text("RECEIVER SIGN", 10, 11.5);
  pdf.line(14.2, 11.6, 20, 11.6);

  pdf.save(`${item.account}-${item.code}.pdf`);
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const generateOfficeResultsReport = (report: ResultReport) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "cm",
    // A4 size
    format: [21.0, 29.7],
  });

  const renderInTwoColumn = (pdf: jsPDF, data: string[], x: number, y: number, w: number) => {
    if (data.length !== 2) {
      return;
    }
    pdf.text(data[0], x, y);
    pdf.text(data[1], x + w, y);
  };
  const addSummary = (pdf: jsPDF, office: string, results: OfficeResult[], startY: number) => {
    const lineHeigth = 0.6;
    const columnStart = 1.5;
    const columnWidth = 4;
    const totalAmount = results.reduce((sum, row) => sum + row.amount, 0);

    renderInTwoColumn(pdf, ["Office: ", office], columnStart, startY, columnWidth);
    renderInTwoColumn(
      pdf,
      ["Total Amount: ", new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalAmount)],
      columnStart,
      startY + lineHeigth,
      columnWidth
    );

    // // group by result source
    const sourceMap = results.reduce((acc, row) => {
      if (!acc[row.result_source]) {
        acc[row.result_source] = 0;
      }
      acc[row.result_source] += row.amount;
      return acc;
    }, {} as Record<string, number>);
    const sourceKeys = Object.keys(sourceMap);
    sourceKeys.forEach((key, index) => {
      const lineStart = startY + lineHeigth * (index + 2);
      renderInTwoColumn(
        pdf,
        [
          capitalizeFirstLetter(key),
          new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(sourceMap[key]),
        ],
        columnStart,
        lineStart,
        columnWidth
      );
    });
    // return the current y position

    const currentY = startY + lineHeigth * (sourceKeys.length + 2);
    renderInTwoColumn(
      pdf,
      [
        "Period",
        `${formatDate(report.result[0].date, "MMM dd yy")} to ${formatDate(
          report.result[report.result.length - 1].date,
          "MMM dd yy"
        )}`,
      ],
      1.5,
      currentY,
      columnWidth
    );
    return currentY + lineHeigth;
  };
  // render this right after the previous code
  pdf.addImage(logoBase64, "PNG", 0.5, 0.5, 0.8, 0.8);
  // add genearated date at the top right corner
  // use a smaller font size
  pdf.setFontSize(10);
  // use italics
  pdf.text(formatDate(new Date(), "MMM dd yyyy H:mm"), 17, 1);
  // reset font size
  pdf.setFontSize(14);
  // add the title
  pdf.text("Office Results Report", 8, 2);
  // add the summary section at the left side
  pdf.setFontSize(11);
  addSummary(pdf, report.office, report.result, 3);
  // find the start and end date

  const tableData: RowInput[] = report.result.map((row) => [
    formatDate(new Date(row.date), "MMM dd"),
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(row.amount),
    row.code,
    capitalizeFirstLetter(row.result_source),
    capitalizeFirstLetter(row.result_type),
    capitalizeFirstLetter(row.state),
  ]);
  const tableHeaders = ["Date", "Amount", "Code", "Source", "Type", "State"];
  const totalAmount = report.result.reduce((sum, row) => sum + row.amount, 0);

  const formattedTotalAmount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    totalAmount
  );

  autoTable(pdf, {
    head: [tableHeaders],
    body: [...tableData],
    startY: 7,
    didParseCell: function (data) {
      if (data && data.column.index === 1 && data.cell.raw) {
        //@ts-ignore
        const amount = parseFloat(data.cell.raw.replace(/[^0-9.-]+/g, ""));
        if (amount < 0) {
          data.cell.styles.textColor = [255, 0, 0]; // Red color
        }
      }
    },
    foot: [["Total", formattedTotalAmount, "", "", ""]],
    footStyles: {
      fillColor: [211, 211, 211], // Light gray background for the footer
      textColor: [0, 0, 0], // Black text color
      fontStyle: "bold", // Bold font style
    },
  });

  pdf.save(`office_results_report_${formatDate(new Date(), "yyyy_MM_dd_H_mm")}.pdf`);
};

export const generateFundReport = ({ commits, fund }: { commits: FundCommit[]; fund: AccountResponse }) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "cm",
    // A4 size
    format: [21.0, 29.7],
  });

  pdf.addImage(logoBase64, "PNG", 0.5, 0.5, 0.8, 0.8);
  // add genearated date at the top right corner
  // use a smaller font size
  pdf.setFontSize(10);
  // use italics
  pdf.text(formatDate(new Date(), "MMM dd yyyy H:mm"), 17, 1);
  // reset font size
  pdf.setFontSize(14);
  // add the title
  pdf.text("Daily Fund Report", 8, 2);
  pdf.setFontSize(11);

  // show current balance
  pdf.text("Current Balance", 1.5, 3);
  pdf.text(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(fund.balance), 5, 3);
  pdf.text(new Intl.NumberFormat("en-US", { style: "currency", currency: "AED" }).format(fund.balance * 3.67), 5, 3.6);
  const formatedAmount = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const tableData: RowInput[] = commits.map((row) => [
    formatDate(new Date(row.date ?? ""), "dd H:mm"),
    row.is_out ? "-" : formatedAmount(row.variation),
    row.is_out ? formatedAmount(row.variation) : "-",
    formatedAmount(row.v_from),
    capitalizeFirstLetter(row.description),
  ]);
  const tableHeaders = ["Date", "In", "Out", "Balance", "Description"];

  autoTable(pdf, {
    head: [tableHeaders],
    body: [...tableData],
    startY: 4,
    foot: [
      [
        "Total",
        formatedAmount(commits.reduce((acc, row) => acc + (row?.is_out ? 0 : (row.variation as number)), 0)),
        formatedAmount(commits.reduce((acc, row) => acc + (row?.is_out ? (row.variation as number) : 0), 0)),
      ],
    ],
  });

  pdf.save(`fund_report_${formatDate(new Date(), "yyyy_MM_dd_H_mm")}.pdf`);
};

const getRowHeight = (description: string) => {
  const text = description.split(" ");
  const maxLine = 7;
  let line = 1;
  let textLine = "";
  text.forEach((word) => {
    if (textLine.split(" ").length <= maxLine) {
      textLine += ` ${word}`;
    } else {
      line += 1;
      textLine = "";
    }
  });
  return line;
};
export const genAgentReport = (report: AccountMonthlyReportResponse) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "cm",
    // A4 size
    format: [21.0, 29.7],
  });
  pdf.addImage(logoBase64, "PNG", 0.5, 0.5, 0.8, 0.8);
  pdf.setFontSize(10);
  pdf.text(formatDate(new Date(), "MMM dd yyyy H:mm"), 17, 1);
  pdf.setFontSize(14);
  pdf.text("Agent Monthly Report", 8, 2);
  pdf.setFontSize(11);
  pdf.text("Start Date", 1.5, 3);
  pdf.text(formatDate(new Date(report.start_date), "MMM dd yyyy"), 5, 3);
  pdf.text("End Date", 1.5, 3.6);
  pdf.text(formatDate(new Date(report.end_date), "MMM dd yyyy"), 5, 3.6);
  pdf.text("Account", 1.5, 4.2);
  pdf.text(report.account, 5, 4.2);
  pdf.text("Start Balance", 1.5, 4.8);
  pdf.text(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(report.start_balance), 5, 4.8);
  pdf.text("End Balance", 1.5, 5.4);
  pdf.text(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(report.end_balance), 5, 5.4);

  const reportData: AccountReportItem[] = report.reports;

  const headers = ["Date", "Code", "In", "Out", "Description"];
  const tableData: RowInput[] = reportData.map((item: AccountReportItem) => [
    {
      content: formatDate(item.created_at, "dd"),
      styles: { minCellHeight: getRowHeight(item.description) },
    },
    item.code,
    item.is_out ? "" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.amount),
    !item.is_out ? "" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.amount),
    item.description.length <= 3 ? "No Description" : item.description,
  ]);

  autoTable(pdf, {
    head: [headers],
    body: [...tableData],
    startY: 7,
    columnStyles: {
      0: { cellWidth: 1.1 },
      1: { cellWidth: 3.2 },
    },
  });

  pdf.save(`agent_${report.account}_${formatDate(report.start_date, "MM")}_.pdf`);
};

const getAmountInt = (item: WalletTradingResponse, type: "CRYPTO" | "USD" | "TRADING") => {
  switch (type) {
    case "CRYPTO": {
      return item.trading_crypto;
    }
    case "USD":
      switch (item.trading_type) {
        case "BUY":
          return item.amount * (item.trading_rate / item.daily_rate);
        case "EXCHANGE":
          return item.amount * (item.trading_rate / item.daily_rate);
        case "SELL":
          return item.amount / item.trading_rate;
      }
    case "TRADING":
      switch (item.trading_type) {
        case "BUY":
          return item.amount * item.trading_rate;
        case "EXCHANGE":
          return item.amount * Number(item.exchange_rate);
        case "SELL":
          return item.amount;
      }
    default:
      break;
  }
  return 0;
};

export const exportTradingData = (wallet: OfficeWalletResponse, data: WalletTradingResponse[]) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "cm",
    // A4 size
    format: [21.0, 29.7],
  });
  pdf.addImage(logoBase64, "PNG", 0.5, 0.5, 0.8, 0.8);
  pdf.setFontSize(10);
  pdf.text(formatDate(new Date(), "MMM dd yyyy H:mm"), 17, 1);
  pdf.setFontSize(14);
  pdf.text("Trading Report", 8, 2);
  pdf.setFontSize(11);

  // add wallet ID
  pdf.text("Wallet ID", 1.5, 3);
  pdf.text(wallet.walletID, 5, 3);
  // add wallet balance
  pdf.text("Balance", 1.5, 3.6);
  pdf.text(
    `${wallet.crypto_currency.toLocaleLowerCase()} ${new Intl.NumberFormat("en-US", { style: "decimal" }).format(
      wallet.crypto_balance
    )}`,
    5,
    3.6
  );
  pdf.text(
    `${wallet.trading_currency.toLocaleLowerCase()} ${new Intl.NumberFormat("en-US", { style: "decimal" }).format(
      wallet.trading_balance
    )}`,
    8,
    3.6
  );
  pdf.text(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(wallet.value), 11, 3.6);
  const headers = [
    "Date",
    "Type",
    `Amount ${wallet.crypto_currency.toLocaleLowerCase()}`,
    `Amount ${getMoneyPrefix("USD")}`,
    `Amount ${getMoneyPrefix(wallet.trading_currency)}`,
    "Agent",
    "Description",
  ];

  const getMessage = (item: WalletTradingResponse) => {
    const r = item.notes?.find((n) => n.type === item.trading_type);
    return r?.message || "No Description";
  };

  const getMap = (data: WalletTradingResponse[], selector: "USD" | "CRYPTO" | "TRADING") => {
    return data.reduce((acc, row) => {
      if (["BUY", "EXCHANGE"].includes(row.trading_type)) {
        // exchange can be in or out
        const key = row.trading_type === "EXCHANGE" && row.exchange_walletID !== wallet.walletID ? "out" : "in";

        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += getAmountInt(row, selector);
      } else {
        // selling are out
        if (!acc["out"]) {
          acc["out"] = 0;
        }
        acc["out"] += getAmountInt(row, selector);
      }
      return acc;
    }, {} as Record<string, number>);
  };

  const tableData: RowInput[] = data.map((item: WalletTradingResponse) => [
    formatDate(item.created_at, "dd"),
    capitalizeFirstLetter(item.trading_type.slice(0, 4)),
    new Intl.NumberFormat("en-US", { style: "decimal" }).format(getAmountInt(item, "CRYPTO")),
    new Intl.NumberFormat("en-US", { style: "decimal" }).format(getAmountInt(item, "USD")),
    new Intl.NumberFormat("en-US", { style: "decimal" }).format(getAmountInt(item, "TRADING")),
    item.account ?? item.exchange_walletID ?? "No Agent",
    `${item.code}/ ${getMessage(item)} `,
  ]);

  const usdGroup = getMap(data, "USD");
  const cryptoGroup = getMap(data, "CRYPTO");
  const tradingGroup = getMap(data, "TRADING");

  const headersGroup = [
    "Type",
    `Amount ${wallet.crypto_currency.toLocaleLowerCase()}`,
    `Amount ${getMoneyPrefix("USD")}`,
    `Amount ${getMoneyPrefix(wallet.trading_currency)}`,
  ];
  // add title summary
  pdf.setFontSize(14);
  pdf.text("Summary", 1.5, 4.5);
  pdf.setFontSize(11);

  autoTable(pdf, {
    head: [headersGroup],
    body: [
      [
        "Buy/Exch",
        new Intl.NumberFormat("en-US", { style: "decimal" }).format(cryptoGroup["in"]),
        new Intl.NumberFormat("en-US", { style: "decimal" }).format(usdGroup["in"]),
        new Intl.NumberFormat("en-US", { style: "decimal" }).format(tradingGroup["in"]),
      ],
      [
        "Sell",
        new Intl.NumberFormat("en-US", { style: "decimal" }).format(cryptoGroup["out"]),
        new Intl.NumberFormat("en-US", { style: "decimal" }).format(usdGroup["out"]),
        new Intl.NumberFormat("en-US", { style: "decimal" }).format(tradingGroup["out"]),
      ],
    ],
    foot: [
      [
        "Difference",
        new Intl.NumberFormat("en-US", { style: "decimal" }).format(cryptoGroup["in"] - cryptoGroup["out"]),
        new Intl.NumberFormat("en-US", { style: "decimal" }).format(usdGroup["in"] - usdGroup["out"]),
        new Intl.NumberFormat("en-US", { style: "decimal" }).format(tradingGroup["in"] - tradingGroup["out"]),
      ],
    ],
    startY: 5,
  });
  // add title
  pdf.setFontSize(14);
  pdf.text("Tradings", 1.5, 9);
  pdf.setFontSize(12);

  autoTable(pdf, {
    head: [headers],
    body: [...tableData],
    startY: 9.4,
    columnStyles: {
      0: { cellWidth: 1.1 },
      1: { cellWidth: 1.4 },
    },
    didParseCell: function (data) {
      if (data && data.column.index === 1 && data.cell.raw) {
        const type = data.cell.raw as string;
        const white = [255, 255, 255];
        const blue = [0, 0, 255];
        const lightRed = [255, 50, 50];
        const purple = [255, 0, 155];
        const colors = new Map<string, number[]>([
          ["Sell", purple],
          ["Exch", blue],
          ["Buy", lightRed],
        ]);

        data.cell.styles.textColor = (colors.get(type) || white) as Color;
      }
    },
    foot: [headers],
  });

  // group by trading_type BUY AND EXCHANGE IN goes in the same group the "IN" group
  // group by trading_type SELL goes in the "OUT" group
  // use a map to group the data

  pdf.save(`trading_${formatDate(new Date(), "MM")}.pdf`);
};
