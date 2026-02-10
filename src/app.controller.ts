import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHealth() {
        return {
            service: 'Energy Ingestion Engine',
            status: 'OK',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
        };
    }
}
