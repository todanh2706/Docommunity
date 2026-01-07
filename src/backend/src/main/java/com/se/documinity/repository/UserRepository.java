package com.se.documinity.repository;

import com.se.documinity.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByPhoneNumber(String phoneNumber);

    List<UserEntity> findByUsernameContainingIgnoreCaseOrFullnameContainingIgnoreCase(String username, String fullname);

    @Query(value = "SELECT COUNT(*) > 0 FROM user_follows WHERE follower_id = :followerId AND following_id = :followingId", nativeQuery = true)
    boolean isFollowing(@Param("followerId") Long followerId, @Param("followingId") Long followingId);
}
