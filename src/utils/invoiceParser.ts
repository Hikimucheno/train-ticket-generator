/* 从 12306 电子发票 PDF 文本中提取车票字段（浏览器端 pdf.js 输出） */
import type { TicketData } from '@/types'

export interface ParseResult {
  ticket?: Partial<TicketData>
  warnings: string[]
  rawText: string
}

export function parse12306InvoiceText(raw: string): ParseResult {
  const warnings: string[] = []
  const t = raw
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()

  // 1) 站名：形如 "福州\n站" / "福安\n站"
  const stationMatches = [...t.matchAll(/([一-龥]{2,4})\s*\n\s*站/g)].map(m => m[1])
  let startStation = ''
  let endStation = ''
  if (stationMatches.length >= 2) {
    startStation = stationMatches[0]
    endStation = stationMatches[1]
  } else {
    warnings.push('未匹配到 出发/到达站')
  }

  // 2) 车次：独立一行的 字母+数字
  const trainMatch = t.match(/(?:^|\n)\s*([GDCKZYT]\d{1,5}[A-Z]?)\s*(?:\n|$)/)
  let trainNumber = ''
  if (trainMatch) trainNumber = trainMatch[1]
  else warnings.push('未匹配到 车次')

  // 3) 日期时间：乘车日期后面紧跟 HH:MM 开（排除「开票日期」）
  const dtMatch = t.match(
    /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日[\s\S]{0,60}?(\d{1,2}):(\d{2})\s*开/,
  )
  let date = ''
  let time = ''
  if (dtMatch) {
    date = `${dtMatch[1]}-${dtMatch[2].padStart(2, '0')}-${dtMatch[3].padStart(2, '0')}`
    time = `${dtMatch[4].padStart(2, '0')}:${dtMatch[5]}`
  } else {
    warnings.push('未匹配到 乘车日期/时间')
  }

  // 4) 车厢座位：08车02B号 / 加4车005号
  const seatMatch = t.match(/(加\s*\d+|\d+)\s*车\s*([0-9A-Za-z]+)\s*号/)
  let seatCarriage = ''
  let seatNumber = ''
  if (seatMatch) {
    seatCarriage = seatMatch[1].replace(/\s+/g, '')
    seatNumber = seatMatch[2]
  } else warnings.push('未匹配到 车厢/座位号')

  // 5) 席别
  let seatType = ''
  let seatTypeCustom = ''
  const newAC = t.match(/新空调\s*(硬座|硬卧|软卧|软座|二等座|一等座)/)
  if (newAC) {
    seatType = newAC[1]
    seatTypeCustom = `新空调${newAC[1]}`
  } else {
    const st = t.match(/(商务座|特等座|一等座|二等座|硬座|硬卧|软卧|软座|无座)/)
    if (st) seatType = st[1]
    else warnings.push('未匹配到 席别')
  }

  // 6) 价格：￥ 和数字可能分两行
  const priceMatch = t.match(/￥\s*\n?\s*(\d+(?:\.\d+)?)/)
  let price = 0
  if (priceMatch) price = parseFloat(priceMatch[1])
  else warnings.push('未匹配到 价格')

  // 7) 身份证（已脱敏）
  const idMatch = t.match(/(\d{6,}\*{2,}[0-9Xx*]{2,6})/)
  const passengerId = idMatch ? idMatch[1] : ''

  // 8) 姓名：身份证号后面那一段纯中文
  let passengerName = ''
  if (idMatch) {
    const after = t.slice(t.indexOf(idMatch[0]) + idMatch[0].length)
    const nameMatch = after.match(/([一-龥]{2,4})/)
    if (nameMatch) passengerName = nameMatch[1]
  }

  // 9) 电子客票号
  const ticketNoMatch = t.match(/电子客票号[:：]\s*(\d{10,32})/)
  const ticketId = ticketNoMatch ? ticketNoMatch[1] : ''

  return {
    warnings,
    rawText: t,
    ticket: {
      id: ticketId,
      ticketOffice: startStation,
      startStation,
      endStation,
      trainNumber,
      date,
      time,
      price,
      seatType,
      seatCarriage,
      seatNumber,
      passengerName,
      passengerId,
      seatTypeCustom,
      checkGate: '',
      identity: 'adult',
      isDiscount: false,
      payMethod: '',
    },
  }
}
