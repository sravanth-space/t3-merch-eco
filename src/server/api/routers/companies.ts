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
            const normalizedName = input.name.trim().toLowerCase();
            return ctx.db.company.upsert({
                where: { name: normalizedName },
                update: {
                    ethics: input.ethics,
                    price: input.price,
                    quality: input.quality,
                    products: {
                        deleteMany: {}, // Clear previous products
                        create: input.products,
                    },
                    lastUpdated: new Date(),
                },
                create: {
                    name: normalizedName,
                    ethics: input.ethics,
                    price: input.price,
                    quality: input.quality,
                    products: {
                        create: input.products,
                    },
                    createdAt: new Date(),
                    lastUpdated: new Date(),
                },
            });
        }),

    // Delete a company
    deleteCompany: protectedProcedure
        .input(z.object({ companyId: z.number() }))
        .mutation(async ({ input, ctx }) => {
            return ctx.db.company.delete({
                where: { id: input.companyId },
            });
        }),

    // Upload data with normalization and update handling
    uploadData: protectedProcedure
        .input(
            z.array(
                z.object({
                    name: z.string(),
                    ethics: z.number().nullable(),
                    price: z.number().nullable(),
                    quality: z.number().nullable(),
                    products: z.array(
                        z.object({
                            name: z.string(),
                            available: z.boolean(),
                        })
                    ),
                })
            )
        )
        .mutation(async ({ ctx, input }) => {
            for (const companyData of input) {
                const normalizedName = companyData.name.trim().toLowerCase();

                // Find or create company based on normalized name
                const existingCompany = await ctx.db.company.findUnique({
                    where: { name: normalizedName },
                    include: { products: true },
                });

                if (existingCompany) {
                    // Update existing company
                    await ctx.db.company.update({
                        where: { id: existingCompany.id },
                        data: {
                            ethics: companyData.ethics ?? existingCompany.ethics,
                            price: companyData.price ?? existingCompany.price,
                            quality: companyData.quality ?? existingCompany.quality,
                            lastUpdated: new Date(),
                        },
                    });

                    // Update existing products or add new ones
                    for (const product of companyData.products) {
                        const existingProduct = existingCompany.products.find(
                            (p) => p.name.trim().toLowerCase() === product.name.trim().toLowerCase()
                        );

                        if (existingProduct) {
                            if (existingProduct.available !== product.available) {
                                await ctx.db.product.update({
                                    where: { id: existingProduct.id },
                                    data: { available: product.available },
                                });
                            }
                        } else {
                            await ctx.db.product.create({
                                data: {
                                    name: product.name.trim(),
                                    available: product.available,
                                    companyId: existingCompany.id,
                                },
                            });
                        }
                    }
                } else {
                    // Insert new company with products
                    await ctx.db.company.create({
                        data: {
                            name: normalizedName,
                            ethics: companyData.ethics,
                            price: companyData.price,
                            quality: companyData.quality,
                            products: {
                                create: companyData.products.map((product) => ({
                                    name: product.name.trim(),
                                    available: product.available,
                                })),
                            },
                            createdAt: new Date(),
                            lastUpdated: new Date(),
                        },
                    });
                }
            }
        }),
});
