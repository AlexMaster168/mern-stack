/**
 * Прикладная ошибка с HTTP-статусом. Бросается из сервисов/контроллеров,
 * централизованно обрабатывается в errorHandler.
 */
export class ApiError extends Error {
  readonly statusCode: number
  readonly details?: unknown

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
    Error.captureStackTrace?.(this, ApiError)
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, details)
  }
  static unauthorized(message = 'Нет авторизации'): ApiError {
    return new ApiError(401, message)
  }
  static forbidden(message = 'Доступ запрещён'): ApiError {
    return new ApiError(403, message)
  }
  static notFound(message = 'Не найдено'): ApiError {
    return new ApiError(404, message)
  }
  static conflict(message: string): ApiError {
    return new ApiError(409, message)
  }
  static internal(message = 'Что-то пошло не так, попробуйте снова'): ApiError {
    return new ApiError(500, message)
  }
}
