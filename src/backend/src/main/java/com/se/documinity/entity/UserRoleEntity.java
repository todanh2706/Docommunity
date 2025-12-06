package com.se.documinity.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_roles")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRoleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private RoleEntity role;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                                // cùng object
        if (o == null || getClass() != o.getClass()) return false; // khác class
        UserRoleEntity that = (UserRoleEntity) o;
        // nếu chưa có id (chưa persist) thì coi như khác
        return id != null && id.equals(that.id);
    }
    @Override
    public int hashCode() {
        // pattern hay dùng cho entity JPA
        return getClass().hashCode();
    }
}