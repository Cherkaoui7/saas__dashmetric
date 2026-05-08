import { hash } from "bcryptjs"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { name, email, password } = body

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        })

        if (existingUser) {
            return NextResponse.json(
                {
                    error: "User already exists",
                },
                {
                    status: 400,
                }
            )
        }

        const hashedPassword = await hash(password, 10)
        const workspaceOwnerName =
            typeof name === "string" && name.trim().length > 0
                ? name.trim()
                : email.split("@")[0]

        const user = await prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            })

            const workspace = await tx.workspace.create({
                data: {
                    name: `${workspaceOwnerName}'s Workspace`,
                    ownerId: createdUser.id,
                },
            })

            await tx.subscription.create({
                data: {
                    workspaceId: workspace.id,
                    plan: "FREE",
                },
            })

            await tx.membership.create({
                data: {
                    userId: createdUser.id,
                    workspaceId: workspace.id,
                    role: "OWNER",
                },
            })

            return createdUser
        })

        const userWithoutPassword = {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }

        return NextResponse.json(userWithoutPassword)
    } catch {
        return NextResponse.json(
            {
                error: "Something went wrong",
            },
            {
                status: 500,
            }
        )
    }
}
