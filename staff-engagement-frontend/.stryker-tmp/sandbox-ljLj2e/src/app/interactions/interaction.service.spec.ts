// @ts-nocheck
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { InteractionService } from './interaction.service';
import { CreateInteractionRequest, InteractionFilter, InteractionResponse, InteractionType, UpdateInteractionRequest } from './interaction.models';

describe('InteractionService', () => {
  let service: InteractionService;
  let httpTesting: HttpTestingController;

  const baseUrl = 'http://localhost:8080/api/interactions';
  const mockEmployee = { id: 2, email: 'bob@example.com', firstName: 'Bob', lastName: 'Jones' };
  const mockInteraction: InteractionResponse = {
    id: 1,
    author: { id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith' },
    subject: mockEmployee,
    note: 'Discussed project progress',
    type: InteractionType.MEETING,
    date: '2026-06-25'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(InteractionService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('create() posts to the base URL', () => {
    const request: CreateInteractionRequest = {
      subjectId: 2,
      note: 'Discussed project progress',
      type: InteractionType.MEETING,
      date: '2026-06-25'
    };

    let result: InteractionResponse | undefined;
    service.create(request).subscribe(r => (result = r));

    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockInteraction);

    expect(result).toEqual(mockInteraction);
  });

  it('findBySubject() sends subjectId as query param', () => {
    let result: InteractionResponse[] | undefined;
    service.findBySubject(2).subscribe(r => (result = r));

    const req = httpTesting.expectOne(`${baseUrl}?subjectId=2`);
    expect(req.request.method).toBe('GET');
    req.flush([mockInteraction]);

    expect(result).toEqual([mockInteraction]);
  });

  it('findBySubject() appends filter params when provided', () => {
    const filter: InteractionFilter = {
      type: InteractionType.MEETING,
      authorId: 5,
      date: '2026-06-25'
    };
    let result: InteractionResponse[] | undefined;
    service.findBySubject(2, filter).subscribe(r => (result = r));

    const req = httpTesting.expectOne(`${baseUrl}?subjectId=2&type=MEETING&authorId=5&date=2026-06-25`);
    expect(req.request.method).toBe('GET');
    req.flush([mockInteraction]);

    expect(result).toEqual([mockInteraction]);
  });

  it('findBySubject() omits empty filter params', () => {
    const filter: InteractionFilter = { type: InteractionType.NOTE, authorId: null, date: null };
    let result: InteractionResponse[] | undefined;
    service.findBySubject(3, filter).subscribe(r => (result = r));

    const req = httpTesting.expectOne(`${baseUrl}?subjectId=3&type=NOTE`);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    expect(result).toEqual([]);
  });

  it('findById() fetches interaction by id', () => {
    let result: InteractionResponse | undefined;
    service.findById(1).subscribe(r => (result = r));

    const req = httpTesting.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockInteraction);

    expect(result).toEqual(mockInteraction);
  });

  it('update() puts to /interactions/:id', () => {
    const request: UpdateInteractionRequest = {
      subjectId: 2,
      note: 'Updated note',
      type: InteractionType.CALL,
      date: '2026-06-26'
    };

    let result: InteractionResponse | undefined;
    service.update(1, request).subscribe(r => (result = r));

    const req = httpTesting.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({ ...mockInteraction, note: 'Updated note', type: InteractionType.CALL, date: '2026-06-26' });

    expect(result?.note).toBe('Updated note');
  });

  it('delete() sends DELETE to /interactions/:id', () => {
    let completed = false;
    service.delete(1).subscribe({ complete: () => (completed = true) });

    const req = httpTesting.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completed).toBe(true);
  });
});
