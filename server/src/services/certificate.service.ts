import { customAlphabet } from 'nanoid'
import { CertificateModel, type CertificateDocument } from '../models/Certificate.js'
import { EnrollmentModel } from '../models/Enrollment.js'
import { ApiError } from '../utils/ApiError.js'

// Без похожих символов (без 0/O, 1/I/L) — удобно диктовать/набирать
const genCertId = customAlphabet('0123456789ABCDEFGHJKMNPQRSTUVWXYZ', 10)

export async function issueCertificate(
  userId: string,
  courseId: string,
): Promise<CertificateDocument> {
  const enrollment = await EnrollmentModel.findOne({ user: userId, course: courseId })
  if (!enrollment) {
    throw ApiError.forbidden('Вы не записаны на этот курс')
  }
  if (enrollment.status !== 'completed') {
    throw ApiError.badRequest('Курс ещё не завершён — пройдите все уроки')
  }

  const existing = await CertificateModel.findOne({ user: userId, course: courseId })
  if (existing) {
    return existing
  }

  return await CertificateModel.create({ user: userId, course: courseId, certificateId: genCertId() })
}

export async function getMyCertificates(userId: string): Promise<CertificateDocument[]> {
  return await CertificateModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('course', 'title slug')
}

/** Публичная верификация — по человекочитаемому certificateId. */
export async function verifyCertificate(certificateId: string): Promise<CertificateDocument> {
  const cert = await CertificateModel.findOne({ certificateId })
    .populate('course', 'title')
    .populate('user', 'name email')
  if (!cert) {
    throw ApiError.notFound('Сертификат не найден')
  }
  return cert
}
