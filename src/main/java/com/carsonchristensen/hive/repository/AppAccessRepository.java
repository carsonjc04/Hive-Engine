package com.carsonchristensen.hive.repository;

import com.carsonchristensen.hive.model.AppAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppAccessRepository extends JpaRepository<AppAccess, Long> {
    List<AppAccess> findByEmployeeId(Long employeeId);
}

