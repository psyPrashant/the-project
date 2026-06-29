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
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateStandaloneTaskRequest, CreateTaskFromInteractionRequest, Task, UpdateTaskStatusRequest } from './task.models';
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = stryMutAct_9fa48("582") ? `` : (stryCov_9fa48("582"), `${environment.apiUrl}/tasks`);
  createFromInteraction(request: CreateTaskFromInteractionRequest): Observable<Task> {
    if (stryMutAct_9fa48("583")) {
      {}
    } else {
      stryCov_9fa48("583");
      return this.http.post<Task>(stryMutAct_9fa48("584") ? `` : (stryCov_9fa48("584"), `${this.baseUrl}/from-interaction`), request);
    }
  }
  createStandalone(request: CreateStandaloneTaskRequest): Observable<Task> {
    if (stryMutAct_9fa48("585")) {
      {}
    } else {
      stryCov_9fa48("585");
      return this.http.post<Task>(this.baseUrl, request);
    }
  }
  getMyTasks(): Observable<Task[]> {
    if (stryMutAct_9fa48("586")) {
      {}
    } else {
      stryCov_9fa48("586");
      return this.http.get<Task[]>(stryMutAct_9fa48("587") ? `` : (stryCov_9fa48("587"), `${this.baseUrl}/mine`));
    }
  }
  updateStatus(id: number, request: UpdateTaskStatusRequest): Observable<Task> {
    if (stryMutAct_9fa48("588")) {
      {}
    } else {
      stryCov_9fa48("588");
      return this.http.patch<Task>(stryMutAct_9fa48("589") ? `` : (stryCov_9fa48("589"), `${this.baseUrl}/${id}/status`), request);
    }
  }
}