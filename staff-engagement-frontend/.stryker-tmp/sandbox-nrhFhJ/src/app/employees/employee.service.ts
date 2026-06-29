// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateEmployeeRequest, EmployeeProfileResponse, UpdateEmployeeRequest } from './employee.models';
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = stryMutAct_9fa48("174") ? `` : (stryCov_9fa48("174"), `${environment.apiUrl}/employees`);
  getAll(search?: string): Observable<EmployeeProfileResponse[]> {
    if (stryMutAct_9fa48("175")) {
      {}
    } else {
      stryCov_9fa48("175");
      const params = search ? new HttpParams().set(stryMutAct_9fa48("176") ? "" : (stryCov_9fa48("176"), 'search'), search) : undefined;
      return this.http.get<EmployeeProfileResponse[]>(this.baseUrl, stryMutAct_9fa48("177") ? {} : (stryCov_9fa48("177"), {
        params
      }));
    }
  }
  getProfile(id: number): Observable<EmployeeProfileResponse> {
    if (stryMutAct_9fa48("178")) {
      {}
    } else {
      stryCov_9fa48("178");
      return this.http.get<EmployeeProfileResponse>(stryMutAct_9fa48("179") ? `` : (stryCov_9fa48("179"), `${this.baseUrl}/${id}`));
    }
  }
  create(request: CreateEmployeeRequest): Observable<EmployeeProfileResponse> {
    if (stryMutAct_9fa48("180")) {
      {}
    } else {
      stryCov_9fa48("180");
      return this.http.post<EmployeeProfileResponse>(this.baseUrl, request);
    }
  }
  update(id: number, request: UpdateEmployeeRequest): Observable<EmployeeProfileResponse> {
    if (stryMutAct_9fa48("181")) {
      {}
    } else {
      stryCov_9fa48("181");
      return this.http.put<EmployeeProfileResponse>(stryMutAct_9fa48("182") ? `` : (stryCov_9fa48("182"), `${this.baseUrl}/${id}`), request);
    }
  }
  archive(id: number): Observable<void> {
    if (stryMutAct_9fa48("183")) {
      {}
    } else {
      stryCov_9fa48("183");
      return this.http.patch<void>(stryMutAct_9fa48("184") ? `` : (stryCov_9fa48("184"), `${this.baseUrl}/${id}/archive`), null);
    }
  }
}