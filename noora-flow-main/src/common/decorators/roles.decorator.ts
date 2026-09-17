import { SetMetadata } from '@nestjs/common';

// 'roles' is the metadata key, and we pass roles as a value
export const Roles = (roles: string[]) => SetMetadata('roles', roles);
