[1mdiff --git a/services/booking-service/src/main/java/com/example/bookingservice/entity/ResourceEntity.java b/services/booking-service/src/main/java/com/example/bookingservice/entity/ResourceEntity.java[m
[1mindex 27b5e203..04be0559 100644[m
[1m--- a/services/booking-service/src/main/java/com/example/bookingservice/entity/ResourceEntity.java[m
[1m+++ b/services/booking-service/src/main/java/com/example/bookingservice/entity/ResourceEntity.java[m
[36m@@ -6,9 +6,10 @@[m [mimport jakarta.persistence.GeneratedValue;[m
 import jakarta.persistence.GenerationType;[m
 import jakarta.persistence.Id;[m
 import jakarta.persistence.Table;[m
[32m+[m[32mimport jakarta.persistence.UniqueConstraint;[m
 [m
 @Entity[m
[31m-@Table(name = "resources")[m
[32m+[m[32m@Table(name = "resources", uniqueConstraints = @UniqueConstraint(columnNames = {"name"}))[m
 public class ResourceEntity {[m
 [m
     @Id[m
[36m@@ -19,85 +20,32 @@[m [mpublic class ResourceEntity {[m
     private String name;[m
 [m
     @Column(nullable = false)[m
[31m-    private Integer capacity;[m
[32m+[m[32m    private String category;[m
 [m
[31m-    @Column[m
[31m-    private String location;[m
[31m-[m
[31m-    @Column[m
[31m-    private String equipment;[m
[31m-[m
[31m-    @Column[m
[31m-    private Double price;[m
[32m+[m[32m    @Column(nullable = false)[m
[32m+[m[32m    private int capacity;[m
 [m
     @Column(nullable = false)[m
[31m-    private Boolean active = true;[m
[32m+[m[32m    private double price;[m
 [m
     public ResourceEntity() {[m
     }[m
 [m
[31m-    public ResourceEntity(String name, Integer capacity, String location, String equipment, Double price) {[m
[32m+[m[32m    public ResourceEntity(String name, String category, int capacity, double price) {[m
         this.name = name;[m
[32m+[m[32m        this.category = category;[m
         this.capacity = capacity;[m
[31m-        this.location = location;[m
[31m-        this.equipment = equipment;[m
         this.price = price;[m
[31m-        this.active = true;[m
[31m-    }[m
[31m-[m
[31m-    public Long getId() {[m
[31m-        return id;[m
[31m-    }[m
[31m-[m
[31m-    public void setId(Long id) {[m
[31m-        this.id = id;[m
[31m-    }[m
[31m-[m
[31m-    public String getName() {[m
[31m-        return name;[m
[31m-    }[m
[31m-[m
[31m-    public void setName(String name) {[m
[31m-        this.name = name;[m
[31m-    }[m
[31m-[m
[31m-    public Integer getCapacity() {[m
[31m-        return capacity;[m
[31m-    }[m
[31m-[m
[31m-    public void setCapacity(Integer capacity) {[m
[31m-        this.capacity = capacity;[m
     }[m
 [m
[31m-    public String getLocation() {[m
[31m-        return location;[m
[31m-    }[m
[31m-[m
[31m-    public void setLocation(String location) {[m
[31m-        this.location = location;[m
[31m-    }[m
[31m-[m
[31m-    public String getEquipment() {[m
[31m-        return equipment;[m
[31m-    }[m
[31m-[m
[31m-    public void setEquipment(String equipment) {[m
[31m-        this.equipment = equipment;[m
[31m-    }[m
[31m-[m
[31m-    public Double getPrice() {[m
[31m-        return price;[m
[31m-    }[m
[31m-[m
[31m-    public void setPrice(Double price) {[m
[31m-        this.price = price;[m
[31m-    }[m
[31m-[m
[31m-    public Boolean getActive() {[m
[31m-        return active;[m
[31m-    }[m
[31m-[m
[31m-    public void setActive(Boolean active) {[m
[31m-        this.active = active;[m
[31m-    }[m
[31m-}[m
[32m+[m[32m    public Long getId() { return id; }[m
[32m+[m[32m    public void setId(Long id) { this.id = id; }[m
[32m+[m[32m    public String getName() { return name; }[m
[32m+[m[32m    public void setName(String name) { this.name = name; }[m
[32m+[m[32m    public String getCategory() { return category; }[m
[32m+[m[32m    public void setCategory(String category) { this.category = category; }[m
[32m+[m[32m    public int getCapacity() { return capacity; }[m
[32m+[m[32m    public void setCapacity(int capacity) { this.capacity = capacity; }[m
[32m+[m[32m    public double getPrice() { return price; }[m
[32m+[m[32m    public void setPrice(double price) { this.price = price; }[m
[32m+[m[32m}[m
\ No newline at end of file[m
