package com.retainai.backend.repository;

import com.retainai.backend.entity.UploadBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UploadBatchRepository extends JpaRepository<UploadBatch, String> {

    List<UploadBatch> findAllByOrderByUploadedAtDesc();

    List<UploadBatch> findByUploadedByOrderByUploadedAtDesc(String uploadedBy);
}
