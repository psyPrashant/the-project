import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { LoginComponent } from './login';
import { AuthService } from '../auth.service';

describe('LoginComponent', () => {
  let loginSubject: Subject<unknown>;
  let authServiceSpy: { login: ReturnType<typeof vi.fn> } & Partial<AuthService>;

  beforeEach(() => {
    loginSubject = new Subject<unknown>();
    authServiceSpy = {
      login: vi.fn().mockReturnValue(loginSubject.asObservable()),
      currentUser: () => null,
      isAuthenticated: () => false
    } as unknown as typeof authServiceSpy;

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } }
        }
      ]
    });
  });

  const component = () => TestBed.createComponent(LoginComponent).componentInstance as unknown as {
    form: { setValue(v: unknown): void; invalid: boolean; valid: boolean };
    onSubmit(): void;
    errorMessage(): string | null;
  };

  it('is invalid when empty and valid when filled', () => {
    const c = component();
    expect(c.form.invalid).toBe(true);

    c.form.setValue({ email: 'admin@psybergate.com', password: 'password123' });
    expect(c.form.valid).toBe(true);
  });

  it('rejects an invalid email', () => {
    const c = component();
    c.form.setValue({ email: 'not-an-email', password: 'password123' });
    expect(c.form.invalid).toBe(true);
  });

  it('calls the auth service on submit and navigates to /home on success', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    const c = fixture.componentInstance as unknown as {
      form: { setValue(v: unknown): void };
      onSubmit(): void;
    };

    c.form.setValue({ email: 'admin@psybergate.com', password: 'password123' });
    c.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledTimes(1);
    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'admin@psybergate.com',
      password: 'password123'
    });

    loginSubject.next({ token: 't', employeeId: 1, email: 'a', firstName: 'Admin', lastName: 'User' });
    expect(navigateSpy).toHaveBeenCalledWith('/home');
  });

  it('shows an error message on a failed login', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const c = fixture.componentInstance as unknown as {
      form: { setValue(v: unknown): void };
      onSubmit(): void;
      errorMessage(): string | null;
    };

    c.form.setValue({ email: 'admin@psybergate.com', password: 'password123' });
    fixture.detectChanges();
    c.onSubmit();
    loginSubject.error({ status: 401 });
    fixture.detectChanges();

    expect(c.errorMessage()).toBe('Invalid email or password.');
  });
});