import { NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  meta?: { total: number; page: number; limit: number },
  status = 200
) {
  return NextResponse.json({ success: true, data, meta }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: unknown
) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status }
  );
}

export function notFound(entity = "Resource") {
  return errorResponse("NOT_FOUND", `${entity} not found`, 404);
}

export function validationError(message: string, details?: unknown) {
  return errorResponse("VALIDATION_ERROR", message, 400, details);
}

export function serverError(error: unknown) {
  console.error("Server error:", error);
  return errorResponse(
    "INTERNAL_SERVER_ERROR",
    "An unexpected error occurred",
    500
  );
}
