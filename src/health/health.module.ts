import { Module, Global } from '@nestjs/common';
import { HealthController } from './health.controller';

@Global()
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
