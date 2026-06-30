/**
 * Angular TestBed bootstrap for the standalone Vitest config used by Stryker.
 *
 * `ng test` (@angular/build:unit-test) initialises the TestBed automatically.
 * When Stryker runs `vitest` directly via vitest.config.ts it doesn't get that
 * bootstrap, so we replicate the minimum required here.
 *
 * This file is referenced in vitest.config.ts `setupFiles` and MUST NOT be
 * imported by application code.
 */
import { NgModule } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

@NgModule({})
class TestModule {}

const ANGULAR_TESTBED_SETUP = Symbol.for('@angular/cli/testbed-setup');
if (!(globalThis as Record<symbol, unknown>)[ANGULAR_TESTBED_SETUP]) {
  (globalThis as Record<symbol, unknown>)[ANGULAR_TESTBED_SETUP] = true;

  getTestBed().initTestEnvironment(
    [BrowserTestingModule, TestModule],
    platformBrowserTesting(),
    { errorOnUnknownElements: true, errorOnUnknownProperties: true }
  );
}
