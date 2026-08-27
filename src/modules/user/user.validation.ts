import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ObjectId không hợp lệ');

export const updateUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').optional(),
    phone: z.string().regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ').optional().or(z.literal('')),
    avatar: z.string().url('URL avatar không hợp lệ').optional().or(z.literal('')),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      oldPassword: z.string().min(1, 'Mật khẩu cũ không được để trống'),
      newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
      confirmPassword: z.string().min(1, 'Xác nhận mật khẩu mới không được để trống'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Mật khẩu xác nhận không khớp với mật khẩu mới',
      path: ['confirmPassword'],
    }),
});

export const assignRoleSchema = z.object({
  body: z.object({
    role_id: objectIdSchema,
  }),
});

export const permissionOverrideSchema = z.object({
  body: z.object({
    permission_id: objectIdSchema,
    effect: z.enum(['ALLOW', 'DENY']),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const changeRole = z.object({
  role_id: objectIdSchema,
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>['body'];
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>['body'];
export type AssignRoleDto = z.infer<typeof assignRoleSchema>['body'];
export type PermissionOverrideDto = z.infer<typeof permissionOverrideSchema>['body'];
