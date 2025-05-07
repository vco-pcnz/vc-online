import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * 导出表格数据为 Excel
 * @param {Array} data 表格数据数组
 * @param {Array} columns 表格列配置（Ant Design Vue 的 columns）
 * @param {String} filename 导出文件名（默认 'table'）
 */
export function exportTableToExcel(data, columns, filename = 'table') {
  // 提取列标题和数据 key（忽略没有 dataIndex 的列）
  const validColumns = columns.filter(col => col.dataIndex && col.title);
  const header = validColumns.map(col => col.title);
  const keys = validColumns.map(col => col.dataIndex);

  // 生成二维数组数据
  const excelData = data.map(row =>
    keys.map(key => row[key])
  );

  // 创建 worksheet 和 workbook
  const worksheet = XLSX.utils.aoa_to_sheet([header, ...excelData]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // 写入并保存文件
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${filename}.xlsx`);
}
