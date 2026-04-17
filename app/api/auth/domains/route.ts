import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.appSettings.findFirst();
    return NextResponse.json({ domains: settings?.allowedDomains || [] });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
