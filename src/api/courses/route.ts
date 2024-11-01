// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const courses = await prisma.course.findMany({
            where: {
                status: status as never || undefined,
            },
            skip,
            take: limit,
            include: {
                _count: {
                    select: {
                        enrollments: true,
                        applications: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const total = await prisma.course.count({
            where: {
                status: status as never || undefined,
            },
        });

        return NextResponse.json({
            courses,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching courses" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const data = await req.json();
        const course = await prisma.course.create({
            data: {
                title: data.title,
                description: data.description,
                duration: parseInt(data.duration),
                price: parseFloat(data.price),
                maxStudents: parseInt(data.maxStudents),
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                status: data.status || "DRAFT",
            },
        });

        return NextResponse.json(course, { status: 201 });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json(
            { error: "Error creating course" },
            { status: 500 }
        );
    }
}