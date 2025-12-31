import { NextResponse } from "next/server";
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const json = <T>(data: T, init?: ResponseInit) => NextResponse.json(data, init);

export const handleError = (error: unknown) => {
  if (error instanceof ApiError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
};

export const assert = (condition: unknown, status: number, message: string) => {
  if (!condition) {
    throw new ApiError(status, message);
  }
};
