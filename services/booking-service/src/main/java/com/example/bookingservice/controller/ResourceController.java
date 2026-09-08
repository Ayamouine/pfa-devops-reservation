package com.example.bookingservice.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.bookingservice.entity.ResourceEntity;
import com.example.bookingservice.service.ResourceService;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public List<ResourceEntity> list() {
        return resourceService.getAllActive();
    }

    @GetMapping("/{id}")
    public ResourceEntity get(@PathVariable Long id) {
        return resourceService.getById(id);
    }

    @PostMapping
    public ResponseEntity<ResourceEntity> create(@RequestBody ResourceEntity resource) {
        return ResponseEntity.ok(resourceService.create(resource));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceEntity> update(@PathVariable Long id, @RequestBody ResourceEntity resource) {
        return ResponseEntity.ok(resourceService.update(id, resource));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
