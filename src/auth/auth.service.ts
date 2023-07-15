import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "prisma/prisma-client"
import { JwtService } from "@nestjs/jwt/dist";
import { ConfigService } from "@nestjs/config"
import { AuthDto } from "./dto";
import * as argon from 'argon2';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) { }

    async signup(dto: AuthDto) {
        try {
            const hash = await argon.hash(dto.password);
            delete dto.password;
            const user = await this.prisma.user.create({
                data: {
                    ...dto,
                    hash,
                }
            })

            const access_token = await this.signToken(user.id, user.email);
            return { access_token };
        } catch (e) {
            console.log(e instanceof Prisma.PrismaClientKnownRequestError)
            // console.log(e)
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === "P2002") {
                    throw new ForbiddenException('this credential was taken');
                }
            }
        }
    }

    async signin(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            }
        })

        if (!user) {
            throw new ForbiddenException('credential incorrect');
        }

        const isPwMatch = await argon.verify(user.hash, dto.password);
        if (!isPwMatch) {
            throw new ForbiddenException('credential incorrect');
        }

        const access_token = await this.signToken(user.id, user.email);
        return { access_token };
    }

    signToken(userId: number, email: string): Promise<string> {
        const data = {
            sub: userId,
            email,
        }

        return this.jwt.signAsync(data, {
            expiresIn: '30m',
            secret: this.config.get('JWT_SECRET'),
        });
    }
}