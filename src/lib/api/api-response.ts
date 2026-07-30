import { NextResponse } from "next/server"
import { ApiResult, type ApiError, type ApiFailure, type ApiSuccess } from "@/lib/api/api-result"

export class ApiResponse {
	static success(status?: number): NextResponse<ApiSuccess<null>>
	static success<TData>(data: TData, status?: number): NextResponse<ApiSuccess<TData>>
	static success<TData>(dataOrStatus?: TData | number, status = 200) {
		const isLegacyStatusCall = typeof dataOrStatus === "number" && arguments.length === 1
		const data = isLegacyStatusCall ? null : (dataOrStatus ?? null)
		const responseStatus = isLegacyStatusCall ? (dataOrStatus as number) : status

		return NextResponse.json(ApiResult.success(data), { status: responseStatus })
	}

	static error<TCode extends string>(
		code: TCode,
		message: string,
		status: number,
	): NextResponse<ApiFailure<ApiError<TCode>>>
	static error<TError extends ApiError>(
		error: TError,
		status: number,
	): NextResponse<ApiFailure<TError>>
	static error<TError extends ApiError>(
		errorOrCode: TError | string,
		messageOrStatus: string | number,
		status?: number,
	) {
		const error =
			typeof errorOrCode === "string"
				? { code: errorOrCode, message: messageOrStatus as string }
				: errorOrCode
		const responseStatus = typeof messageOrStatus === "number" ? messageOrStatus : status

		return NextResponse.json(ApiResult.failure(error), { status: responseStatus })
	}
}
