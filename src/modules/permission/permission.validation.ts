import { z } from 'zod';
import { PermissionModule } from '../../constants/permissions';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const permissionIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const permissionModuleParamSchema = z.object({
  params: z.object({
    module: z.nativeEnum(PermissionModule, {
      message: 'Invalid permission module',
    }),
  }),
});

export const updatePermissionSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type UpdatePermissionDto = z.infer<typeof updatePermissionSchema>['body'];

