import { z } from 'zod';
import { Types } from 'mongoose';
import { RoleScope } from './role.model';

const objectIdRefinement = (val: string) => Types.ObjectId.isValid(val);

export const createRoleBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Tên vai trò phải có ít nhất 2 ký tự')
    .max(100, 'Tên vai trò không vượt quá 100 ký tự'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug không hợp lệ (chỉ chứa chữ cái thường, số và dấu gạch ngang)')
    .optional(),
  description: z.string().max(500, 'Mô tả không vượt quá 500 ký tự').optional(),
  scope: z
    .nativeEnum(RoleScope, { message: 'Scope phải là SYSTEM hoặc STORE' })
    .optional()
    .default(RoleScope.SYSTEM),
  permissions: z
    .array(
      z.string().refine(objectIdRefinement, {
        message: 'Permission ID không đúng định dạng ObjectId',
      })
    )
    .optional()
    .default([]),
  isSystem: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const updateRoleBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Tên vai trò phải có ít nhất 2 ký tự')
    .max(100, 'Tên vai trò không vượt quá 100 ký tự')
    .optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug không hợp lệ')
    .optional(),
  description: z.string().max(500, 'Mô tả không vượt quá 500 ký tự').optional(),
  scope: z
    .nativeEnum(RoleScope, { message: 'Scope phải là SYSTEM hoặc STORE' })
    .optional(),
  permissions: z
    .array(
      z.string().refine(objectIdRefinement, {
        message: 'Permission ID không đúng định dạng ObjectId',
      })
    )
    .optional(),
  isActive: z.boolean().optional(),
});

export const createRoleSchema = z.object({
  body: createRoleBodySchema,
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().refine(objectIdRefinement, {
      message: 'ID vai trò không hợp lệ',
    }),
  }),
  body: updateRoleBodySchema,
});

export const getRoleByIdSchema = z.object({
  params: z.object({
    id: z.string().refine(objectIdRefinement, {
      message: 'ID vai trò không hợp lệ',
    }),
  }),
});

export type CreateRoleDto = z.infer<typeof createRoleBodySchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleBodySchema>;
