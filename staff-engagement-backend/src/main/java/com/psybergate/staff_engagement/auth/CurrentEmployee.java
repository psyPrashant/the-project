package com.psybergate.staff_engagement.auth;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Controller parameter annotation resolved to the authenticated {@link
 * com.psybergate.staff_engagement.employee.Employee} (D3). Keeps Spring Security types out of
 * domain controllers.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentEmployee {
}