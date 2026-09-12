package com.example.bookingservice.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.bookingservice.entity.ResourceEntity;
import com.example.bookingservice.model.ResourceDto;
import com.example.bookingservice.repository.ResourceRepository;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<ResourceDto> getAllResources() {
        return resourceRepository.findAll().stream().map(this::toDto).toList();
    }

    public ResourceDto createResource(ResourceDto dto) {
        ResourceEntity entity = new ResourceEntity();
        applyDto(entity, dto);
        return toDto(resourceRepository.save(entity));
    }

    public ResourceDto updateResource(Long id, ResourceDto dto) {
        ResourceEntity entity = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ressource introuvable"));
        applyDto(entity, dto);
        return toDto(resourceRepository.save(entity));
    }

    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ressource introuvable");
        }
        resourceRepository.deleteById(id);
    }

    private void applyDto(ResourceEntity entity, ResourceDto dto) {
        entity.setName(dto.getName());
        entity.setCategory(dto.getCategory());
        entity.setCapacity(dto.getCapacity());
        entity.setLocation(dto.getLocation());
        entity.setEquipment(dto.getEquipment());
        entity.setPrice(dto.getPrice());
        entity.setActive(true);
    }

    private ResourceDto toDto(ResourceEntity entity) {
        ResourceDto dto = new ResourceDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCategory(entity.getCategory());
        dto.setCapacity(entity.getCapacity());
        dto.setLocation(entity.getLocation());
        dto.setEquipment(entity.getEquipment());
        dto.setPrice(entity.getPrice());
        return dto;
    }
}