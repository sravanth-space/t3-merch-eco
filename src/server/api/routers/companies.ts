// src/server/api/routers/companies.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const companyRouter = createTRPCRouter({
    // Fetch all companies with their products
    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.company.findMany({
            include: { products: true },
        });
    }),

    // Add a new company with associated products
    addCompany: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                ethics: z.number(),
                price: z.number(),
                quality: z.number(),
                products: z.array(
                    z.object({
                        name: z.string(),
                        available: z.boolean(),
                    })
                ),
            })
        )
        .mutation(async ({ input, ctx }) => {
            return ctx.db.company.create({
                data: {
                    name: input.name,
                    ethics: input.ethics,
                    price: input.price,
                    quality: input.quality,
                    products: {
                        create: input.products,
                    },
                },
            });
        }),

    // Optional: Delete a company
    deleteCompany: protectedProcedure
        .input(z.object({ companyId: z.number() }))
        .mutation(async ({ input, ctx }) => {
            return ctx.db.company.delete({
                where: { id: input.companyId },
            });
        }),
});
