package com.Mybeez.TeamB.TeamB.repository;

import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.model.UserRole;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

public class UserSpecification implements Specification<User> {

    private final String search;
    private final UserRole role;
    private final Boolean active;

    public UserSpecification(String search, UserRole role, Boolean active) {
        this.search = (search == null) ? "" : search.toLowerCase();
        this.role = role;
        this.active = active;
    }

    @Override
    public Predicate toPredicate(Root<User> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        List<Predicate> predicates = new ArrayList<>();

        if (!search.isEmpty()) {
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("email")), "%" + search + "%"),
                    cb.like(cb.lower(root.get("firstName")), "%" + search + "%"),
                    cb.like(cb.lower(root.get("lastName")), "%" + search + "%")
            ));
        }

        if (role != null) {
            predicates.add(cb.equal(root.get("role"), role));
        }

        if (active != null) {
            predicates.add(cb.equal(root.get("active"), active));
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    }
}
