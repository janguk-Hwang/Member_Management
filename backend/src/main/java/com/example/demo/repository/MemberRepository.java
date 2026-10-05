package com.example.demo.repository;

import com.example.demo.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    java.util.Optional<Member> findByName(String name);
    Page<Member> findByNameContaining(String name, Pageable pageable);
}
