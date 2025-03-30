import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-analytics',
  imports: [ChartModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit {
  chartData: any;
  chartOptions: any;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.taskService.getTasks().subscribe((response) => {
      const tasks = response?.data?.content ?? []; // TODO: Handle error
      const statusCounts = {
        PENDING: tasks.filter(t => t.status === 'PENDING').length,
        IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length,
        ARCHIVED: tasks.filter(t => t.status === 'ARCHIVED').length,
      };
      this.chartData = {
        labels: Object.keys(statusCounts),
        datasets: [{ label: 'Tasks', data: Object.values(statusCounts), backgroundColor: '#4b5563' }],
      };
      this.chartOptions = { responsive: true };
    });
  }
}
