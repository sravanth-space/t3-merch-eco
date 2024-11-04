// src/server/api/routers/products.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
    // Fetch all products for a specific company
    getByCompanyId: publicProcedure
        .input(z.object({ companyId: z.number() }))
        .query(async ({ input, ctx }) => {
            return ctx.db.product.findMany({
                where: { companyId: input.companyId },
            });
        }),

    // Add a new product to a company
    addProduct: protectedProcedure
        .input(
            z.object({
                companyId: z.number(),
                name: z.string(),
                available: z.boolean(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            return ctx.db.product.create({
                data: {
                    name: input.name,
                    available: input.available,
                    companyId: input.companyId,
                },
            });
        }),

    // Optional: Update product details
    updateProduct: protectedProcedure
        .input(
            z.object({
                productId: z.number(),
                name: z.string().optional(),
                available: z.boolean().optional(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            return ctx.db.product.update({
                where: { id: input.productId },
                data: {
                    name: input.name,
                    available: input.available,
                },
            });
        }),

    // Optional: Delete a product
    deleteProduct: protectedProcedure
        .input(z.object({ productId: z.number() }))
        .mutation(async ({ input, ctx }) => {
            return ctx.db.product.delete({
                where: { id: input.productId },
            });
        }),
});
