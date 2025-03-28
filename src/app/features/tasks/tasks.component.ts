import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PagedTaskResponse, Task } from '../../core/models/task';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { SuccessResponse } from '../../core/models/success-response';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { AddTaskComponent } from './add-task/add-task.component';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ButtonModule, DatePipe, NgClass, AutoCompleteModule],
  providers: [DialogService],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = false;
  page = 0;
  pageSize = 10;
  totalTasks = 0;
  totalPages = 0;
  categoryFilter: string | undefined;
  completedFilter: boolean | undefined;
  searchQuery: string | undefined;
  sortOption: string = 'dueDate';
  sortDir: 'asc' | 'desc' = 'asc';
  categories: string[] = [];
  filteredCategories: string[] = [];

  isDarkMode = localStorage.getItem('theme') === 'dark';
  private searchFilterSubject = new Subject<string>();
  private categoryFilterSubject = new Subject<string>();

  constructor(
    private taskService: TaskService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadTasks();

    this.searchFilterSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.applyFilters(true, 'search');
      });

    this.categoryFilterSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.applyFilters(true, 'category');
      });
  }


  loadTasks(): void {
    this.loading = true;
    this.taskService
      .getTasks(
        this.page,
        this.pageSize,
        this.categoryFilter,
        this.completedFilter,
        this.searchQuery,
        this.sortOption,
        this.sortDir
      )
      .subscribe({
        next: (response: SuccessResponse<PagedTaskResponse>) => {
          this.tasks = response?.data?.content ?? [];
          this.filteredTasks = [...this.tasks];
          this.page = response?.data?.page ?? 0;
          this.pageSize = response?.data?.size ?? 10;
          this.totalTasks = response?.data?.totalElements ?? 0;
          this.totalPages = response?.data?.totalPages ?? 0;
          this.updateCategories();
          this.applyLocalFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load tasks:', err);
          this.loading = false;
        },
      });
  }

  updateCategories(): void {
    const categorySet = new Set<string>();
    this.tasks.forEach((task) => {
      if (task.category) categorySet.add(task.category);
    });
    this.categories = Array.from(categorySet).sort();
  }

  filterCategories(event: { query: string }): void {
    const query = event.query.toLowerCase();
    this.filteredCategories = this.categories.filter((category) =>
      category.toLowerCase().includes(query)
    );
  }

  openAddTaskDialog(task?: Task): void {
    const ref = this.dialogService.open(AddTaskComponent, {
      header: task ? 'Edit Task' : 'Add Task',
      width: '40rem',
      data: { task },
    });

    ref.onClose.subscribe((result: Task) => {
      if (result) {
        if (task) {
          const index = this.tasks.findIndex((t) => t.id === result.id);
          if (index !== -1) {
            this.tasks[index] = result;
            this.filteredTasks[index] = result;
          }
        } else {
          this.tasks.push(result);
          this.filteredTasks.push(result);
        }
        this.updateCategories();
      }
    });
  }

  toggleTaskCompletion(task: Task): void {
    const updatedTask = {
      ...task,
      completed: !task.completed,
      status: task.completed ? 'PENDING' as 'PENDING' | 'COMPLETED' | 'IN_PROGRESS' | 'ARCHIVED' : 'COMPLETED' as 'PENDING' | 'COMPLETED' | 'IN_PROGRESS' | 'ARCHIVED',
      progress: task.completed ? 0 : 100,
    };
    this.taskService.updateTask(task.id, updatedTask).subscribe({
      next: (response) => {
        const index = this.tasks.findIndex((t) => t.id === task.id);
        if (index !== -1 && response.data) {
          this.tasks[index] = response.data;
          this.filteredTasks[index] = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to update task completion:', err);
      },
    });
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.loading = true;
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (err) => {
          console.error('Failed to delete task:', err);
          this.loading = false;
        },
      });
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadTasks();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadTasks();
    }
  }

  applyFilters(isLocal: boolean = false, filterType: 'search' | 'category' | 'all' = 'all'): void {
    if (isLocal) {
      this.applyLocalFilters(filterType);
    } else {
      this.page = 0;
      this.loadTasks();
    }
  }

  applyLocalFilters(filterType: 'search' | 'category' | 'all' = 'all'): void {
    this.filteredTasks = this.tasks.filter((task) => {
      const matchesSearch =
        !this.searchQuery || task.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory =
        !this.categoryFilter || (task.category && task.category.toLowerCase().includes(this.categoryFilter.toLowerCase()));
      const matchesCompleted =
        this.completedFilter === undefined || task.completed === this.completedFilter;

      if (filterType === 'search') return matchesSearch;
      if (filterType === 'category') return matchesCategory;
      return matchesSearch && matchesCategory && matchesCompleted;
    });
  }

  applySorting(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.loadTasks();
  }

  onSearchInput(event: Event): void {
    this.searchFilterSubject.next((event.target as HTMLInputElement).value);
  }

  onCategoryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.categoryFilter = value;
    if (!value) {
      // Reset filteredTasks to all tasks when category filter is cleared
      this.filteredTasks = [...this.tasks];
      this.categoryFilterSubject.next('');
    } else {
      this.categoryFilterSubject.next(value);
    }
  }

  onCategoryClear(): void {
    this.categoryFilter = undefined;
    this.filteredTasks = [...this.tasks]; // Reset to all tasks
    this.applyFilters(false, 'category'); // Trigger server reload
  }

  getTagsAsString(tags: string[]): string {
    return tags.length ? tags.join(', ') : 'None';
  }

  openTaskDetails(task: Task): void {
    this.dialogService.open(TaskDetailsComponent, {
      header: `Details: ${task.title}`,
      width: '40rem',
      data: { task },
    });
  }
}
