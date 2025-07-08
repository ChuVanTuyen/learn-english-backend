import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    
    constructor(
        private jwtService: JwtService,
        private userService: UserService
    ) {}

    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto;
        try {
            const existingUser = await this.userService.findOneByEmail(email);
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
            const newUser = await this.userService.create(email, password, name ? name : email.split('@')[0]);
            return {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                avatar: newUser.avatar,
                created_at: newUser.created_at,
                updated_at: newUser.updated_at
            }
        } catch (error) {
            throw new InternalServerErrorException('Failed to register');
        }
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.findOneByEmail(email);
        if(!user || !(await bcrypt.compare(pass, user.password))) {
            return null;
        }
        return user;
    }

    async login(user: User) {
        const payload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(payload);
        return { 
            id: user.id,
            accessToken: 'Bearer ' + accessToken, 
            email: user.email,
            name: user.name,
            avartar: user.avatar,
            created_at: user.created_at,
            updated_at: user.updated_at
        };
    }
}
