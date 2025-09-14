package com.Mybeez.TeamB.TeamB.repository;

import com.Mybeez.TeamB.TeamB.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {


    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    long countByActive(boolean active);

    long countByBanned(boolean banned);
    long countByDeleted(boolean deleted);


    @Query("SELECT u FROM User u LEFT JOIN FETCH u.experiences WHERE u.email = :email")
    Optional<User> findByEmailWithExperiences(@Param("email") String email);

}