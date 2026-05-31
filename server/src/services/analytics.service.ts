import { Types } from 'mongoose'
import { ClickEventModel } from '../models/ClickEvent.js'
import { requireLinkAccess } from './link.service.js'
import type { UserRole } from '../models/User.js'

export interface CountPoint {
  name: string
  value: number
}

export interface LinkStats {
  total: number
  byDay: CountPoint[]
  byReferer: CountPoint[]
  byDevice: CountPoint[]
  byBrowser: CountPoint[]
}

/** Группировка кликов по одному строковому полю (referer/device/browser), топ-N. */
function groupBy(linkId: Types.ObjectId, field: string, limit: number): Promise<CountPoint[]> {
  return ClickEventModel.aggregate<CountPoint>([
    { $match: { link: linkId } },
    { $group: { _id: `$${field}`, value: { $sum: 1 } } },
    { $sort: { value: -1 } },
    { $limit: limit },
    { $project: { _id: 0, name: { $ifNull: ['$_id', 'unknown'] }, value: 1 } },
  ])
}

export async function getLinkStats(
  linkId: string,
  userId: string,
  role: UserRole,
): Promise<LinkStats> {
  // Доступ — как к просмотру ссылки (viewer для команды / владелец для персональной)
  await requireLinkAccess(linkId, userId, role, 'viewer')

  const id = new Types.ObjectId(linkId)
  const [byDay, byReferer, byDevice, byBrowser, total] = await Promise.all([
    ClickEventModel.aggregate<CountPoint>([
      { $match: { link: id } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$ts' } }, value: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, name: '$_id', value: 1 } },
    ]),
    groupBy(id, 'referer', 8),
    groupBy(id, 'device', 8),
    groupBy(id, 'browser', 8),
    ClickEventModel.countDocuments({ link: id }),
  ])

  return { total, byDay, byReferer, byDevice, byBrowser }
}
