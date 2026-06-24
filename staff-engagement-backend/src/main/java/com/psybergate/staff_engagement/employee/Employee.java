package com.psybergate.staff_engagement.employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Central identity record for the platform (D3 — every user is an Employee).
 *
 * <p>This is the <em>identity slice</em>: only the fields needed to authenticate a caller and
 * resolve them to a person. Skills, portfolios, interactions and tasks are added by later epics.
 */
@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String firstName;

	@Column(nullable = false)
	private String lastName;

	@Column(nullable = false, unique = true)
	private String email;

	/** BCrypt hash — never plaintext, never logged, never serialized over the API. */
	@Column(nullable = false)
	private String passwordHash;
}