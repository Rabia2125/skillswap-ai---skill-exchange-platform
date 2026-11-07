# SkillSwap AI - Software Testing & QA Report

**Course / Project:** Software Construction & Development (SCD)  
**Testing Frameworks:** Pytest, FastAPI TestClient, In-App Interactive Test Engine  
**Execution Status:** ALL 21 TEST CASES PASSED (100% Success Rate)  

---

## 1. Traceability Matrix & Execution Summary

| Test ID | Module | Scenario Tested | Expected Result | Execution Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Auth | Register valid user | HTTP 201, User Created, JWT Issued | **PASS** |
| **TC-02** | Auth | Register duplicate email | HTTP 409 Conflict, Rejection | **PASS** |
| **TC-03** | Auth | Login valid credentials | HTTP 200, JWT Issued | **PASS** |
| **TC-04** | Auth | Login wrong password | HTTP 401 Unauthorized | **PASS** |
| **TC-05** | Auth | Access protected route | HTTP 401 Unauthorized | **PASS** |
| **TC-06** | Profile | Update profile details | HTTP 200, Data Persisted | **PASS** |
| **TC-07** | Profile | Add skill & sync browse | Skill appears in Browse Skills | **PASS** |
| **TC-08** | Profile | Submit invalid profile | HTTP 400 Validation Error | **PASS** |
| **TC-09** | Discovery| Search existing skill | Returns matching user profiles | **PASS** |
| **TC-10** | Discovery| Filter by category | Returns profiles in category | **PASS** |
| **TC-11** | Discovery| Search non-existing skill | Empty array without error | **PASS** |

---

## 2. Guest User Security Verification (GTC-01 to GTC-10)

| Test ID | Security Scenario | Protection Enforcement | Result |
| :--- | :--- | :--- | :--- |
| **GTC-01** | Access landing page | Public route rendered | **PASS** |
| **GTC-02** | Browse skill categories | 14 categories accessible to public | **PASS** |
| **GTC-03** | View public skill listings | Private email addresses omitted/sanitized | **PASS** |
| **GTC-04** | Send swap request as guest | Action intercepted, auth modal prompted | **PASS** |
| **GTC-05** | Access private profile | HTTP 401 on backend, denied on frontend | **PASS** |
| **GTC-06** | Access chat as guest | HTTP 401 on backend, denied on frontend | **PASS** |
| **GTC-07** | Access AI Assistant as guest | HTTP 401 on backend, denied on frontend | **PASS** |
| **GTC-08** | Access dashboard URL direct | Route guard redirects to auth modal | **PASS** |
| **GTC-09** | Navigate to Sign Up | Modal opens with validation checks | **PASS** |
| **GTC-10** | Navigate to Login | Modal opens with credentials check | **PASS** |

---

## 3. Real-Time Interactive In-App Verification

In addition to static test suites, SkillSwap AI includes an **in-app Automated SCD Test Runner** (accessible via the `SCD Tests` button in the top navigation bar). Clicking this button executes all 21 test scenarios against the active backend server live, records response durations, and renders individual execution logs.
