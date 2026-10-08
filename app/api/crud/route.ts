import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, verifyAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    const numericId = Number(id);
    if (!id || isNaN(numericId)) {
      return NextResponse.json(
        { error: "ID de servicio invlido" },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: {
        id: numericId,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = body;
    const serviceId = Number(id);

    if (!id || isNaN(serviceId)) {
      return NextResponse.json(
        { error: "ID de servicio invlido" },
        { status: 400 }
      );
    }

    // Verificar si el usuario es administrador o es el dueo del servicio
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    const isOwner = existingService.userId === sessionUser.id;
    const isAdmin = sessionUser.admin;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este servicio" },
        { status: 403 }
      );
    }

    await prisma.$transaction([
      prisma.plan.deleteMany({
        where: {
          serviceId,
        },
      }),
      prisma.service.delete({
        where: {
          id: serviceId,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Servicio eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    return NextResponse.json(
      { error: "Error interno al eliminar el servicio" },
      { status: 500 }
    );
  }
}
