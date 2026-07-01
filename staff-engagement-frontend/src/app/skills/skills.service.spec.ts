import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SkillsService } from './skills.service';
import { EmployeeSkillResponse, SkillSearchResultResponse, SkillSummaryResponse } from './skills.models';

describe('SkillsService', () => {
  let service: SkillsService;
  let httpTesting: HttpTestingController;

  const employeeId = 1;
  const apiBase = 'http://localhost:8080/api';
  const mockSkill: EmployeeSkillResponse = { id: 10, employeeId, skillId: 1, skillName: 'Angular', years: 4, projectCount: 2 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SkillsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('getEmployeeSkills() fetches skills for an employee', () => {
    let result: EmployeeSkillResponse[] | undefined;
    service.getEmployeeSkills(employeeId).subscribe(r => (result = r));
    httpTesting.expectOne(`${apiBase}/employees/${employeeId}/skills`).flush([mockSkill]);
    expect(result).toHaveLength(1);
    expect(result![0].skillName).toBe('Angular');
  });

  it('addSkill() posts to the employee skills endpoint', () => {
    service.addSkill(employeeId, { skillName: 'Angular', years: 4 }).subscribe();
    const req = httpTesting.expectOne(`${apiBase}/employees/${employeeId}/skills`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ skillName: 'Angular', years: 4 });
    req.flush(mockSkill);
  });

  it('deleteSkill() sends DELETE to the skill endpoint', () => {
    service.deleteSkill(employeeId, 10).subscribe();
    const req = httpTesting.expectOne(`${apiBase}/employees/${employeeId}/skills/10`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('browseRegister() fetches all canonical skills', () => {
    const summary: SkillSummaryResponse = { id: 1, name: 'Angular', employeeCount: 3 };
    let result: SkillSummaryResponse[] | undefined;
    service.browseRegister().subscribe(r => (result = r));
    httpTesting.expectOne(`${apiBase}/skills`).flush([summary]);
    expect(result).toHaveLength(1);
    expect(result![0].name).toBe('Angular');
  });

  it('searchBySkill() calls the search endpoint with the skill param', () => {
    const searchResult: SkillSearchResultResponse = { employeeId: 2, employeeName: 'Jane Doe', skillName: 'Angular', years: 6, projectCount: 1 };
    let result: SkillSearchResultResponse[] | undefined;
    service.searchBySkill('Angular').subscribe(r => (result = r));
    const req = httpTesting.expectOne(r => r.url === `${apiBase}/skills/search`);
    expect(req.request.params.get('skill')).toBe('Angular');
    req.flush([searchResult]);
    expect(result).toHaveLength(1);
    expect(result![0].employeeName).toBe('Jane Doe');
  });
});
