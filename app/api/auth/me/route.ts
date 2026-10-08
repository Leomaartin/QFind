import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.nombre,
        email: user.email,
        picture: user.foto,
        admin: user.admin,
      },
    });
  } catch (error) {
    console.error("Auth me check error:", error);
    return NextResponse.json(
      { authenticated: false, user: null, error: "Internal error" },
      { status: 500 }
    );
  }
}
