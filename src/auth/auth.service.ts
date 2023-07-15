import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "prisma/prisma-client"
import { AuthDto } from "./dto";
import * as argon from 'argon2';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

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

            delete user.hash;
            return user;
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

        delete user.hash
        return user;
    }
}