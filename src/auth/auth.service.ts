import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    try {
      const hash = await argon.hash(dto.password);
      const savedUser =
        await this.prisma.user.create({
          data: {
            email: dto.email,
            hash,
          },
        });
      return savedUser;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentils taken',
          );
        }
      }
      throw error;
    }
  }
  async signin(dto: AuthDto) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
    if (!user) {
      throw new ForbiddenException(
        'Incorrect Credentils',
      );
    }
    const matchPassword = await argon.verify(
      user.hash,
      dto.password,
    );
    if (!matchPassword) {
      throw new ForbiddenException(
        'Incorrect Credentils',
      );
    }
    return this.siginToken(user.id, user.email);
  }
  async siginToken(
    userId: number,
    userEmail: string,
  ): Promise<{
    access_token: string;
  }> {
    const payload = {
      sub: userId,
      email: userEmail,
    };
    const token: string =
      await this.jwt.signAsync(payload, {
        expiresIn: '30m',
        secret: this.config.get('JWT_SECRET'),
      });
    return {
      access_token: token,
    };
  }
}
