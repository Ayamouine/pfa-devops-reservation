package com.example.bookingservice.entity;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "resources")
public class ResourceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column
    private String type;

    @Column(nullable = false)
    private Integer capacity;

    @Column
    private String location;

    @Column
    private String building;

    @Column
    private String floor;

    @Column
    private String equipment;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "resource_equipment", joinColumns = @JoinColumn(name = "resource_id"))
    @Column(name = "equipment")
    private Set<String> equipments = new HashSet<>();

    @Column
    private String photo;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Boolean active = true;

    public ResourceEntity() {
    }

    public ResourceEntity(String name, String category, Integer capacity, String location, String equipment, Double price) {
        this.name = name;
        this.category = category;
        this.capacity = capacity;
        this.location = location;
        this.equipment = equipment;
        this.price = price;
        this.active = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }
    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
    public String getEquipment() { return equipment; }
    public void setEquipment(String equipment) { this.equipment = equipment; }
    public Set<String> getEquipments() { return equipments; }
    public void setEquipments(Set<String> equipments) { this.equipments = equipments; }
    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}