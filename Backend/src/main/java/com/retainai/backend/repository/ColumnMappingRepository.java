package com.retainai.backend.repository;

import com.retainai.backend.entity.ColumnMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ColumnMappingRepository extends JpaRepository<ColumnMapping, String> {

    List<ColumnMapping> findByBatchId(String batchId);

    List<ColumnMapping> findByBatchIdAndConfirmedTrue(String batchId);
}
