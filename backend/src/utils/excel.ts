import * as XLSX from 'xlsx';

export const parseExcelFile = (buffer: Buffer): any[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });
  return data;
};

export const daysBetweenDates = (startDate: Date, endDate: Date): number => {
  const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
};

export const datesOverlap = (startDate: Date, endDate: Date, reportStartDate: Date, reportEndDate: Date): boolean => {
  return startDate <= reportEndDate && endDate >= reportStartDate;
};