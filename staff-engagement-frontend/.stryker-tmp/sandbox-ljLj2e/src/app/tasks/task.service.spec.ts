// @ts-nocheck
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TaskService } from './task.service';
import {
  CreateStandaloneTaskRequest,
  CreateTaskFromInteractionRequest,
  Task,
  UpdateTaskStatusRequest
} from './task.models';

describe('TaskService', () => {
  let service: TaskService;
  let httpTesting: HttpTestingController;

  const baseUrl = 'http://localhost:8080/api/tasks';

  const mockEmployee = { id: 1, email: 'a@example.com', firstName: 'A', lastName: 'B' };
  const mockTask: Task = {
    id: 1,
    title: 'Test task',
    description: null,
    status: 'OPEN',
    relatesTo: mockEmployee,
    createdBy: mockEmployee,
    fromInteractionId: null,
    dueDate: null,
    assignee: null,
    createdAt: '2026-06-29T10:00:00',
    updatedAt: '2026-06-29T10:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TaskService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('createFromInteraction() posts to /from-interaction', () => {
    const request: CreateTaskFromInteractionRequest = { interactionId: 5, title: 'Follow up' };
    let result: Task | undefined;
    service.createFromInteraction(request).subscribe(r => (result = r));

    const req = httpTesting.expectOne(`${baseUrl}/from-interaction`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ ...mockTask, fromInteractionId: 5 });

    expect(result?.fromInteractionId).toBe(5);
  });

  it('createStandalone() posts to base URL', () => {
    const request: CreateStandaloneTaskRequest = { relatesToId: 2, title: 'Check in' };
    let result: Task | undefined;
    service.createStandalone(request).subscribe(r => (result = r));

    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockTask);

    expect(result).toEqual(mockTask);
  });

  it('getMyTasks() fetches /mine', () => {
    let result: Task[] | undefined;
    service.getMyTasks().subscribe(r => (result = r));

    const req = httpTesting.expectOne(`${baseUrl}/mine`);
    expect(req.request.method).toBe('GET');
    req.flush([mockTask]);

    expect(result).toEqual([mockTask]);
  });

  it('updateStatus() patches to /:id/status', () => {
    const request: UpdateTaskStatusRequest = { status: 'DONE' };
    let result: Task | undefined;
    service.updateStatus(1, request).subscribe(r => (result = r));

    const req = httpTesting.expectOne(`${baseUrl}/1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(request);
    req.flush({ ...mockTask, status: 'DONE' });

    expect(result?.status).toBe('DONE');
  });
});
