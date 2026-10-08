import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  isEmailAdmin,
  verifyGoogleToken,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { google_id, nombre, email, foto, credential } = body;

    // Si el cliente enva el ID token de Google, lo verificamos criptogrficamente
    if (credential) {
      const googlePayload = await verifyGoogleToken(credential);
      if (googlePayload && googlePayload.email) {
        email = googlePayload.email;
        google_id = googlePayload.sub || googlePayload.email;
        nombre = googlePayload.name || nombre;
        foto = googlePayload.picture || foto;
      }
    }

    if (!google_id || !email) {
      return NextResponse.json(
        { error: "Datos incompletos para autenticacin" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const shouldBeAdmin = isEmailAdmin(cleanEmail);

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ google_id }, { email: cleanEmail }],
      },
    });

    if (user) {
      // Si el email es de admin y an no tiene admin=true en BD, lo actualizamos
      if (shouldBeAdmin && !user.admin) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { admin: true },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          google_id,
          nombre: nombre || cleanEmail.split("@")[0],
          email: cleanEmail,
          foto: foto || null,
          admin: shouldBeAdmin,
        },
      });
    }

    const finalIsAdmin = Boolean(user.admin || shouldBeAdmin);

    // Creamos el token de sesin firmado con jose (HS256)
    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.nombre,
      picture: user.foto,
      admin: finalIsAdmin,
    });

    // Guardamos la cookie de sesin HttpOnly (inaccesible desde JS / XSS / DevTools localStorage)
    const cookieStore = await cookies();
    cookieStore.set("qfind_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 das
    });

    return NextResponse.json({
      message: "Inicio de sesin exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        foto: user.foto,
        admin: finalIsAdmin,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error en el servidor durante la autenticacin" },
      { status: 500 }
    );
  }
}
