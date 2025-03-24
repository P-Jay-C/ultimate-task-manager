import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TaskService } from '../task.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [ButtonModule,NgFor],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  tasks: any[] = [];

  constructor() {}

  ngOnInit() {
    // this.taskService.getTasks().subscribe({
    //   next: (tasks) => (this.tasks = tasks),
    //   error: (err) => console.error('Error fetching tasks:', err),
    // });

    this.tasks = [
      { id: 1, title: 'Task 1', completed: false },
      { id: 2, title: 'Task 2', completed: false },
      { id: 3, title: 'Task 3', completed: false },
      { id: 4, title: 'Task 4', completed: false },
      { id: 5, title: 'Task 5', completed: false },
    ];
  }
}
