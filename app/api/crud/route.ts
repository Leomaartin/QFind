import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: NextRequest) {
    try {
        const { id } = await req.json();

        const service = await prisma.service.findUnique({
            where: {
                id: Number(id),
            },
        });

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
        const { id } = await req.json();

        const serviceId = Number(id);

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
        console.error(error);

        return NextResponse.json(
            { error: "Error interno" },
            { status: 500 }
        );
    }
}