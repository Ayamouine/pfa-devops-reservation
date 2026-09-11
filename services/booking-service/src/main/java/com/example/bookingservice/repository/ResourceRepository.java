package com.example.bookingservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bookingservice.entity.ResourceEntity;

public interface ResourceRepository extends JpaRepository<ResourceEntity, Long> {
    boolean existsByNameIgnoreCase(String name);
}