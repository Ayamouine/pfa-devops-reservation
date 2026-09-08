package com.example.bookingservice.service;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.bookingservice.entity.ResourceEntity;
import com.example.bookingservice.repository.ResourceRepository;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<ResourceEntity> getAllActive() {
        return resourceRepository.findByActiveTrue();
    }

    public ResourceEntity getById(Long id) {
        return resourceRepository.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Resource not found"));
    }

    public ResourceEntity create(ResourceEntity resource) {
        resource.setId(null);
        return resourceRepository.save(resource);
    }

    public ResourceEntity update(Long id, ResourceEntity updated) {
        ResourceEntity existing = getById(id);
        existing.setName(updated.getName());
        existing.setCapacity(updated.getCapacity());
        existing.setLocation(updated.getLocation());
        existing.setEquipment(updated.getEquipment());
        existing.setPrice(updated.getPrice());
        existing.setActive(updated.getActive() == null ? true : updated.getActive());
        return resourceRepository.save(existing);
    }

    public void delete(Long id) {
        ResourceEntity existing = getById(id);
        resourceRepository.delete(existing);
    }
}
