import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getMe(user: User): User;
    editUser(userId: number, dto: EditUserDto): Promise<User>;
}
