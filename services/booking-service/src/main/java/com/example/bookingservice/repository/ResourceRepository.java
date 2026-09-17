package com.example.bookingservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bookingservice.entity.ResourceEntity;

public interface ResourceRepository extends JpaRepository<ResourceEntity, Long> {
    boolean existsByNameIgnoreCase(String name);
    Optional<ResourceEntity> findByNameIgnoreCase(String name);
}