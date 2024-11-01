import {NextResponse} from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const course = await prisma.course.findUnique({
            where: { id: params.courseId },
            include: {
                enrollments: {
                    include: { user: true },
                },
                applications: {
                    include: { user: true },
                },
            },
        });

        if (!course) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(course);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching course" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const data = await req.json();
        const course = await prisma.course.update({
            where: { id: params.courseId },
            data: {
                title: data.title,
                description: data.description,
                duration: parseInt(data.duration),
                price: parseFloat(data.price),
                maxStudents: parseInt(data.maxStudents),
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                status: data.status,
            },
        });

        return NextResponse.json(course);
    } catch (error) {
        return NextResponse.json(
            { error: "Error updating course" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await prisma.course.delete({
            where: { id: params.courseId },
        });

        return NextResponse.json({ message: "Course deleted" });
    } catch (error) {
        return NextResponse.json(
            { error: "Error deleting course" },
            { status: 500 }
        );
    }
}