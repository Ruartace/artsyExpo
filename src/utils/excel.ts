import * as XLSX from 'xlsx'

export async function parseExcelFile(file: File): Promise<Record<string, unknown>[]> {
	const data = await file.arrayBuffer()
	const workbook = XLSX.read(data, { type: 'array' })
	const sheetName = workbook.SheetNames[0]
	if (!sheetName) {
		throw new Error('Excel文件中没有找到工作表')
	}
	const sheet = workbook.Sheets[sheetName]
	if (!sheet) {
		throw new Error('无法读取工作表内容')
	}
	return XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[]
}

export function downloadExcelTemplate(headers: string[], filename: string) {
	const ws = XLSX.utils.aoa_to_sheet([headers])
	const wb = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(wb, ws, 'template')
	XLSX.writeFile(wb, filename)
}


