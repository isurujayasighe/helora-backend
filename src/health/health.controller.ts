import { Controller, Get, Version } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Version('1')
  @Get()
  check() {
    return {
      success: true,
      message: 'Helora backend is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
