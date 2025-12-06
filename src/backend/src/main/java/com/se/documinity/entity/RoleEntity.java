package com.se.documinity.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                                // cùng object
        if (o == null || getClass() != o.getClass()) return false; // khác class
        RoleEntity that = (RoleEntity) o;
        // nếu chưa có id (chưa persist) thì coi như khác
        return id != null && id.equals(that.id);
    }
    @Override
    public int hashCode() {
        // pattern hay dùng cho entity JPA
        return getClass().hashCode();
    }
}