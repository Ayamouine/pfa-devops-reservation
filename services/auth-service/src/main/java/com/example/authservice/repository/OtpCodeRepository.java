package com.example.authservice.repository;

import com.example.authservice.entity.OtpCode;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {

    List<OtpCode> findByOwnerAndPurposeOrderByIdDesc(String owner, String purpose);

    Optional<OtpCode> findTopByOwnerAndPurposeAndUsedFalseOrderByIdDesc(String owner, String purpose);

    long deleteByOwnerAndPurpose(String owner, String purpose);
}
