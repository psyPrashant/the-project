// @ts-nocheck
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EmployeeService } from './employee.service';
import { EmployeeProfileResponse } from './employee.models';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpTesting: HttpTestingController;

  const baseUrl = 'http://localhost:8080/api/employees';
  const mockEmployee: EmployeeProfileResponse = {
    id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com',
    jobTitle: 'Engineer', department: 'Tech', phone: null, archived: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(EmployeeService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('getAll() requests all employees without search param', () => {
    service.getAll().subscribe();
    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockEmployee]);
  });

  it('getAll() sends search as query param when provided', () => {
    service.getAll('Alice').subscribe();
    const req = httpTesting.expectOne(`${baseUrl}?search=Alice`);
    expect(req.request.method).toBe('GET');
    req.flush([mockEmployee]);
  });

  it('getAll() returns empty array when search has no matches', () => {
    let result: EmployeeProfileResponse[] = [mockEmployee];
    service.getAll('NoMatch').subscribe(r => (result = r));
    httpTesting.expectOne(`${baseUrl}?search=NoMatch`).flush([]);
    expect(result).toEqual([]);
  });

  it('getProfile() fetches the employee by id', () => {
    let result: EmployeeProfileResponse | undefined;
    service.getProfile(1).subscribe(r => (result = r));
    httpTesting.expectOne(`${baseUrl}/1`).flush(mockEmployee);
    expect(result?.id).toBe(1);
    expect(result?.email).toBe('alice@example.com');
  });

  it('create() posts to the base URL', () => {
    service.create({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' }).subscribe();
    const req = httpTesting.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toMatchObject({ firstName: 'Alice' });
    req.flush(mockEmployee);
  });

  it('update() puts to /employees/:id', () => {
    service.update(1, { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockEmployee);
  });

  it('archive() patches /employees/:id/archive', () => {
    service.archive(1).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/1/archive`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });
});
