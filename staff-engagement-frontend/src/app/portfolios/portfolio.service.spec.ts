import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { PortfolioService } from './portfolio.service';
import {
  CreateEducationRequest,
  CreateProjectRequest,
  CreateShowcaseLinkRequest,
  PortfolioResponse
} from './portfolio.models';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let httpTesting: HttpTestingController;

  const employeeId = 1;
  const baseUrl = `http://localhost:8080/api/employees/${employeeId}/portfolio`;
  const mockPortfolio: PortfolioResponse = {
    employeeId,
    education: [{ id: 1, employeeId, institution: 'Uni', qualification: 'BSc', fieldOfStudy: null, startYear: 2016, endYear: 2020, description: null }],
    projects: [{ id: 2, employeeId, name: 'Project', description: null, startDate: null, endDate: null, url: null }],
    links: [{ id: 3, employeeId, label: 'GitHub', url: 'https://github.com', sortOrder: 1 }],
    skills: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PortfolioService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('getPortfolio() fetches the full portfolio', () => {
    let result: PortfolioResponse | undefined;
    service.getPortfolio(employeeId).subscribe(r => (result = r));
    httpTesting.expectOne(baseUrl).flush(mockPortfolio);
    expect(result?.employeeId).toBe(employeeId);
    expect(result?.education).toHaveLength(1);
  });

  it('addEducation() posts to the education endpoint', () => {
    const request: CreateEducationRequest = { institution: 'Uni', qualification: 'BSc' };
    service.addEducation(employeeId, request).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/education`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockPortfolio.education[0]);
  });

  it('updateEducation() puts to the education endpoint', () => {
    service.updateEducation(employeeId, 1, { institution: 'Uni', qualification: 'MSc' }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/education/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockPortfolio.education[0]);
  });

  it('deleteEducation() deletes the education endpoint', () => {
    service.deleteEducation(employeeId, 1).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/education/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('addProject() posts to the projects endpoint', () => {
    const request: CreateProjectRequest = { name: 'Project' };
    service.addProject(employeeId, request).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/projects`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockPortfolio.projects[0]);
  });

  it('updateProject() puts to the projects endpoint', () => {
    service.updateProject(employeeId, 2, { name: 'Updated' }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/projects/2`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockPortfolio.projects[0]);
  });

  it('deleteProject() deletes the projects endpoint', () => {
    service.deleteProject(employeeId, 2).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/projects/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('addLink() posts to the links endpoint', () => {
    const request: CreateShowcaseLinkRequest = { label: 'GitHub', url: 'https://github.com' };
    service.addLink(employeeId, request).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/links`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockPortfolio.links[0]);
  });

  it('updateLink() puts to the links endpoint', () => {
    service.updateLink(employeeId, 3, { label: 'GitHub', url: 'https://github.com' }).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/links/3`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockPortfolio.links[0]);
  });

  it('deleteLink() deletes the links endpoint', () => {
    service.deleteLink(employeeId, 3).subscribe();
    const req = httpTesting.expectOne(`${baseUrl}/links/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
