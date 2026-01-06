package com.se.documinity.repository;

import com.se.documinity.entity.VerificationTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationTokenEntity, Long> {
    Optional<VerificationTokenEntity> findByToken(String token);

    Optional<VerificationTokenEntity> findByTokenAndUser_Email(String token, String email);
}
