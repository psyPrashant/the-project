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
import { CreateInteractionRequest, InteractionFilter, InteractionResponse, UpdateInteractionRequest } from './interaction.models';
@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = stryMutAct_9fa48("412") ? `` : (stryCov_9fa48("412"), `${environment.apiUrl}/interactions`);
  create(request: CreateInteractionRequest): Observable<InteractionResponse> {
    if (stryMutAct_9fa48("413")) {
      {}
    } else {
      stryCov_9fa48("413");
      return this.http.post<InteractionResponse>(this.baseUrl, request);
    }
  }
  findBySubject(subjectId: number, filter?: InteractionFilter): Observable<InteractionResponse[]> {
    if (stryMutAct_9fa48("414")) {
      {}
    } else {
      stryCov_9fa48("414");
      let params = new HttpParams().set(stryMutAct_9fa48("415") ? "" : (stryCov_9fa48("415"), 'subjectId'), subjectId.toString());
      if (stryMutAct_9fa48("418") ? filter.type : stryMutAct_9fa48("417") ? false : stryMutAct_9fa48("416") ? true : (stryCov_9fa48("416", "417", "418"), filter?.type)) {
        if (stryMutAct_9fa48("419")) {
          {}
        } else {
          stryCov_9fa48("419");
          params = params.set(stryMutAct_9fa48("420") ? "" : (stryCov_9fa48("420"), 'type'), filter.type);
        }
      }
      if (stryMutAct_9fa48("423") ? filter?.authorId == null : stryMutAct_9fa48("422") ? false : stryMutAct_9fa48("421") ? true : (stryCov_9fa48("421", "422", "423"), (stryMutAct_9fa48("424") ? filter.authorId : (stryCov_9fa48("424"), filter?.authorId)) != null)) {
        if (stryMutAct_9fa48("425")) {
          {}
        } else {
          stryCov_9fa48("425");
          params = params.set(stryMutAct_9fa48("426") ? "" : (stryCov_9fa48("426"), 'authorId'), filter.authorId.toString());
        }
      }
      if (stryMutAct_9fa48("429") ? filter.date : stryMutAct_9fa48("428") ? false : stryMutAct_9fa48("427") ? true : (stryCov_9fa48("427", "428", "429"), filter?.date)) {
        if (stryMutAct_9fa48("430")) {
          {}
        } else {
          stryCov_9fa48("430");
          params = params.set(stryMutAct_9fa48("431") ? "" : (stryCov_9fa48("431"), 'date'), filter.date);
        }
      }
      return this.http.get<InteractionResponse[]>(this.baseUrl, stryMutAct_9fa48("432") ? {} : (stryCov_9fa48("432"), {
        params
      }));
    }
  }
  findById(id: number): Observable<InteractionResponse> {
    if (stryMutAct_9fa48("433")) {
      {}
    } else {
      stryCov_9fa48("433");
      return this.http.get<InteractionResponse>(stryMutAct_9fa48("434") ? `` : (stryCov_9fa48("434"), `${this.baseUrl}/${id}`));
    }
  }
  update(id: number, request: UpdateInteractionRequest): Observable<InteractionResponse> {
    if (stryMutAct_9fa48("435")) {
      {}
    } else {
      stryCov_9fa48("435");
      return this.http.put<InteractionResponse>(stryMutAct_9fa48("436") ? `` : (stryCov_9fa48("436"), `${this.baseUrl}/${id}`), request);
    }
  }
  delete(id: number): Observable<void> {
    if (stryMutAct_9fa48("437")) {
      {}
    } else {
      stryCov_9fa48("437");
      return this.http.delete<void>(stryMutAct_9fa48("438") ? `` : (stryCov_9fa48("438"), `${this.baseUrl}/${id}`));
    }
  }
}