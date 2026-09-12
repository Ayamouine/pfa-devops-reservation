package com.example.bookingservice.model;

public class ResourceDto {
    private Long id;
    private String name;
    private String category;
    private Integer capacity;
    private String location;
    private String equipment;
    private Double price;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getEquipment() { return equipment; }
    public void setEquipment(String equipment) { this.equipment = equipment; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
}