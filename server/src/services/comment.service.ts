import { CommentModel, type CommentDocument } from '../models/Comment.js'
import { ApiError } from '../utils/ApiError.js'
import { isEnrolled } from './enrollment.service.js'
import type { CreateCommentInput } from '../validators/comment.validator.js'
import type { UserRole } from '../models/User.js'

export async function listComments(courseId: string): Promise<CommentDocument[]> {
  return await CommentModel.find({ course: courseId })
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
}

export async function addComment(
  userId: string,
  courseId: string,
  input: CreateCommentInput,
): Promise<CommentDocument> {
  // БИЗНЕС-ПРАВИЛО: комментировать курс может только записанный на него пользователь
  const enrolled = await isEnrolled(userId, courseId)
  if (!enrolled) {
    throw ApiError.forbidden('Комментировать курс могут только записанные на него пользователи')
  }
  return await CommentModel.create({
    user: userId,
    course: courseId,
    text: input.text,
    rating: input.rating,
  })
}

export async function deleteComment(
  commentId: string,
  userId: string,
  role: UserRole,
): Promise<void> {
  const comment = await CommentModel.findById(commentId)
  if (!comment) {
    throw ApiError.notFound('Комментарий не найден')
  }
  if (role !== 'admin' && comment.user.toString() !== userId) {
    throw ApiError.forbidden('Можно удалять только свои комментарии')
  }
  await comment.deleteOne()
}
