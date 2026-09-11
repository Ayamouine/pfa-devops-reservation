package com.example.bookingservice.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.bookingservice.model.ResourceDto;
import com.example.bookingservice.service.ResourceService;

@RestController
@CrossOrigin(origins = "http://localhost:3001")
@RequestMapping("/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public List<ResourceDto> getAll() {
        return resourceService.getAllResources();
    }

    @PostMapping
    public ResourceDto create(@RequestBody ResourceDto dto) {
        return resourceService.createResource(dto);
    }

    @PutMapping("/{id}")
    public ResourceDto update(@PathVariable Long id, @RequestBody ResourceDto dto) {
        return resourceService.updateResource(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        resourceService.deleteResource(id);
    }
}