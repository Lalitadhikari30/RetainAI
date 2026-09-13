package com.retainai.backend.repository;

import com.retainai.backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {

    /** All active employees — for HR_ADMIN */
    List<Employee> findByActiveTrue();

    /** Only employees managed by a specific user — for MANAGER role */
    List<Employee> findByManagerIdAndActiveTrue(String managerId);

    /** Filter by department — HR_ADMIN */
    List<Employee> findByDepartmentAndActiveTrue(String department);

    /** Filter by department — MANAGER (role-scoped) */
    List<Employee> findByDepartmentAndManagerIdAndActiveTrue(String department, String managerId);

    /** Find by employee number */
    Optional<Employee> findByEmployeeNumber(Integer employeeNumber);

    /** Role-scoped single employee lookup — MANAGER can only see their own reports */
    @Query("SELECT e FROM Employee e WHERE e.id = :empId AND e.managerId = :managerId AND e.active = true")
    Optional<Employee> findByIdAndManagerId(@Param("empId") String empId, @Param("managerId") String managerId);

    /** Count by department for analytics */
    @Query("SELECT e.department, COUNT(e) FROM Employee e WHERE e.active = true GROUP BY e.department")
    List<Object[]> countByDepartment();
}
