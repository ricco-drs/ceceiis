import { Controller, Get, Sse, MessageEvent } from '@nestjs/common';
import { AppService } from './app.service';
import { interval, Observable, map } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // SSE Endpoint to stream election results in real-time
  @Sse('results/stream')
  streamResults(): Observable<MessageEvent> {
    // In a real scenario, this would be a Subject/EventEmitter triggered by Redis or a database update.
    // Here we simulate an update every 5 seconds.
    return interval(5000).pipe(
      map((_) => {
        // Mock data matching the frontend schema
        const data = {
          summary: {
            counted: 45,
            observed: 2,
            missing: 3,
            total: 50,
            percentage: 90.0 + Math.random() * 0.5, // Simulate slight changes
            lastUpdated: new Date().toISOString(),
          },
          results: [
            { id: "list-1", name: "Innovación Estudiantil", acronym: "IE", votes: 450 + Math.floor(Math.random() * 5), percentage: 45.0, color: "#2563EB" },
            { id: "list-2", name: "Frente Estudiantil Unidos", acronym: "FEU", votes: 320 + Math.floor(Math.random() * 5), percentage: 32.0, color: "#0F172A" },
            { id: "list-3", name: "Renovación FIIS", acronym: "REF", votes: 230 + Math.floor(Math.random() * 5), percentage: 23.0, color: "#0891B2" }
          ]
        };
        
        return {
          data: data,
        } as MessageEvent;
      }),
    );
  }
}
