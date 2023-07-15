import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthController {
    authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    @Post('signup')
    signup(@Body() dto: AuthDto) {
        console.log(dto);
        return this.authService.signup(dto);
    }

    @HttpCode(200)
    @Post('signin')
    signin(@Body() dto: AuthDto) {
        return this.authService.signin(dto);
    }
}