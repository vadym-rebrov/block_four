import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async get(): Promise<{ passed: boolean }> {
    const { readyState } = this.connection;
    return { passed: readyState === 1 };
  }

  @Get('ping')
  @HttpCode(HttpStatus.OK)
  async pong(): Promise<string> {
    return 'PONG';
  }
}
