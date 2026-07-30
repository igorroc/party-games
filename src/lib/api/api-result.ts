export type ApiSuccess<TData = null> = {
	success: true
	data: TData
}

export type ApiFailure<TError = ApiError> = {
	success: false
	error: TError
}

export type ApiError<TCode extends string = string> = {
	code: TCode
	message: string
}

export type ApiResultType<TData = null, TError = ApiError> = ApiSuccess<TData> | ApiFailure<TError>

export class ApiResult {
	static success<TData>(data: TData): ApiSuccess<TData> {
		return { success: true, data }
	}

	static failure<TError>(error: TError): ApiFailure<TError> {
		return { success: false, error }
	}
}

export class TypeGuard {
	static isSuccess<TData, TError>(
		result: ApiResultType<TData, TError>,
	): result is ApiSuccess<TData> {
		return result.success
	}

	static isFailure<TData, TError>(
		result: ApiResultType<TData, TError>,
	): result is ApiFailure<TError> {
		return !result.success
	}
}
