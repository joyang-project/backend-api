import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { convertTimeToSeconds } from '../common/utils';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()

export class AuthService {

  constructor(

    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,

  ) {}



  async validateUser(username: string, pass: string): Promise<any> {

    const user = await this.userService.findOne(username);

    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;

  }

  async login(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string; refreshToken: string }> {

    const user = await this.validateUser(authCredentialsDto.username, authCredentialsDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = uuidv4();
    const refreshTokenExpirationTime = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') || '7d';
    const expirationSeconds = convertTimeToSeconds(refreshTokenExpirationTime);

    await this.redisClient.set(`refreshToken:${refreshToken}`, user.id, 'EX', expirationSeconds);

    return {

      accessToken,
      refreshToken,

    };

  }



  async refreshTokens(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {

    const userId = await this.redisClient.get(`refreshToken:${oldRefreshToken}`);

    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.redisClient.del(`refreshToken:${oldRefreshToken}`);

    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = uuidv4();
    const refreshTokenExpirationTime = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') || '7d';
    const expirationSeconds = convertTimeToSeconds(refreshTokenExpirationTime);

    await this.redisClient.set(`refreshToken:${newRefreshToken}`, user.id, 'EX', expirationSeconds);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.redisClient.del(`refreshToken:${refreshToken}`);
  }
}
