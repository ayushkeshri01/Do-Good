import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Do-Good",
    description: "Community social work platform for your organization",
    version: "1.0.0",
  });
}
