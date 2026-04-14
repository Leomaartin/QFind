import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { google_id, nombre, email, foto } = await req.json();

    if (!google_id || !email) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const usuarioExistente = await prisma.user.findFirst({
      where: {
        OR: [{ google_id }, { email }],
      },
    });

    if (usuarioExistente) {
      return NextResponse.json({
        message: "Usuario ya registrado",
        user: usuarioExistente,
      });
    }

    const nuevoUsuario = await prisma.user.create({
      data: {
        google_id,
        nombre,
        email,
        foto,
      },
    });

    return NextResponse.json(
      {
        message: "Usuario creado",
        user: nuevoUsuario,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
